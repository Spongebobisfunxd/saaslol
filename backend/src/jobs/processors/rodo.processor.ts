import { Job } from 'bullmq';
import { getDb } from '../../db/connection';
import { logger } from '../../lib/logger';

export async function processRodoExport(job: Job): Promise<void> {
  const { tenantId, customerId, type } = job.data;
  const db = getDb();

  await db.raw(`SET app.current_tenant = '${tenantId}'`);

  if (type === 'export') {
    // Collect all customer data for RODO data export
    const customer = await db('customers').where('id', customerId).first();
    const transactions = await db('transactions').where('customer_id', customerId);
    const pointsLedger = await db('points_ledger').where('customer_id', customerId);
    const stampCards = await db('stamp_cards').where('customer_id', customerId);
    const consents = await db('consents').where('customer_id', customerId);
    const consentAudit = await db('consent_audit_log').where('customer_id', customerId);
    const vouchers = await db('vouchers').where('customer_id', customerId);

    const exportData = {
      customer,
      transactions,
      pointsLedger,
      stampCards,
      consents,
      consentAudit,
      vouchers,
      exportedAt: new Date().toISOString(),
    };

    // TODO: Store export and notify customer
    logger.info(`RODO export completed for customer ${customerId}`, {
      recordCount: transactions.length + pointsLedger.length,
    });

    return;
  }

  if (type === 'erasure') {
    await db.transaction(async (trx) => {
      await trx.raw(`SET app.current_tenant = '${tenantId}'`);

      // Anonymize customer data (don't delete for referential integrity)
      await trx('customers')
        .where('id', customerId)
        .update({
          first_name: 'DELETED',
          last_name: 'DELETED',
          email: null,
          phone: `deleted-${customerId.slice(0, 8)}`,
          birth_date: null,
          tags: '[]',
          metadata: '{}',
          is_active: false,
        });

      // Revoke all consents
      await trx('consents')
        .where('customer_id', customerId)
        .update({ granted: false, revoked_at: new Date() });

      // Log the erasure in audit
      await trx('consent_audit_log').insert({
        tenant_id: tenantId,
        customer_id: customerId,
        channel: 'all',
        action: 'revoke',
        template_version: 0,
      });
    });

    logger.info(`RODO erasure completed for customer ${customerId}`);
  }
}
