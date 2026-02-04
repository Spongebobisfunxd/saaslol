import { z } from 'zod';

export const createWebhookSchema = z.object({
  url: z.string().url().max(2000),
  events: z.array(z.string().min(1).max(100)).min(1),
});

export const updateWebhookSchema = z.object({
  url: z.string().url().max(2000).optional(),
  events: z.array(z.string().min(1).max(100)).min(1).optional(),
  isActive: z.boolean().optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

export const deliveryFilterSchema = z.object({
  endpointId: z.string().uuid().optional(),
  status: z.enum(['pending', 'success', 'failed']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
