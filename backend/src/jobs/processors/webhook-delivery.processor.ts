import { Job } from 'bullmq';
import { getDb } from '../../db/connection';
import { logger } from '../../lib/logger';
import crypto from 'crypto';

export async function processWebhookDelivery(job: Job): Promise<void> {
  const { deliveryId, tenantId } = job.data;
  const db = getDb();

  await db.raw(`SET app.current_tenant = '${tenantId}'`);

  const delivery = await db('webhook_deliveries')
    .where({ id: deliveryId })
    .first();

  if (!delivery || delivery.status === 'delivered') return;

  const endpoint = await db('webhook_endpoints')
    .where({ id: delivery.endpoint_id, is_active: true })
    .first();

  if (!endpoint) {
    await db('webhook_deliveries')
      .where('id', deliveryId)
      .update({ status: 'failed' });
    return;
  }

  try {
    const payloadStr = JSON.stringify(delivery.payload);
    const signature = crypto
      .createHmac('sha256', endpoint.secret)
      .update(payloadStr)
      .digest('hex');

    const response = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': delivery.event,
      },
      body: payloadStr,
      signal: AbortSignal.timeout(10000),
    });

    const responseBody = await response.text();

    await db('webhook_deliveries')
      .where('id', deliveryId)
      .update({
        status: response.ok ? 'delivered' : 'failed',
        response_status: response.status,
        response_body: responseBody.slice(0, 5000),
        delivered_at: new Date(),
        attempt: delivery.attempt,
      });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (err: any) {
    const attempt = delivery.attempt + 1;
    await db('webhook_deliveries')
      .where('id', deliveryId)
      .update({ attempt, status: attempt > 5 ? 'failed' : 'pending' });

    if (attempt <= 5) {
      // Exponential backoff: 30s, 2m, 8m, 32m, 2h
      const delay = Math.pow(4, attempt - 1) * 30_000;
      throw err; // BullMQ will retry with backoff
    }

    logger.error(`Webhook delivery ${deliveryId} permanently failed after ${attempt} attempts`);
  }
}
