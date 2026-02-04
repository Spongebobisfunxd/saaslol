import { z } from 'zod';

export const createGiftCardSchema = z.object({
  initialBalance: z.number().positive(),
  expiresAt: z.string().datetime().optional(),
  issuedToCustomerId: z.string().uuid().optional(),
});

export const giftCardTransactionSchema = z.object({
  giftCardId: z.string().uuid(),
  type: z.enum(['load', 'redeem']),
  amount: z.number().positive(),
  description: z.string().max(500).optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});
