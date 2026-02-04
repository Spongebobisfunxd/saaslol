import { z } from 'zod';

export const grantConsentSchema = z.object({
  customerId: z.string().uuid(),
  channel: z.string().min(1).max(100),
  ipAddress: z.string().max(45).optional(),
  userAgent: z.string().max(500).optional(),
});

export const revokeConsentSchema = z.object({
  customerId: z.string().uuid(),
  channel: z.string().min(1).max(100),
  ipAddress: z.string().max(45).optional(),
  userAgent: z.string().max(500).optional(),
});

export const createConsentTemplateSchema = z.object({
  channel: z.string().min(1).max(100),
  contentPl: z.string().min(1).max(10000),
  contentEn: z.string().max(10000).optional(),
});

export const customerIdParamSchema = z.object({
  customerId: z.string().uuid(),
});

export const checkConsentParamsSchema = z.object({
  customerId: z.string().uuid(),
  channel: z.string().min(1).max(100),
});

export const idParamSchema = z.object({ id: z.string().uuid() });
