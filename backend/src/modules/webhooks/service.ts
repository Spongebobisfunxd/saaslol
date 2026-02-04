import crypto from 'crypto';
import { getDb } from '../../db/connection';
import { AppError } from '../../middleware/errorHandler';
import { CreateWebhookDto, UpdateWebhookDto, WebhookDeliveryFilter } from './types';

export class WebhookService {
  async list(tenantId: string) {
    const db = getDb();
    const endpoints = await db('webhook_endpoints')
      .where({ tenant_id: tenantId })
      .orderBy('created_at', 'desc');

    return endpoints;
  }

  async create(tenantId: string, dto: CreateWebhookDto) {
    const db = getDb();
    const secret = this.generateSecret();

    const [endpoint] = await db('webhook_endpoints')
      .insert({
        tenant_id: tenantId,
        url: dto.url,
        secret,
        events: JSON.stringify(dto.events),
        is_active: true,
      })
      .returning('*');

    return endpoint;
  }

  async update(tenantId: string, id: string, dto: UpdateWebhookDto) {
    const db = getDb();
    const updateData: Record<string, unknown> = {
      updated_at: db.fn.now(),
    };

    if (dto.url !== undefined) updateData.url = dto.url;
    if (dto.events !== undefined) updateData.events = JSON.stringify(dto.events);
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    const [updated] = await db('webhook_endpoints')
      .where({ id, tenant_id: tenantId })
      .update(updateData)
      .returning('*');

    if (!updated) {
      throw new AppError(404, 'Webhook endpoint not found');
    }

    return updated;
  }

  async delete(tenantId: string, id: string) {
    const db = getDb();

    const deleted = await db('webhook_endpoints')
      .where({ id, tenant_id: tenantId })
      .delete();

    if (!deleted) {
      throw new AppError(404, 'Webhook endpoint not found');
    }

    return { success: true };
  }

  async getDeliveries(tenantId: string, filter: WebhookDeliveryFilter) {
    const db = getDb();
    const offset = (filter.page - 1) * filter.pageSize;

    let query = db('webhook_deliveries')
      .where({ tenant_id: tenantId });

    let countQuery = db('webhook_deliveries')
      .where({ tenant_id: tenantId });

    if (filter.endpointId) {
      query = query.where({ endpoint_id: filter.endpointId });
      countQuery = countQuery.where({ endpoint_id: filter.endpointId });
    }

    if (filter.status) {
      query = query.where({ status: filter.status });
      countQuery = countQuery.where({ status: filter.status });
    }

    const [{ count: total }] = await countQuery.count('id as count');

    const deliveries = await query
      .orderBy('created_at', 'desc')
      .limit(filter.pageSize)
      .offset(offset);

    return {
      data: deliveries,
      pagination: {
        page: filter.page,
        pageSize: filter.pageSize,
        total: Number(total),
        totalPages: Math.ceil(Number(total) / filter.pageSize),
      },
    };
  }

  async dispatchEvent(tenantId: string, event: string, payload: Record<string, unknown>) {
    const db = getDb();

    // Find all active endpoints subscribed to this event
    const endpoints = await db('webhook_endpoints')
      .where({ tenant_id: tenantId, is_active: true })
      .whereRaw("events::jsonb @> ?::jsonb", [JSON.stringify([event])]);

    if (endpoints.length === 0) {
      return { dispatched: 0 };
    }

    // Create delivery entries for each matching endpoint
    const deliveries = endpoints.map((endpoint: { id: string }) => ({
      tenant_id: tenantId,
      endpoint_id: endpoint.id,
      event,
      payload: JSON.stringify(payload),
      status: 'pending',
      attempts: 0,
    }));

    const inserted = await db('webhook_deliveries')
      .insert(deliveries)
      .returning('*');

    return { dispatched: inserted.length, deliveries: inserted };
  }

  private generateSecret(): string {
    return `whsec_${crypto.randomBytes(32).toString('hex')}`;
  }
}
