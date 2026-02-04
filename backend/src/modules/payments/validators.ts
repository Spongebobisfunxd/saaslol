import { z } from 'zod';

export const createPaymentSchema = z.object({
  amount: z.number().int().positive(),
  currency: z.string().length(3).default('PLN').optional(),
  customerId: z.string().uuid().optional(),
  description: z.string().max(500).optional(),
  paymentMethod: z.string().max(50).optional(),
});

export const paymentNotificationSchema = z.object({
  provider: z.string().min(1).max(50),
  externalId: z.string().min(1).max(255),
  status: z.string().min(1).max(50),
  amount: z.number().int().positive(),
  metadata: z.record(z.unknown()).optional(),
});

export const paymentFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const idParamSchema = z.object({ id: z.string().uuid() });
