export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  STAFF = 'staff',
}

export enum LoyaltyProgramType {
  POINTS = 'points',
  STAMPS = 'stamps',
  TIERS = 'tiers',
  HYBRID = 'hybrid',
}

export enum PointsTransactionType {
  EARN = 'earn',
  BURN = 'burn',
  ADJUST = 'adjust',
  EXPIRE = 'expire',
  TRANSFER = 'transfer',
}

export enum RewardStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

export enum VoucherStatus {
  ACTIVE = 'active',
  REDEEMED = 'redeemed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export enum GiftCardStatus {
  ACTIVE = 'active',
  DEPLETED = 'depleted',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  SENDING = 'sending',
  SENT = 'sent',
  CANCELLED = 'cancelled',
}

export enum CampaignChannel {
  EMAIL = 'email',
  SMS = 'sms',
}

export enum ConsentChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PHONE = 'phone',
}

export enum ConsentAction {
  GRANT = 'grant',
  REVOKE = 'revoke',
}

export enum WebhookEvent {
  CUSTOMER_CREATED = 'customer.created',
  CUSTOMER_UPDATED = 'customer.updated',
  TRANSACTION_CREATED = 'transaction.created',
  POINTS_EARNED = 'points.earned',
  POINTS_BURNED = 'points.burned',
  REWARD_REDEEMED = 'reward.redeemed',
  STAMP_ADDED = 'stamp.added',
  STAMP_CARD_COMPLETED = 'stamp_card.completed',
  VOUCHER_CREATED = 'voucher.created',
  VOUCHER_REDEEMED = 'voucher.redeemed',
}

export enum KioskSyncOperation {
  ADD_POINTS = 'add_points',
  REDEEM_REWARD = 'redeem_reward',
  ADD_STAMP = 'add_stamp',
  RECORD_TRANSACTION = 'record_transaction',
}

export enum AutomationTrigger {
  CUSTOMER_SIGNUP = 'customer_signup',
  BIRTHDAY = 'birthday',
  POINTS_THRESHOLD = 'points_threshold',
  TIER_CHANGE = 'tier_change',
  INACTIVITY = 'inactivity',
  STAMP_CARD_COMPLETED = 'stamp_card_completed',
  PURCHASE = 'purchase',
}

export enum AutomationActionType {
  SEND_EMAIL = 'send_email',
  SEND_SMS = 'send_sms',
  ADD_POINTS = 'add_points',
  ISSUE_VOUCHER = 'issue_voucher',
  ADD_TAG = 'add_tag',
  WAIT = 'wait',
}
