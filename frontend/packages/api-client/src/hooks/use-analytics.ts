import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';

// ── Types ────────────────────────────────────────────────────────────

interface DashboardMetrics {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersToday: number;
  newCustomersWeek: number;
  totalRevenueGrosze: number;
  revenueTodayGrosze: number;
  revenueThisMonthGrosze: number;
  pointsIssued: number;
  pointsRedeemed: number;
  redemptionRate: number;
  averageTransactionValueGrosze: number;
  activePrograms: number;
  activeCampaigns: number;
  pendingRewards: number;
}

interface DailyAnalytics {
  date: string;
  newCustomers: number;
  transactions: number;
  revenueGrosze: number;
  pointsIssued: number;
  pointsRedeemed: number;
  rewardsRedeemed: number;
}

interface AnalyticsFilters {
  dateFrom?: string;
  dateTo?: string;
  programId?: string;
}

// ── Hooks ────────────────────────────────────────────────────────────

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardMetrics>(
        '/analytics/dashboard',
      );
      return data;
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useDailyAnalytics(filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: ['analytics', 'daily', filters],
    queryFn: async () => {
      const { data } = await apiClient.get<DailyAnalytics[]>(
        '/analytics/daily',
        { params: filters },
      );
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
