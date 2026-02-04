import { getDb } from '../../db/connection';
import { AppError } from '../../middleware/errorHandler';
import { LoyaltyService } from '../loyalty/service';
import { CreateRewardDto, UpdateRewardDto } from './types';

const loyaltyService = new LoyaltyService();

function mapReward(row: any) {
  if (!row) return row;
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    pointsCost: Number(row.points_cost) || 0,
    status: row.status,
    imageUrl: row.image_url || null,
    stock: row.stock != null ? Number(row.stock) : null,
    category: row.category || null,
    validFrom: row.valid_from || null,
    validUntil: row.valid_until || null,
    isActive: row.status === 'active',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class RewardService {
  async list(tenantId: string) {
    const db = getDb();
    const now = new Date().toISOString();

    const rewards = await db('rewards')
      .where({ tenant_id: tenantId, status: 'active' })
      .where(function () {
        this.whereNull('valid_from').orWhere('valid_from', '<=', now);
      })
      .where(function () {
        this.whereNull('valid_until').orWhere('valid_until', '>=', now);
      })
      .orderBy('created_at', 'desc');

    return rewards.map(mapReward);
  }

  async getById(tenantId: string, id: string) {
    const db = getDb();
    const reward = await db('rewards')
      .where({ id, tenant_id: tenantId })
      .first();

    if (!reward) {
      throw new AppError(404, 'Reward not found');
    }

    return mapReward(reward);
  }

  async create(tenantId: string, dto: CreateRewardDto) {
    const db = getDb();
    const [reward] = await db('rewards')
      .insert({
        tenant_id: tenantId,
        name: dto.name,
        description: dto.description || null,
        points_cost: dto.pointsCost,
        image_url: dto.imageUrl || null,
        stock: dto.stock !== undefined ? dto.stock : null,
        valid_from: dto.validFrom || null,
        valid_until: dto.validUntil || null,
        status: 'active',
      })
      .returning('*');

    return reward;
  }

  async update(tenantId: string, id: string, dto: UpdateRewardDto) {
    const db = getDb();
    const updateData: Record<string, unknown> = {
      updated_at: db.fn.now(),
    };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.pointsCost !== undefined) updateData.points_cost = dto.pointsCost;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.imageUrl !== undefined) updateData.image_url = dto.imageUrl;
    if (dto.stock !== undefined) updateData.stock = dto.stock;
    if (dto.validFrom !== undefined) updateData.valid_from = dto.validFrom;
    if (dto.validUntil !== undefined) updateData.valid_until = dto.validUntil;

    const [updated] = await db('rewards')
      .where({ id, tenant_id: tenantId })
      .update(updateData)
      .returning('*');

    if (!updated) {
      throw new AppError(404, 'Reward not found');
    }

    return updated;
  }

  async redeem(tenantId: string, customerId: string, rewardId: string) {
    const db = getDb();

    return db.transaction(async (trx) => {
      // Get reward and validate
      const reward = await trx('rewards')
        .where({ id: rewardId, tenant_id: tenantId })
        .first();

      if (!reward) {
        throw new AppError(404, 'Reward not found');
      }

      if (reward.status !== 'active') {
        throw new AppError(400, 'Reward is not active');
      }

      const now = new Date();
      if (reward.valid_from && new Date(reward.valid_from) > now) {
        throw new AppError(400, 'Reward is not yet available');
      }

      if (reward.valid_until && new Date(reward.valid_until) < now) {
        throw new AppError(400, 'Reward has expired');
      }

      // Check stock
      if (reward.stock !== null && reward.stock <= 0) {
        throw new AppError(400, 'Reward is out of stock');
      }

      // Check customer has enough points
      const customer = await trx('customers')
        .where({ id: customerId, tenant_id: tenantId })
        .first();

      if (!customer) {
        throw new AppError(404, 'Customer not found');
      }

      if (customer.points_balance < reward.points_cost) {
        throw new AppError(400, 'Insufficient points balance');
      }

      // Decrement stock if applicable
      if (reward.stock !== null) {
        await trx('rewards')
          .where({ id: rewardId, tenant_id: tenantId })
          .decrement('stock', 1)
          .update({ updated_at: trx.fn.now() });
      }

      // Burn points using loyalty service (within the same transaction context)
      // We do the burn manually here to stay within the transaction
      const [updatedCustomer] = await trx('customers')
        .where({ id: customerId, tenant_id: tenantId })
        .decrement('points_balance', reward.points_cost)
        .update({ updated_at: trx.fn.now() })
        .returning('*');

      const [ledgerEntry] = await trx('points_ledger')
        .insert({
          tenant_id: tenantId,
          customer_id: customerId,
          type: 'burn',
          amount: -reward.points_cost,
          balance_after: updatedCustomer.points_balance,
          description: `Redeemed reward: ${reward.name}`,
          reference_type: 'reward_redemption',
          reference_id: rewardId,
        })
        .returning('*');

      // Create redemption record in voucher_redemptions or a simple return
      // Since there's no dedicated reward_redemptions table, we return the ledger entry as the record
      return {
        reward,
        customer: updatedCustomer,
        ledgerEntry,
        redeemedAt: new Date().toISOString(),
      };
    });
  }
}
