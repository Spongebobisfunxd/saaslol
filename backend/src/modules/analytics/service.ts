import { getDb } from '../../db/connection';
import { AppError } from '../../middleware/errorHandler';
import { DashboardMetrics, AnalyticsFilter } from './types';

export class AnalyticsService {
  async getDashboardMetrics(tenantId: string): Promise<DashboardMetrics> {
    const db = getDb();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const currentStart = thirtyDaysAgo.toISOString();
    const previousStart = sixtyDaysAgo.toISOString();
    const currentEnd = now.toISOString();

    // Total customers
    const [{ count: totalCustomers }] = await db('customers')
      .where({ tenant_id: tenantId })
      .count('id as count');

    const [{ count: previousTotalCustomers }] = await db('customers')
      .where({ tenant_id: tenantId })
      .where('created_at', '<=', currentStart)
      .count('id as count');

    // Active customers (had a transaction in the current period)
    const [{ count: activeCustomers }] = await db('transactions')
      .where({ tenant_id: tenantId })
      .where('created_at', '>=', currentStart)
      .where('created_at', '<=', currentEnd)
      .countDistinct('customer_id as count');

    const [{ count: previousActiveCustomers }] = await db('transactions')
      .where({ tenant_id: tenantId })
      .where('created_at', '>=', previousStart)
      .where('created_at', '<', currentStart)
      .countDistinct('customer_id as count');

    // Points issued in current period
    const currentPointsResult = await db('points_ledger')
      .where({ tenant_id: tenantId, type: 'earn' })
      .where('created_at', '>=', currentStart)
      .where('created_at', '<=', currentEnd)
      .sum('amount as total')
      .first();

    const previousPointsResult = await db('points_ledger')
      .where({ tenant_id: tenantId, type: 'earn' })
      .where('created_at', '>=', previousStart)
      .where('created_at', '<', currentStart)
      .sum('amount as total')
      .first();

    const totalPointsIssued = Number(currentPointsResult?.total) || 0;
    const previousPointsIssued = Number(previousPointsResult?.total) || 0;

    // Revenue in current period
    const currentRevenueResult = await db('transactions')
      .where({ tenant_id: tenantId })
      .where('created_at', '>=', currentStart)
      .where('created_at', '<=', currentEnd)
      .sum('amount as total')
      .first();

    const previousRevenueResult = await db('transactions')
      .where({ tenant_id: tenantId })
      .where('created_at', '>=', previousStart)
      .where('created_at', '<', currentStart)
      .sum('amount as total')
      .first();

    const totalRevenue = Number(currentRevenueResult?.total) || 0;
    const previousRevenue = Number(previousRevenueResult?.total) || 0;

    return {
      totalCustomers: Number(totalCustomers),
      customersChange: this.calcPercentChange(Number(previousTotalCustomers), Number(totalCustomers)),
      activeCustomers: Number(activeCustomers),
      activeCustomersChange: this.calcPercentChange(Number(previousActiveCustomers), Number(activeCustomers)),
      pointsIssued: totalPointsIssued,
      pointsIssuedChange: this.calcPercentChange(previousPointsIssued, totalPointsIssued),
      pointsRedeemed: 0,
      totalRevenueGrosze: totalRevenue,
      revenueChange: this.calcPercentChange(previousRevenue, totalRevenue),
      newCustomersToday: 0,
      newCustomersWeek: 0,
      revenueTodayGrosze: 0,
      revenueThisMonthGrosze: totalRevenue,
      redemptionRate: 0,
      averageTransactionValueGrosze: 0,
      activePrograms: 0,
      activeCampaigns: 0,
      pendingRewards: 0,
    };
  }

  async getDailyAnalytics(tenantId: string, filter: AnalyticsFilter) {
    const db = getDb();

    if (filter.locationId) {
      const rows = await db('analytics_daily')
        .where({ tenant_id: tenantId, location_id: filter.locationId })
        .where('date', '>=', filter.startDate)
        .where('date', '<=', filter.endDate)
        .orderBy('date', 'asc');

      return rows.map((r: any) => ({
        date: r.date,
        newCustomers: Number(r.new_customers) || 0,
        transactions: Number(r.transactions_count) || 0,
        revenueGrosze: Number(r.revenue) || 0,
        pointsIssued: Number(r.points_earned) || 0,
        pointsRedeemed: Number(r.points_burned) || 0,
        rewardsRedeemed: Number(r.rewards_redeemed) || 0,
      }));
    }

    // Aggregate across all locations per date
    const rows = await db('analytics_daily')
      .where({ tenant_id: tenantId })
      .where('date', '>=', filter.startDate)
      .where('date', '<=', filter.endDate)
      .groupBy('date')
      .orderBy('date', 'asc')
      .select(
        'date',
        db.raw('SUM(new_customers) as new_customers'),
        db.raw('SUM(transactions_count) as transactions_count'),
        db.raw('SUM(revenue) as revenue'),
        db.raw('SUM(points_earned) as points_earned'),
        db.raw('SUM(points_burned) as points_burned'),
        db.raw('SUM(rewards_redeemed) as rewards_redeemed'),
      );

    return rows.map((r: any) => ({
      date: r.date,
      newCustomers: Number(r.new_customers) || 0,
      transactions: Number(r.transactions_count) || 0,
      revenueGrosze: Number(r.revenue) || 0,
      pointsIssued: Number(r.points_earned) || 0,
      pointsRedeemed: Number(r.points_burned) || 0,
      rewardsRedeemed: Number(r.rewards_redeemed) || 0,
    }));
  }

  async rollupDaily(tenantId: string, date: string) {
    const db = getDb();
    const nextDate = new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    // New customers for the day
    const [{ count: newCustomers }] = await db('customers')
      .where({ tenant_id: tenantId })
      .where('created_at', '>=', date)
      .where('created_at', '<', nextDate)
      .count('id as count');

    // Active customers for the day
    const [{ count: activeCustomers }] = await db('transactions')
      .where({ tenant_id: tenantId })
      .where('created_at', '>=', date)
      .where('created_at', '<', nextDate)
      .countDistinct('customer_id as count');

    // Points issued
    const pointsIssuedResult = await db('points_ledger')
      .where({ tenant_id: tenantId, type: 'earn' })
      .where('created_at', '>=', date)
      .where('created_at', '<', nextDate)
      .sum('amount as total')
      .first();

    // Points burned
    const pointsBurnedResult = await db('points_ledger')
      .where({ tenant_id: tenantId, type: 'burn' })
      .where('created_at', '>=', date)
      .where('created_at', '<', nextDate)
      .sum('amount as total')
      .first();

    // Transaction count and revenue
    const transactionStats = await db('transactions')
      .where({ tenant_id: tenantId })
      .where('created_at', '>=', date)
      .where('created_at', '<', nextDate)
      .select(
        db.raw('COUNT(id) as transaction_count'),
        db.raw('COALESCE(SUM(amount), 0) as revenue'),
      )
      .first();

    const row = {
      tenant_id: tenantId,
      date,
      location_id: null,
      new_customers: Number(newCustomers) || 0,
      active_customers: Number(activeCustomers) || 0,
      points_issued: Number(pointsIssuedResult?.total) || 0,
      points_burned: Math.abs(Number(pointsBurnedResult?.total)) || 0,
      transaction_count: Number(transactionStats?.transaction_count) || 0,
      revenue: Number(transactionStats?.revenue) || 0,
    };

    // Upsert: delete existing then insert
    await db.transaction(async (trx) => {
      await trx('analytics_daily')
        .where({ tenant_id: tenantId, date, location_id: null })
        .delete();

      await trx('analytics_daily').insert(row);
    });

    return row;
  }

  private calcPercentChange(previous: number, current: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return Math.round(((current - previous) / previous) * 10000) / 100;
  }
}
