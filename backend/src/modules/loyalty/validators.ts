import { z } from 'zod';

export const earnRuleSchema = z.object({
  type: z.enum(['per_amount', 'fixed', 'multiplier']),
  value: z.number().positive(),
  minAmount: z.number().int().min(0).optional(),
  maxPoints: z.number().int().positive().optional(),
  categoryId: z.string().uuid().optional(),
  description: z.string().max(500).optional(),
});

export const burnRuleSchema = z.object({
  type: z.enum(['fixed_rate', 'variable']),
  pointsPerUnit: z.number().int().positive(),
  minPoints: z.number().int().positive().optional(),
  maxPointsPerTransaction: z.number().int().positive().optional(),
  description: z.string().max(500).optional(),
});

export const createProgramSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(['points', 'stamps', 'tiers', 'hybrid']).optional().default('points'),
  description: z.string().max(2000).optional(),
  earnRules: z.array(earnRuleSchema).min(1),
  burnRules: z.array(burnRuleSchema).default([]),
  isActive: z.boolean().optional().default(true),
});

export const updateProgramSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  type: z.enum(['points', 'stamps', 'tiers', 'hybrid']).optional(),
  description: z.string().max(2000).optional(),
  earnRules: z.array(earnRuleSchema).min(1).optional(),
  burnRules: z.array(burnRuleSchema).optional(),
  isActive: z.boolean().optional(),
});

export const idParamSchema = z.object({ id: z.string().uuid() });

export const calculatePointsSchema = z.object({
  amount: z.number().int().positive(),
  customerId: z.string().uuid(),
});

export const addPointsSchema = z.object({
  customerId: z.string().uuid(),
  amount: z.number().int().positive(),
  description: z.string().min(1).max(500),
  referenceType: z.string().max(50).optional(),
  referenceId: z.string().uuid().optional(),
});

export const burnPointsSchema = z.object({
  customerId: z.string().uuid(),
  amount: z.number().int().positive(),
  description: z.string().min(1).max(500),
  referenceType: z.string().max(50).optional(),
  referenceId: z.string().uuid().optional(),
});
