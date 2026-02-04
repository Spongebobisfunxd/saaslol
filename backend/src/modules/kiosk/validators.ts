import { z } from 'zod';

export const registerDeviceSchema = z.object({
  locationId: z.string().uuid(),
  name: z.string().min(1).max(255),
});

export const customerLookupSchema = z.object({
  phone: z.string().max(20).optional(),
  qrCode: z.string().max(255).optional(),
}).refine((data) => data.phone || data.qrCode, {
  message: 'Either phone or qrCode must be provided',
});

export const kioskSyncSchema = z.object({
  operations: z.array(
    z.object({
      idempotencyKey: z.string().min(1).max(255),
      operation: z.enum(['add_points', 'redeem_reward', 'add_stamp', 'record_transaction']),
      payload: z.record(z.unknown()),
      timestamp: z.string().datetime(),
    }),
  ).min(1).max(100),
});

export const idParamSchema = z.object({ id: z.string().uuid() });

export const deviceIdParamSchema = z.object({ deviceId: z.string().uuid() });
