import { z } from 'zod';

function validateNIP(nip: string): boolean {
  if (!/^\d{10}$/.test(nip)) return false;
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  const sum = weights.reduce((acc, w, i) => acc + w * parseInt(nip[i], 10), 0);
  return sum % 11 === parseInt(nip[9], 10);
}

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  companyName: z.string().min(1, 'Company name is required').max(255),
  nip: z.string().refine(validateNIP, 'Invalid NIP number'),
  phone: z.string().regex(/^\+?48\d{9}$/, 'Invalid Polish phone number').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const resetPasswordRequestSchema = z.object({
  email: z.string().email('Invalid email'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
});
