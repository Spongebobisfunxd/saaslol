import { z } from 'zod';

export const createCampaignSchema = z.object({
  name: z.string().min(1).max(255),
  channel: z.enum(['email', 'sms', 'push']),
  subject: z.string().max(500).optional(),
  content: z.string().min(1).max(50000),
  audienceFilter: z.record(z.unknown()).optional(),
  scheduledAt: z.string().datetime().optional(),
});

export const updateCampaignSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  channel: z.enum(['email', 'sms', 'push']).optional(),
  subject: z.string().max(500).optional(),
  content: z.string().min(1).max(50000).optional(),
  audienceFilter: z.record(z.unknown()).optional(),
  scheduledAt: z.string().datetime().optional(),
});

export const scheduleCampaignSchema = z.object({
  scheduledAt: z.string().datetime(),
});

export const idParamSchema = z.object({ id: z.string().uuid() });

export const recipientsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
