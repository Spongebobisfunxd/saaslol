import { z } from 'zod';

export const createCustomerSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(255).optional(),
  phone: z.string().min(1).max(20),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const customerFilterSchema = z.object({
  search: z.string().max(255).optional(),
  tags: z
    .union([z.string().transform((val) => val.split(',')), z.array(z.string())])
    .optional(),
  tierId: z.string().uuid().optional(),
  minPoints: z.coerce.number().int().min(0).optional(),
  maxPoints: z.coerce.number().int().min(0).optional(),
  joinedAfter: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  joinedBefore: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const idParamSchema = z.object({ id: z.string().uuid() });
