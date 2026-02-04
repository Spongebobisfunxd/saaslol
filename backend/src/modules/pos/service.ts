import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../../db/connection';
import { AppError } from '../../middleware/errorHandler';
import { LoyaltyService } from '../loyalty/service';
import {
  CreatePosIntegrationDto,
  UpdatePosIntegrationDto,
  PosReceiptDto,
} from './types';

const loyaltyService = new LoyaltyService();

export class PosService {
  async listIntegrations(tenantId: string) {
    const db = getDb();

    const integrations = await db('pos_integrations')
      .leftJoin('locations', 'pos_integrations.location_id', 'locations.id')
      .where({ 'pos_integrations.tenant_id': tenantId })
      .select(
        'pos_integrations.*',
        'locations.name as location_name',
      )
      .orderBy('pos_integrations.created_at', 'desc');

    return integrations;
  }

  async createIntegration(tenantId: string, dto: CreatePosIntegrationDto) {
    const db = getDb();

    // Verify location exists
    const location = await db('locations')
      .where({ id: dto.locationId, tenant_id: tenantId })
      .first();

    if (!location) {
      throw new AppError(404, 'Location not found');
    }

    const webhookSecret = uuidv4();

    const [integration] = await db('pos_integrations')
      .insert({
        tenant_id: tenantId,
        location_id: dto.locationId,
        provider: dto.provider,
        config: JSON.stringify(dto.config || {}),
        webhook_secret: webhookSecret,
        is_active: true,
      })
      .returning('*');

    return integration;
  }

  async updateIntegration(tenantId: string, id: string, dto: UpdatePosIntegrationDto) {
    const db = getDb();

    const updateData: Record<string, unknown> = {
      updated_at: db.fn.now(),
    };

    if (dto.provider !== undefined) updateData.provider = dto.provider;
    if (dto.config !== undefined) updateData.config = JSON.stringify(dto.config);
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    const [updated] = await db('pos_integrations')
      .where({ id, tenant_id: tenantId })
      .update(updateData)
      .returning('*');

    if (!updated) {
      throw new AppError(404, 'POS integration not found');
    }

    return updated;
  }

  async deleteIntegration(tenantId: string, id: string) {
    const db = getDb();

    const [deleted] = await db('pos_integrations')
      .where({ id, tenant_id: tenantId })
      .update({
        is_active: false,
        updated_at: db.fn.now(),
      })
      .returning('*');

    if (!deleted) {
      throw new AppError(404, 'POS integration not found');
    }

    return deleted;
  }

  async handleReceipt(
    integrationId: string,
    receipt: PosReceiptDto,
    webhookSecret: string,
  ) {
    const db = getDb();

    // Find the integration and verify webhook secret
    const integration = await db('pos_integrations')
      .where({
        id: integrationId,
        webhook_secret: webhookSecret,
        is_active: true,
      })
      .first();

    if (!integration) {
      throw new AppError(401, 'Invalid integration ID or webhook secret');
    }

    const tenantId = integration.tenant_id;

    return db.transaction(async (trx) => {
      let customer = null;
      let pointsEarned = 0;
      let pointsResult = null;

      // Find customer by phone if provided
      if (receipt.customerPhone) {
        customer = await trx('customers')
          .where({
            tenant_id: tenantId,
            phone: receipt.customerPhone,
            is_active: true,
          })
          .first();
      }

      // Create the transaction record
      const [transaction] = await trx('transactions')
        .insert({
          tenant_id: tenantId,
          customer_id: customer?.id || null,
          location_id: integration.location_id,
          amount: receipt.amount,
          receipt_number: receipt.receiptNumber,
          source: 'pos',
          metadata: JSON.stringify({
            pos_provider: integration.provider,
            integration_id: integrationId,
            items: receipt.items || [],
            original_timestamp: receipt.timestamp,
          }),
        })
        .returning('*');

      // Auto-award points if customer was found
      if (customer) {
        pointsEarned = await loyaltyService.calculatePointsForTransaction(
          tenantId,
          receipt.amount,
          customer.id,
        );

        if (pointsEarned > 0) {
          pointsResult = await loyaltyService.addPoints(
            tenantId,
            customer.id,
            pointsEarned,
            `Points earned from POS receipt #${receipt.receiptNumber}`,
            'transaction',
            transaction.id,
          );
        }

        // Update customer.total_spent and last_visit_at
        await trx('customers')
          .where({ id: customer.id, tenant_id: tenantId })
          .increment('total_spent', receipt.amount)
          .update({
            last_visit_at: trx.fn.now(),
            updated_at: trx.fn.now(),
          });
      }

      return {
        transaction,
        customer: customer
          ? { id: customer.id, firstName: customer.first_name, lastName: customer.last_name }
          : null,
        pointsEarned,
        pointsResult,
      };
    });
  }
}
