import { z } from 'zod';

export const createPosIntegrationSchema = z.object({
  locationId: z.string().uuid(),
  provider: z.string().min(1).max(50),
  config: z.record(z.unknown()).optional(),
});

export const updatePosIntegrationSchema = z.object({
  provider: z.string().min(1).max(50).optional(),
  config: z.record(z.unknown()).optional(),
  isActive: z.boolean().optional(),
});

export const posReceiptSchema = z.object({
  receiptNumber: z.string().min(1).max(100),
  amount: z.number().int().positive(),
  items: z.array(
    z.object({
      name: z.string().min(1).max(255),
      quantity: z.number().positive(),
      price: z.number().int(),
    }),
  ).optional(),
  customerPhone: z.string().max(20).optional(),
  timestamp: z.string().datetime(),
});

export const idParamSchema = z.object({ id: z.string().uuid() });

export const integrationIdParamSchema = z.object({
  integrationId: z.string().uuid(),
});
