import { z } from 'zod';

export const createRewardSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  pointsCost: z.number().int().positive(),
  imageUrl: z.string().url().max(1000).optional(),
  stock: z.number().int().min(0).optional(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
});

export const updateRewardSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional(),
  pointsCost: z.number().int().positive().optional(),
  status: z.enum(['active', 'inactive', 'archived']).optional(),
  imageUrl: z.string().url().max(1000).optional().nullable(),
  stock: z.number().int().min(0).optional().nullable(),
  validFrom: z.string().datetime().optional().nullable(),
  validUntil: z.string().datetime().optional().nullable(),
});

export const idParamSchema = z.object({ id: z.string().uuid() });

export const redeemRewardSchema = z.object({
  customerId: z.string().uuid(),
  rewardId: z.string().uuid(),
});
