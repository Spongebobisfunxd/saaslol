export interface CreateVoucherDto {
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  customerId?: string;
  minPurchaseAmount?: number;
  expiresAt?: string;
}

export interface RedeemVoucherDto {
  code: string;
  customerId: string;
  transactionId?: string;
  purchaseAmount: number;
}

export interface UpdateVoucherDto {
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  minPurchaseAmount?: number;
  expiresAt?: string;
}
