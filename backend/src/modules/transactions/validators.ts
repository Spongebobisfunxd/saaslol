import { z } from 'zod';

export const createTransactionSchema = z.object({
  customerId: z.string().uuid(),
  amount: z.number().positive(),
  locationId: z.string().uuid().optional(),
  receiptNumber: z.string().max(255).optional(),
  source: z.string().max(100).optional(),
});

export const transactionFilterSchema = z.object({
  customerId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const idParamSchema = z.object({ id: z.string().uuid() });
