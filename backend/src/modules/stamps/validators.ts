import { z } from 'zod';

export const createStampCardDefSchema = z.object({
  name: z.string().min(1).max(255),
  stampsRequired: z.number().int().positive().max(100),
  rewardDescription: z.string().min(1).max(500),
  rewardId: z.string().uuid().optional(),
  imageUrl: z.string().url().max(1000).optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateStampCardDefSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  stampsRequired: z.number().int().positive().max(100).optional(),
  rewardDescription: z.string().min(1).max(500).optional(),
  rewardId: z.string().uuid().optional().nullable(),
  imageUrl: z.string().url().max(1000).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const idParamSchema = z.object({ id: z.string().uuid() });

export const customerIdParamSchema = z.object({ customerId: z.string().uuid() });

export const addStampSchema = z.object({
  customerId: z.string().uuid(),
  definitionId: z.string().uuid(),
  locationId: z.string().uuid().optional(),
});
