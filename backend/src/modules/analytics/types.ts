export interface DashboardMetrics {
  totalCustomers: number;
  customersChange: number;
  activeCustomers: number;
  activeCustomersChange: number;
  pointsIssued: number;
  pointsIssuedChange: number;
  pointsRedeemed: number;
  totalRevenueGrosze: number;
  revenueChange: number;
  newCustomersToday: number;
  newCustomersWeek: number;
  revenueTodayGrosze: number;
  revenueThisMonthGrosze: number;
  redemptionRate: number;
  averageTransactionValueGrosze: number;
  activePrograms: number;
  activeCampaigns: number;
  pendingRewards: number;
}

export interface AnalyticsFilter {
  startDate: string;
  endDate: string;
  locationId?: string;
}

export interface DailyAnalyticsRow {
  date: string;
  newCustomers: number;
  transactions: number;
  revenueGrosze: number;
  pointsIssued: number;
  pointsRedeemed: number;
  rewardsRedeemed: number;
}
