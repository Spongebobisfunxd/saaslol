import { getDb } from '../../db/connection';
import { AppError } from '../../middleware/errorHandler';
import { GrantConsentDto, RevokeConsentDto, CreateConsentTemplateDto } from './types';

export class ConsentService {
  async getCustomerConsents(tenantId: string, customerId: string) {
    const db = getDb();

    const consents = await db('consents')
      .where({ tenant_id: tenantId, customer_id: customerId })
      .orderBy('channel', 'asc');

    return consents;
  }

  async grantConsent(tenantId: string, dto: GrantConsentDto) {
    const db = getDb();

    return db.transaction(async (trx) => {
      // Verify customer exists
      const customer = await trx('customers')
        .where({ id: dto.customerId, tenant_id: tenantId })
        .first();

      if (!customer) {
        throw new AppError(404, 'Customer not found');
      }

      // Upsert consent record
      const existing = await trx('consents')
        .where({
          tenant_id: tenantId,
          customer_id: dto.customerId,
          channel: dto.channel,
        })
        .first();

      let consent;

      if (existing) {
        [consent] = await trx('consents')
          .where({ id: existing.id })
          .update({
            granted: true,
            granted_at: trx.fn.now(),
            revoked_at: null,
            updated_at: trx.fn.now(),
          })
          .returning('*');
      } else {
        [consent] = await trx('consents')
          .insert({
            tenant_id: tenantId,
            customer_id: dto.customerId,
            channel: dto.channel,
            granted: true,
            granted_at: trx.fn.now(),
          })
          .returning('*');
      }

      // Insert append-only audit log entry
      await trx('consent_audit_log').insert({
        tenant_id: tenantId,
        customer_id: dto.customerId,
        consent_id: consent.id,
        channel: dto.channel,
        action: 'grant',
        ip_address: dto.ipAddress || null,
        user_agent: dto.userAgent || null,
      });

      return consent;
    });
  }

  async revokeConsent(tenantId: string, dto: RevokeConsentDto) {
    const db = getDb();

    return db.transaction(async (trx) => {
      // Find existing consent
      const existing = await trx('consents')
        .where({
          tenant_id: tenantId,
          customer_id: dto.customerId,
          channel: dto.channel,
        })
        .first();

      if (!existing) {
        throw new AppError(404, 'Consent record not found');
      }

      if (!existing.granted) {
        throw new AppError(400, 'Consent is already revoked');
      }

      // Update consent to revoked
      const [consent] = await trx('consents')
        .where({ id: existing.id })
        .update({
          granted: false,
          revoked_at: trx.fn.now(),
          updated_at: trx.fn.now(),
        })
        .returning('*');

      // Insert append-only audit log entry
      await trx('consent_audit_log').insert({
        tenant_id: tenantId,
        customer_id: dto.customerId,
        consent_id: consent.id,
        channel: dto.channel,
        action: 'revoke',
        ip_address: dto.ipAddress || null,
        user_agent: dto.userAgent || null,
      });

      return consent;
    });
  }

  async checkConsent(
    tenantId: string,
    customerId: string,
    channel: string,
  ): Promise<boolean> {
    const db = getDb();

    const consent = await db('consents')
      .where({
        tenant_id: tenantId,
        customer_id: customerId,
        channel,
        granted: true,
      })
      .first();

    return !!consent;
  }

  async getAuditLog(tenantId: string, customerId: string) {
    const db = getDb();

    const logs = await db('consent_audit_log')
      .where({ tenant_id: tenantId, customer_id: customerId })
      .orderBy('created_at', 'desc');

    return logs;
  }

  async listTemplates(tenantId: string) {
    const db = getDb();

    const templates = await db('consent_templates')
      .where({ tenant_id: tenantId, is_current: true })
      .orderBy('channel', 'asc');

    return templates;
  }

  async createTemplate(tenantId: string, dto: CreateConsentTemplateDto) {
    const db = getDb();

    return db.transaction(async (trx) => {
      // Set previous templates for this channel as not current
      await trx('consent_templates')
        .where({
          tenant_id: tenantId,
          channel: dto.channel,
          is_current: true,
        })
        .update({
          is_current: false,
          updated_at: trx.fn.now(),
        });

      // Get the latest version number for this channel
      const latestVersion = await trx('consent_templates')
        .where({ tenant_id: tenantId, channel: dto.channel })
        .max('version as max_version')
        .first();

      const nextVersion = (latestVersion?.max_version || 0) + 1;

      // Create new template as current
      const [template] = await trx('consent_templates')
        .insert({
          tenant_id: tenantId,
          channel: dto.channel,
          content_pl: dto.contentPl,
          content_en: dto.contentEn || null,
          version: nextVersion,
          is_current: true,
        })
        .returning('*');

      return template;
    });
  }
}
