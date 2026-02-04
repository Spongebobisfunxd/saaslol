export interface CreateGiftCardDto {
  initialBalance: number;
  expiresAt?: string;
  issuedToCustomerId?: string;
}

export interface GiftCardTransactionDto {
  giftCardId: string;
  type: 'load' | 'redeem';
  amount: number;
  description?: string;
}

export interface UpdateGiftCardDto {
  expiresAt?: string;
  issuedToCustomerId?: string;
}
