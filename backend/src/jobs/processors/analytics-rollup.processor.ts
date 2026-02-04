import { Job } from 'bullmq';
import { getDb } from '../../db/connection';
import { logger } from '../../lib/logger';

export async function processAnalyticsRollup(job: Job): Promise<void> {
  const { tenantId, date } = job.data;
  const db = getDb();

  await db.raw(`SET app.current_tenant = '${tenantId}'`);

  const targetDate = date || new Date(Date.now() - 86400000).toISOString().split('T')[0];

  await db.transaction(async (trx) => {
    await trx.raw(`SET app.current_tenant = '${tenantId}'`);

    // Delete existing entry for this date
    await trx('analytics_daily')
      .where({ tenant_id: tenantId, date: targetDate })
      .whereNull('location_id')
      .delete();

    // Aggregate metrics
    const [newCustomers] = await trx('customers')
      .where('tenant_id', tenantId)
      .whereRaw(`DATE(joined_at) = ?`, [targetDate])
      .count('id as count');

    const [activeCustomers] = await trx('transactions')
      .where('tenant_id', tenantId)
      .whereRaw(`DATE(created_at) = ?`, [targetDate])
      .countDistinct('customer_id as count');

    const [txnStats] = await trx('transactions')
      .where('tenant_id', tenantId)
      .whereRaw(`DATE(created_at) = ?`, [targetDate])
      .select(
        trx.raw('COUNT(*) as transactions_count'),
        trx.raw('COALESCE(SUM(amount), 0) as revenue')
      );

    const [pointsEarned] = await trx('points_ledger')
      .where({ tenant_id: tenantId, type: 'earn' })
      .whereRaw(`DATE(created_at) = ?`, [targetDate])
      .select(trx.raw('COALESCE(SUM(amount), 0) as total'));

    const [pointsBurned] = await trx('points_ledger')
      .where({ tenant_id: tenantId, type: 'burn' })
      .whereRaw(`DATE(created_at) = ?`, [targetDate])
      .select(trx.raw('COALESCE(SUM(ABS(amount)), 0) as total'));

    const [stampsAdded] = await trx('stamp_events')
      .where('tenant_id', tenantId)
      .whereRaw(`DATE(created_at) = ?`, [targetDate])
      .select(trx.raw('COALESCE(SUM(stamps_added), 0) as total'));

    await trx('analytics_daily').insert({
      tenant_id: tenantId,
      date: targetDate,
      new_customers: Number((newCustomers as any).count) || 0,
      active_customers: Number((activeCustomers as any).count) || 0,
      transactions_count: Number(txnStats.transactions_count) || 0,
      revenue: Number(txnStats.revenue) || 0,
      points_earned: Number((pointsEarned as any).total) || 0,
      points_burned: Number((pointsBurned as any).total) || 0,
      stamps_added: Number((stampsAdded as any).total) || 0,
    });
  });

  logger.info(`Analytics rollup completed for tenant ${tenantId}, date ${targetDate}`);
}
