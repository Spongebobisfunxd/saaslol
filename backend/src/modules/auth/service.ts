import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { Knex } from 'knex';
import { getDb } from '../../db/connection';
import { config } from '../../config';
import { AppError } from '../../middleware/errorHandler';
import { UserRole } from '@loyalty/shared';
import { CreateUserDto, LoginDto, TokenPair, JwtPayload } from './types';

export class AuthService {
  private db: Knex;

  constructor() {
    this.db = getDb();
  }

  async register(dto: CreateUserDto): Promise<{ user: any; tokens: TokenPair }> {
    const existingTenant = await this.db('tenants').where('nip', dto.nip).first();
    if (existingTenant) {
      throw new AppError(409, 'Business with this NIP already registered');
    }

    const slug = dto.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    return this.db.transaction(async (trx) => {
      const [tenant] = await trx('tenants').insert({
        name: dto.companyName,
        nip: dto.nip,
        slug: `${slug}-${uuidv4().slice(0, 8)}`,
        settings: JSON.stringify({ currency: 'PLN', timezone: 'Europe/Warsaw', locale: 'pl' }),
      }).returning('*');

      const passwordHash = await bcrypt.hash(dto.password, 12);

      // Disable RLS for this insert since tenant was just created
      await trx.raw(`SET app.current_tenant = '${tenant.id}'`);

      const [user] = await trx('users').insert({
        tenant_id: tenant.id,
        email: dto.email,
        password_hash: passwordHash,
        first_name: dto.firstName,
        last_name: dto.lastName,
        role: UserRole.OWNER,
        phone: dto.phone,
      }).returning(['id', 'email', 'first_name', 'last_name', 'role', 'tenant_id']);

      const tokens = await this.generateTokens({
        userId: user.id,
        tenantId: tenant.id,
        role: user.role as UserRole,
        email: user.email,
      }, trx);

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          tenantId: tenant.id,
          tenantName: tenant.name,
        },
        tokens,
      };
    });
  }

  async login(dto: LoginDto): Promise<{ user: any; tokens: TokenPair }> {
    // Find user across all tenants (login doesn't have tenant context yet)
    const user = await this.db('users')
      .join('tenants', 'users.tenant_id', 'tenants.id')
      .where('users.email', dto.email)
      .where('users.is_active', true)
      .select('users.*', 'tenants.name as tenant_name')
      .first();

    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    const validPassword = await bcrypt.compare(dto.password, user.password_hash);
    if (!validPassword) {
      throw new AppError(401, 'Invalid email or password');
    }

    await this.db('users').where('id', user.id).update({ last_login_at: new Date() });

    const tokens = await this.generateTokens({
      userId: user.id,
      tenantId: user.tenant_id,
      role: user.role as UserRole,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        tenantId: user.tenant_id,
        tenantName: user.tenant_name,
      },
      tokens,
    };
  }

  async phoneLogin(phone: string, code: string): Promise<{ user: any; tokens: TokenPair }> {
    // Demo SMS code is always 1234
    if (code !== '1234') {
      throw new AppError(401, 'Nieprawidlowy kod weryfikacyjny');
    }

    // Look up customer by phone number
    const customer = await this.db('customers')
      .where('phone', phone)
      .first();

    if (!customer) {
      throw new AppError(404, 'Nie znaleziono konta z tym numerem telefonu');
    }

    // Find or create a user record matching this customer
    let user = await this.db('users')
      .where('id', customer.id)
      .first();

    if (!user) {
      // Auto-create a user record linked to this customer
      const passwordHash = await bcrypt.hash(uuidv4(), 12);
      await this.db.raw(`SET app.current_tenant = '${customer.tenant_id}'`);
      [user] = await this.db('users').insert({
        id: customer.id,
        tenant_id: customer.tenant_id,
        email: customer.email || `${phone.replace(/\+/g, '')}@portal.local`,
        password_hash: passwordHash,
        first_name: customer.first_name,
        last_name: customer.last_name,
        role: 'staff',
        is_active: true,
      }).returning('*');
    }

    const tenant = await this.db('tenants').where('id', customer.tenant_id).first();

    await this.db('users').where('id', user.id).update({ last_login_at: new Date() });

    const tokens = await this.generateTokens({
      userId: user.id,
      tenantId: customer.tenant_id,
      role: user.role as UserRole,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
        role: user.role,
        tenantId: customer.tenant_id,
        tenantName: tenant?.name || '',
      },
      tokens,
    };
  }

  async refreshToken(token: string): Promise<TokenPair> {
    const tokenHash = await bcrypt.hash(token, 10);

    // Find valid refresh token
    const storedToken = await this.db('refresh_tokens')
      .where('token_hash', token)
      .where('is_revoked', false)
      .where('expires_at', '>', new Date())
      .first();

    if (!storedToken) {
      throw new AppError(401, 'Invalid or expired refresh token');
    }

    const user = await this.db('users').where('id', storedToken.user_id).first();
    if (!user || !user.is_active) {
      throw new AppError(401, 'User not found or inactive');
    }

    // Revoke old token
    await this.db('refresh_tokens').where('id', storedToken.id).update({ is_revoked: true });

    return this.generateTokens({
      userId: user.id,
      tenantId: user.tenant_id,
      role: user.role as UserRole,
      email: user.email,
    });
  }

  async logout(userId: string): Promise<void> {
    await this.db('refresh_tokens')
      .where('user_id', userId)
      .update({ is_revoked: true });
  }

  private async generateTokens(payload: JwtPayload, trx?: Knex.Transaction): Promise<TokenPair> {
    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.accessExpiry as any,
    });

    const refreshToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const db = trx || this.db;
    await db('refresh_tokens').insert({
      user_id: payload.userId,
      token_hash: refreshToken,
      expires_at: expiresAt,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }
}
