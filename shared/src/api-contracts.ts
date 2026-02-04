import {
  UserRole,
  LoyaltyProgramType,
  PointsTransactionType,
  RewardStatus,
  VoucherStatus,
  GiftCardStatus,
  CampaignStatus,
  CampaignChannel,
  ConsentChannel,
  ConsentAction,
  KioskSyncOperation,
  AutomationTrigger,
  AutomationActionType,
} from './enums';

// Base
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  nip: string;
  phone?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string;
  tenantName: string;
}

// Tenant
export interface Tenant {
  id: string;
  name: string;
  nip: string;
  slug: string;
  settings: TenantSettings;
  createdAt: string;
}

export interface TenantSettings {
  currency: 'PLN';
  timezone: string;
  locale: string;
  brandColor?: string;
  logoUrl?: string;
}

// Location
export interface Location {
  id: string;
  tenantId: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone?: string;
  isActive: boolean;
}

// Customer
export interface Customer {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  pointsBalance: number;
  totalPointsEarned: number;
  totalSpent: number;
  tierId?: string;
  tierName?: string;
  tags: string[];
  joinedAt: string;
  lastVisitAt?: string;
}

// Loyalty Program
export interface LoyaltyProgram {
  id: string;
  tenantId: string;
  name: string;
  type: LoyaltyProgramType;
  isActive: boolean;
  earnRules: EarnRule[];
  burnRules: BurnRule[];
  createdAt: string;
}

export interface EarnRule {
  id: string;
  name: string;
  pointsPerZloty: number;
  minTransactionAmount?: number;
  multiplier?: number;
  conditions?: Record<string, unknown>;
}

export interface BurnRule {
  id: string;
  name: string;
  pointsPerZloty: number;
  minPoints?: number;
  maxPointsPerTransaction?: number;
}

// Tier
export interface Tier {
  id: string;
  programId: string;
  name: string;
  minPoints: number;
  multiplier: number;
  benefits: string[];
  sortOrder: number;
}

// Reward
export interface Reward {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  pointsCost: number;
  status: RewardStatus;
  imageUrl?: string;
  stock?: number;
  validFrom?: string;
  validUntil?: string;
}

// Points Ledger
export interface PointsLedgerEntry {
  id: string;
  customerId: string;
  type: PointsTransactionType;
  amount: number;
  balanceAfter: number;
  description: string;
  referenceType?: string;
  referenceId?: string;
  createdAt: string;
}

// Stamp Card
export interface StampCardDefinition {
  id: string;
  tenantId: string;
  name: string;
  stampsRequired: number;
  rewardDescription: string;
  rewardId?: string;
  isActive: boolean;
  imageUrl?: string;
}

export interface StampCard {
  id: string;
  customerId: string;
  definitionId: string;
  currentStamps: number;
  stampsRequired: number;
  isCompleted: boolean;
  completedAt?: string;
}

// Transaction
export interface Transaction {
  id: string;
  tenantId: string;
  customerId: string;
  locationId?: string;
  amount: number; // in grosze
  pointsEarned: number;
  receiptNumber?: string;
  createdAt: string;
}

// Campaign
export interface Campaign {
  id: string;
  tenantId: string;
  name: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  subject?: string;
  content: string;
  audienceFilter?: Record<string, unknown>;
  scheduledAt?: string;
  sentAt?: string;
  recipientCount: number;
}

// Voucher
export interface Voucher {
  id: string;
  tenantId: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  status: VoucherStatus;
  customerId?: string;
  expiresAt?: string;
  redeemedAt?: string;
}

// Gift Card
export interface GiftCard {
  id: string;
  tenantId: string;
  code: string;
  initialBalance: number;
  currentBalance: number;
  status: GiftCardStatus;
  expiresAt?: string;
}

// Consent
export interface Consent {
  id: string;
  customerId: string;
  channel: ConsentChannel;
  granted: boolean;
  grantedAt?: string;
  revokedAt?: string;
  templateVersion: number;
}

// Kiosk
export interface KioskDevice {
  id: string;
  tenantId: string;
  locationId: string;
  name: string;
  deviceToken: string;
  isActive: boolean;
  lastSyncAt?: string;
}

export interface KioskSyncPayload {
  operations: KioskSyncItem[];
}

export interface KioskSyncItem {
  idempotencyKey: string;
  operation: KioskSyncOperation;
  payload: Record<string, unknown>;
  timestamp: string;
}

// Webhook
export interface WebhookEndpoint {
  id: string;
  tenantId: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
}

// Analytics
export interface DashboardMetrics {
  totalCustomers: number;
  customersChange: number;
  activeCustomers: number;
  activeCustomersChange: number;
  totalPointsIssued: number;
  pointsIssuedChange: number;
  totalRevenue: number;
  revenueChange: number;
}

export interface AnalyticsDaily {
  date: string;
  newCustomers: number;
  activeCustomers: number;
  transactions: number;
  revenue: number;
  pointsEarned: number;
  pointsBurned: number;
  rewardsRedeemed: number;
}

// Automation
export interface AutomationWorkflow {
  id: string;
  tenantId: string;
  name: string;
  trigger: AutomationTrigger;
  triggerConfig: Record<string, unknown>;
  actions: AutomationAction[];
  isActive: boolean;
}

export interface AutomationAction {
  id: string;
  type: AutomationActionType;
  config: Record<string, unknown>;
  delayMinutes?: number;
  sortOrder: number;
}
