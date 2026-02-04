import { z } from 'zod';

export const createVoucherSchema = z.object({
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().positive(),
  customerId: z.string().uuid().optional(),
  minPurchaseAmount: z.number().min(0).optional(),
  expiresAt: z.string().datetime().optional(),
});

export const redeemVoucherSchema = z.object({
  code: z.string().min(1).max(50),
  customerId: z.string().uuid(),
  transactionId: z.string().uuid().optional(),
  purchaseAmount: z.number().positive(),
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});
