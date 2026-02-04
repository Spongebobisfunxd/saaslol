import { UserRole } from '@loyalty/shared';

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  nip: string;
  phone?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JwtPayload {
  userId: string;
  tenantId: string;
  role: UserRole;
  email: string;
}
