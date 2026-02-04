import { campaignQueue, pointsExpiryQueue, tierRecalcQueue, analyticsRollupQueue } from './queue';
import { getDb } from '../db/connection';
import { logger } from '../lib/logger';

export async function startScheduler() {
  // Points expiry - daily at 2 AM
  await pointsExpiryQueue.add(
    'daily-expiry',
    {},
    {
      repeat: { pattern: '0 2 * * *' },
      removeOnComplete: { count: 10 },
      removeOnFail: { count: 50 },
    }
  );

  // Analytics rollup - daily at 3 AM for each tenant
  await analyticsRollupQueue.add(
    'daily-rollup-scheduler',
    {},
    {
      repeat: { pattern: '0 3 * * *' },
      removeOnComplete: { count: 10 },
    }
  );

  // Tier recalculation - every 6 hours for each tenant
  // Actual scheduling happens by enqueueing per-tenant jobs
  setInterval(async () => {
    try {
      const db = getDb();
      const tenants = await db('tenants').where('is_active', true).select('id');
      for (const tenant of tenants) {
        await tierRecalcQueue.add('recalc', { tenantId: tenant.id });
      }
    } catch (err: any) {
      logger.error('Failed to schedule tier recalculation', { error: err.message });
    }
  }, 6 * 60 * 60 * 1000);

  // Check for scheduled campaigns every minute
  setInterval(async () => {
    try {
      const db = getDb();
      const campaigns = await db('campaigns')
        .where('status', 'scheduled')
        .where('scheduled_at', '<=', new Date())
        .select('id', 'tenant_id');

      for (const campaign of campaigns) {
        await campaignQueue.add('send', {
          campaignId: campaign.id,
          tenantId: campaign.tenant_id,
        });
      }
    } catch (err: any) {
      logger.error('Failed to check scheduled campaigns', { error: err.message });
    }
  }, 60_000);

  logger.info('Job scheduler started');
}
