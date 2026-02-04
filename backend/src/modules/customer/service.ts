import { getDb } from '../../db/connection';
import { AppError } from '../../middleware/errorHandler';
import { CreateCustomerDto, UpdateCustomerDto, CustomerFilter } from './types';

const knex = getDb();

function mapCustomer(row: any) {
  if (!row) return row;
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    points: Number(row.points_balance) || 0,
    totalSpent: Number(row.total_spent) || 0,
    tier: row.tier_name || null,
    tierId: row.tier_id || null,
    tierMinPoints: row.tier_min_points != null ? Number(row.tier_min_points) : null,
    status: row.is_active ? 'active' : 'inactive',
    birthDate: row.birth_date || null,
    tags: row.tags || [],
    lastVisitAt: row.last_visit_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Map camelCase sortBy to snake_case column
const SORT_COLUMNS: Record<string, string> = {
  firstName: 'first_name',
  lastName: 'last_name',
  createdAt: 'created_at',
  points: 'points_balance',
  first_name: 'first_name',
  last_name: 'last_name',
  created_at: 'created_at',
  points_balance: 'points_balance',
};

export class CustomerService {
  async list(tenantId: string, filter: CustomerFilter) {
    const {
      search,
      tags,
      tierId,
      minPoints,
      maxPoints,
      joinedAfter,
      joinedBefore,
      page = 1,
      pageSize: rawPageSize,
      sortBy = 'created_at',
      sortOrder = 'asc',
    } = filter;

    const pageSize = rawPageSize || (filter as any).limit || 20;

    const query = knex('customers')
      .where({ tenant_id: tenantId, is_active: true });

    if (search) {
      query.where(function (qb) {
        const term = `%${search}%`;
        qb.whereILike('first_name', term)
          .orWhereILike('last_name', term)
          .orWhereILike('email', term)
          .orWhereILike('phone', term);
      });
    }

    if (tags && tags.length > 0) {
      query.whereRaw('tags @> ?', [JSON.stringify(tags)]);
    }

    if (tierId) {
      query.where('tier_id', tierId);
    }

    if (minPoints !== undefined) {
      query.where('points_balance', '>=', minPoints);
    }

    if (maxPoints !== undefined) {
      query.where('points_balance', '<=', maxPoints);
    }

    if (joinedAfter) {
      query.where('created_at', '>=', joinedAfter);
    }

    if (joinedBefore) {
      query.where('created_at', '<=', joinedBefore);
    }

    // Count total before pagination
    const countQuery = query.clone().count('* as total').first();
    const { total } = (await countQuery) as { total: string };
    const totalCount = parseInt(total, 10);

    // Apply sorting and pagination
    const sortColumn = SORT_COLUMNS[sortBy] || 'created_at';
    const offset = (page - 1) * pageSize;
    const data = await query
      .orderBy(sortColumn, sortOrder)
      .limit(pageSize)
      .offset(offset);

    return {
      data: data.map(mapCustomer),
      total: totalCount,
      page,
      limit: pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  }

  async getById(tenantId: string, id: string) {
    const customer = await knex('customers')
      .leftJoin('tiers', 'customers.tier_id', 'tiers.id')
      .where({ 'customers.id': id, 'customers.tenant_id': tenantId })
      .select('customers.*', 'tiers.name as tier_name', 'tiers.min_points as tier_min_points')
      .first();

    if (!customer) {
      throw new AppError(404, 'Customer not found');
    }

    return mapCustomer(customer);
  }

  async create(tenantId: string, dto: CreateCustomerDto) {
    // Check phone uniqueness within tenant
    const existing = await knex('customers')
      .where({ tenant_id: tenantId, phone: dto.phone, is_active: true })
      .first();

    if (existing) {
      throw new AppError(409, 'A customer with this phone number already exists');
    }

    const [customer] = await knex('customers')
      .insert({
        tenant_id: tenantId,
        first_name: dto.firstName,
        last_name: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        birth_date: dto.birthDate,
        tags: dto.tags ? JSON.stringify(dto.tags) : null,
      })
      .returning('*');

    return mapCustomer(customer);
  }

  async update(tenantId: string, id: string, dto: UpdateCustomerDto) {
    // If phone is being updated, check uniqueness
    if (dto.phone) {
      const existing = await knex('customers')
        .where({ tenant_id: tenantId, phone: dto.phone, is_active: true })
        .whereNot({ id })
        .first();

      if (existing) {
        throw new AppError(409, 'A customer with this phone number already exists');
      }
    }

    const updateData: Record<string, unknown> = {
      updated_at: knex.fn.now(),
    };

    if (dto.firstName !== undefined) updateData.first_name = dto.firstName;
    if (dto.lastName !== undefined) updateData.last_name = dto.lastName;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.birthDate !== undefined) updateData.birth_date = dto.birthDate;
    if (dto.tags !== undefined) updateData.tags = JSON.stringify(dto.tags);

    const [updated] = await knex('customers')
      .where({ id, tenant_id: tenantId })
      .update(updateData)
      .returning('*');

    if (!updated) {
      throw new AppError(404, 'Customer not found');
    }

    return mapCustomer(updated);
  }

  async delete(tenantId: string, id: string) {
    const [deleted] = await knex('customers')
      .where({ id, tenant_id: tenantId })
      .update({
        is_active: false,
        updated_at: knex.fn.now(),
      })
      .returning('*');

    if (!deleted) {
      throw new AppError(404, 'Customer not found');
    }

    return mapCustomer(deleted);
  }

  async getProfile(tenantId: string, id: string) {
    const customer = await this.getById(tenantId, id);

    const recentTransactions = await knex('transactions')
      .where({ customer_id: id, tenant_id: tenantId })
      .orderBy('created_at', 'desc')
      .limit(10);

    const pointsLedger = await knex('points_ledger')
      .where({ customer_id: id, tenant_id: tenantId })
      .orderBy('created_at', 'desc')
      .limit(20);

    return {
      ...customer,
      recentTransactions,
      pointsLedger,
    };
  }
}
