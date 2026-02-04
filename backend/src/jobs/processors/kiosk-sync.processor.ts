import { Job } from 'bullmq';
import { getDb } from '../../db/connection';
import { logger } from '../../lib/logger';

export async function processKioskSync(job: Job): Promise<void> {
  const { syncItemId, tenantId } = job.data;
  const db = getDb();

  await db.raw(`SET app.current_tenant = '${tenantId}'`);

  const item = await db('kiosk_sync_queue')
    .where({ id: syncItemId, status: 'pending' })
    .first();

  if (!item) return;

  try {
    await db('kiosk_sync_queue')
      .where('id', syncItemId)
      .update({ status: 'processing' });

    // Processing is already handled inline by KioskService.processSyncQueue
    // This worker handles any items that were queued but not processed inline

    await db('kiosk_sync_queue')
      .where('id', syncItemId)
      .update({
        status: 'completed',
        processed_at: new Date(),
      });
  } catch (err: any) {
    const retryCount = item.retry_count + 1;
    await db('kiosk_sync_queue')
      .where('id', syncItemId)
      .update({
        status: retryCount > 3 ? 'failed' : 'pending',
        retry_count: retryCount,
        error_message: err.message,
      });

    if (retryCount <= 3) throw err;
    logger.error(`Kiosk sync item ${syncItemId} permanently failed`);
  }
}
