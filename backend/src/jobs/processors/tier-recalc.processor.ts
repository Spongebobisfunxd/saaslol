import { Job } from 'bullmq';
import { getDb } from '../../db/connection';
import { logger } from '../../lib/logger';

export async function processTierRecalc(job: Job): Promise<void> {
  const { tenantId } = job.data;
  const db = getDb();

  await db.raw(`SET app.current_tenant = '${tenantId}'`);

  const tiers = await db('tiers')
    .where('tenant_id', tenantId)
    .orderBy('min_points', 'desc')
    .select('*');

  if (tiers.length === 0) return;

  const customers = await db('customers')
    .where({ tenant_id: tenantId, is_active: true })
    .select('id', 'total_points_earned', 'tier_id');

  let updated = 0;

  for (const customer of customers) {
    const newTier = tiers.find((t) => customer.total_points_earned >= t.min_points) || null;
    const newTierId = newTier?.id || null;

    if (customer.tier_id !== newTierId) {
      await db('customers')
        .where('id', customer.id)
        .update({ tier_id: newTierId });
      updated++;
    }
  }

  logger.info(`Tier recalc for tenant ${tenantId}: ${updated}/${customers.length} updated`);
}
