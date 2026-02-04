export interface CreatePaymentDto {
  amount: number;
  currency?: string;
  customerId?: string;
  description?: string;
  paymentMethod?: string;
}

export interface PaymentNotificationDto {
  provider: string;
  externalId: string;
  status: string;
  amount: number;
  metadata?: Record<string, unknown>;
}

export interface PaymentFilter {
  page: number;
  pageSize: number;
}
