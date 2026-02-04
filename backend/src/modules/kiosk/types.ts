export interface RegisterDeviceDto {
  locationId: string;
  name: string;
}

export interface KioskSyncItem {
  idempotencyKey: string;
  operation: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export interface KioskSyncPayload {
  operations: KioskSyncItem[];
}

export interface CustomerLookupDto {
  phone?: string;
  qrCode?: string;
}

export interface SyncResult {
  idempotencyKey: string;
  status: 'processed' | 'skipped' | 'error';
  message?: string;
  data?: Record<string, unknown>;
}
