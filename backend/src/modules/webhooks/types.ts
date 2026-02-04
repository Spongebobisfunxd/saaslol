export interface CreateWebhookDto {
  url: string;
  events: string[];
}

export interface UpdateWebhookDto {
  url?: string;
  events?: string[];
  isActive?: boolean;
}

export interface WebhookDeliveryFilter {
  endpointId?: string;
  status?: string;
  page: number;
  pageSize: number;
}

export interface WebhookEndpoint {
  id: string;
  tenantId: string;
  url: string;
  secret: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookDelivery {
  id: string;
  tenantId: string;
  endpointId: string;
  event: string;
  payload: Record<string, unknown>;
  status: string;
  httpStatus: number | null;
  attempts: number;
  lastAttemptAt: string | null;
  nextRetryAt: string | null;
  createdAt: string;
}
