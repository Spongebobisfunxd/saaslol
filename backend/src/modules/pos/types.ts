export interface CreatePosIntegrationDto {
  locationId: string;
  provider: string;
  config?: Record<string, unknown>;
}

export interface UpdatePosIntegrationDto {
  provider?: string;
  config?: Record<string, unknown>;
  isActive?: boolean;
}

export interface PosReceiptDto {
  receiptNumber: string;
  amount: number;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  customerPhone?: string;
  timestamp: string;
}
