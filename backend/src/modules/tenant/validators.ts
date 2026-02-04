import { z } from 'zod';

export const updateTenantSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  settings: z.record(z.unknown()).optional(),
});

export const createLocationSchema = z.object({
  name: z.string().min(1).max(255),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  postalCode: z.string().regex(/^\d{2}-\d{3}$/, 'Invalid Polish postal code').optional(),
  phone: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const updateLocationSchema = createLocationSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const idParamSchema = z.object({ id: z.string().uuid() });
