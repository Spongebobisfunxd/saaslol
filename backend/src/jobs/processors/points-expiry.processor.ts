import { Job } from 'bullmq';
import { getDb } from '../../db/connection';
import { logger } from '../../lib/logger';

export async function processPointsExpiry(job: Job): Promise<void> {
  const db = getDb();
  const now = new Date();

  // Find all unexpired ledger entries that are now past expiry
  const expiredEntries = await db('points_ledger')
    .where('type', 'earn')
    .where('expires_at', '<=', now)
    .whereNotExists(function () {
      this.select('*')
        .from('points_ledger as pl2')
        .whereRaw('pl2.reference_id = points_ledger.id')
        .where('pl2.type', 'expire');
    })
    .select('*');

  for (const entry of expiredEntries) {
    try {
      await db.transaction(async (trx) => {
        await trx.raw(`SET app.current_tenant = '${entry.tenant_id}'`);

        const customer = await trx('customers')
          .where('id', entry.customer_id)
          .first();

        if (!customer) return;

        const expireAmount = Math.min(entry.amount, customer.points_balance);
        if (expireAmount <= 0) return;

        const newBalance = customer.points_balance - expireAmount;

        await trx('customers')
          .where('id', entry.customer_id)
          .update({ points_balance: newBalance });

        await trx('points_ledger').insert({
          tenant_id: entry.tenant_id,
          customer_id: entry.customer_id,
          type: 'expire',
          amount: -expireAmount,
          balance_after: newBalance,
          description: `Points expired (earned ${entry.created_at})`,
          reference_type: 'points_ledger',
          reference_id: entry.id,
        });
      });
    } catch (err: any) {
      logger.error(`Failed to expire points for entry ${entry.id}`, { error: err.message });
    }
  }

  logger.info(`Processed ${expiredEntries.length} point expiry entries`);
}
