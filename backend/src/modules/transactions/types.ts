export interface CreateTransactionDto {
  customerId: string;
  amount: number;
  locationId?: string;
  receiptNumber?: string;
  source?: string;
}

export interface TransactionFilter {
  customerId?: string;
  locationId?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
