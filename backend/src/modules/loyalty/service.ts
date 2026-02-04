import { getDb } from '../../db/connection';
import { AppError } from '../../middleware/errorHandler';
import { CreateProgramDto, UpdateProgramDto } from './types';

export class LoyaltyService {
  async list(tenantId: string) {
    const db = getDb();
    const programs = await db('loyalty_programs')
      .where({ tenant_id: tenantId })
      .orderBy('created_at', 'desc');

    return programs;
  }

  async getById(tenantId: string, id: string) {
    const db = getDb();
    const program = await db('loyalty_programs')
      .where({ id, tenant_id: tenantId })
      .first();

    if (!program) {
      throw new AppError(404, 'Loyalty program not found');
    }

    const tiers = await db('tiers')
      .where({ program_id: id, tenant_id: tenantId })
      .orderBy('sort_order', 'asc');

    return { ...program, tiers };
  }

  async create(tenantId: string, dto: CreateProgramDto) {
    const db = getDb();
    const [program] = await db('loyalty_programs')
      .insert({
        tenant_id: tenantId,
        name: dto.name,
        type: dto.type || 'points',
        description: dto.description,
        earn_rules: JSON.stringify(dto.earnRules),
        burn_rules: JSON.stringify(dto.burnRules),
        is_active: dto.isActive !== undefined ? dto.isActive : true,
      })
      .returning('*');

    return program;
  }

  async update(tenantId: string, id: string, dto: UpdateProgramDto) {
    const db = getDb();
    const updateData: Record<string, unknown> = {
      updated_at: db.fn.now(),
    };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.earnRules !== undefined) updateData.earn_rules = JSON.stringify(dto.earnRules);
    if (dto.burnRules !== undefined) updateData.burn_rules = JSON.stringify(dto.burnRules);
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    const [updated] = await db('loyalty_programs')
      .where({ id, tenant_id: tenantId })
      .update(updateData)
      .returning('*');

    if (!updated) {
      throw new AppError(404, 'Loyalty program not found');
    }

    return updated;
  }

  async delete(tenantId: string, id: string) {
    const db = getDb();
    const [deleted] = await db('loyalty_programs')
      .where({ id, tenant_id: tenantId })
      .update({
        is_active: false,
        updated_at: db.fn.now(),
      })
      .returning('*');

    if (!deleted) {
      throw new AppError(404, 'Loyalty program not found');
    }

    return deleted;
  }

  async calculatePointsForTransaction(
    tenantId: string,
    amount: number,
    customerId: string,
  ): Promise<number> {
    const db = getDb();

    // Get the active loyalty program for this tenant
    const program = await db('loyalty_programs')
      .where({ tenant_id: tenantId, is_active: true })
      .first();

    if (!program) {
      return 0;
    }

    const earnRules = typeof program.earn_rules === 'string'
      ? JSON.parse(program.earn_rules)
      : program.earn_rules;

    if (!earnRules || earnRules.length === 0) {
      return 0;
    }

    // Get customer tier for multiplier
    const customer = await db('customers')
      .where({ id: customerId, tenant_id: tenantId })
      .first();

    if (!customer) {
      throw new AppError(404, 'Customer not found');
    }

    let tierMultiplier = 1.0;
    if (customer.tier_id) {
      const tier = await db('tiers')
        .where({ id: customer.tier_id, tenant_id: tenantId })
        .first();

      if (tier) {
        tierMultiplier = parseFloat(tier.multiplier) || 1.0;
      }
    }

    // Apply earn rules - amount is in grosze
    let totalPoints = 0;

    for (const rule of earnRules) {
      if (rule.minAmount && amount < rule.minAmount) {
        continue;
      }

      let points = 0;

      switch (rule.type) {
        case 'per_amount':
          // e.g., 1 point per 100 grosze (1 PLN)
          points = Math.floor(amount / rule.value);
          break;
        case 'fixed':
          // Fixed points per transaction
          points = rule.value;
          break;
        case 'multiplier':
          // Multiply the amount by the value
          points = Math.floor(amount * rule.value);
          break;
      }

      if (rule.maxPoints && points > rule.maxPoints) {
        points = rule.maxPoints;
      }

      totalPoints += points;
    }

    // Apply tier multiplier
    totalPoints = Math.floor(totalPoints * tierMultiplier);

    return totalPoints;
  }

  async addPoints(
    tenantId: string,
    customerId: string,
    amount: number,
    description: string,
    referenceType?: string,
    referenceId?: string,
  ) {
    const db = getDb();

    return db.transaction(async (trx) => {
      // Update customer balance atomically
      const [customer] = await trx('customers')
        .where({ id: customerId, tenant_id: tenantId })
        .increment('points_balance', amount)
        .increment('total_points_earned', amount)
        .update({ updated_at: trx.fn.now() })
        .returning('*');

      if (!customer) {
        throw new AppError(404, 'Customer not found');
      }

      // Insert ledger entry with balance_after
      const [ledgerEntry] = await trx('points_ledger')
        .insert({
          tenant_id: tenantId,
          customer_id: customerId,
          type: 'earn',
          amount,
          balance_after: customer.points_balance,
          description,
          reference_type: referenceType || null,
          reference_id: referenceId || null,
        })
        .returning('*');

      return { customer, ledgerEntry };
    });
  }

  async burnPoints(
    tenantId: string,
    customerId: string,
    amount: number,
    description: string,
    referenceType?: string,
    referenceId?: string,
  ) {
    const db = getDb();

    return db.transaction(async (trx) => {
      // Check current balance
      const currentCustomer = await trx('customers')
        .where({ id: customerId, tenant_id: tenantId })
        .first();

      if (!currentCustomer) {
        throw new AppError(404, 'Customer not found');
      }

      if (currentCustomer.points_balance < amount) {
        throw new AppError(400, 'Insufficient points balance');
      }

      // Deduct points atomically
      const [customer] = await trx('customers')
        .where({ id: customerId, tenant_id: tenantId })
        .decrement('points_balance', amount)
        .update({ updated_at: trx.fn.now() })
        .returning('*');

      // Insert ledger entry with negative amount
      const [ledgerEntry] = await trx('points_ledger')
        .insert({
          tenant_id: tenantId,
          customer_id: customerId,
          type: 'burn',
          amount: -amount,
          balance_after: customer.points_balance,
          description,
          reference_type: referenceType || null,
          reference_id: referenceId || null,
        })
        .returning('*');

      return { customer, ledgerEntry };
    });
  }
}
