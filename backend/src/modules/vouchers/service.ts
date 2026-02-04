import crypto from 'crypto';
import { getDb } from '../../db/connection';
import { AppError } from '../../middleware/errorHandler';
import { CreateVoucherDto, RedeemVoucherDto } from './types';

function mapVoucher(row: any) {
  if (!row) return row;
  return {
    id: row.id,
    code: row.code,
    type: row.discount_type || 'percentage',
    discountPercent: row.discount_type === 'percentage' ? Number(row.discount_value) || 0 : undefined,
    discountAmountGrosze: row.discount_type === 'fixed' ? Number(row.discount_value) || 0 : undefined,
    productId: null,
    maxUses: Number(row.max_uses) || 1,
    currentUses: Number(row.current_uses) || 0,
    status: row.status,
    validFrom: row.created_at,
    validUntil: row.expires_at || null,
    customerId: row.customer_id || null,
    minPurchaseAmount: Number(row.min_purchase_amount) || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class VoucherService {
  async list(tenantId: string) {
    const db = getDb();
    const vouchers = await db('vouchers')
      .where({ tenant_id: tenantId })
      .orderBy('created_at', 'desc');

    return vouchers.map(mapVoucher);
  }

  async getById(tenantId: string, id: string) {
    const db = getDb();
    const voucher = await db('vouchers')
      .where({ id, tenant_id: tenantId })
      .first();

    if (!voucher) {
      throw new AppError(404, 'Voucher not found');
    }

    return mapVoucher(voucher);
  }

  async create(tenantId: string, dto: CreateVoucherDto) {
    const db = getDb();
    const code = this.generateCode();

    const [voucher] = await db('vouchers')
      .insert({
        tenant_id: tenantId,
        code,
        discount_type: dto.discountType,
        discount_value: dto.discountValue,
        customer_id: dto.customerId || null,
        min_purchase_amount: dto.minPurchaseAmount || null,
        expires_at: dto.expiresAt || null,
        max_uses: dto.maxUses || 1,
        current_uses: 0,
        status: 'active',
      })
      .returning('*');

    return mapVoucher(voucher);
  }

  async redeem(tenantId: string, dto: RedeemVoucherDto) {
    const db = getDb();

    return db.transaction(async (trx) => {
      const voucher = await trx('vouchers')
        .where({ code: dto.code, tenant_id: tenantId })
        .first();

      if (!voucher) {
        throw new AppError(404, 'Voucher not found');
      }

      if (voucher.status !== 'active') {
        throw new AppError(400, 'Voucher is not active');
      }

      if (voucher.expires_at && new Date(voucher.expires_at) < new Date()) {
        throw new AppError(400, 'Voucher has expired');
      }

      if (voucher.min_purchase_amount && dto.purchaseAmount < Number(voucher.min_purchase_amount)) {
        throw new AppError(
          400,
          `Minimum purchase amount of ${voucher.min_purchase_amount} not met`,
        );
      }

      if (voucher.customer_id && voucher.customer_id !== dto.customerId) {
        throw new AppError(403, 'This voucher is assigned to a different customer');
      }

      if (voucher.max_uses && Number(voucher.current_uses) >= Number(voucher.max_uses)) {
        throw new AppError(400, 'Voucher has reached maximum uses');
      }

      let discountApplied: number;
      if (voucher.discount_type === 'percentage') {
        discountApplied = Math.round(dto.purchaseAmount * (Number(voucher.discount_value) / 100) * 100) / 100;
      } else {
        discountApplied = Math.min(Number(voucher.discount_value), dto.purchaseAmount);
      }

      const newUses = (Number(voucher.current_uses) || 0) + 1;
      const newStatus = voucher.max_uses && newUses >= Number(voucher.max_uses) ? 'redeemed' : 'active';

      const [updatedVoucher] = await trx('vouchers')
        .where({ id: voucher.id, tenant_id: tenantId })
        .update({
          status: newStatus,
          current_uses: newUses,
          updated_at: trx.fn.now(),
        })
        .returning('*');

      const [redemption] = await trx('voucher_redemptions')
        .insert({
          tenant_id: tenantId,
          voucher_id: voucher.id,
          customer_id: dto.customerId,
          transaction_id: dto.transactionId || null,
          purchase_amount: dto.purchaseAmount,
          discount_applied: discountApplied,
        })
        .returning('*');

      return { voucher: mapVoucher(updatedVoucher), redemption };
    });
  }

  async cancel(tenantId: string, id: string) {
    const db = getDb();

    const [updated] = await db('vouchers')
      .where({ id, tenant_id: tenantId })
      .update({
        status: 'cancelled',
        updated_at: db.fn.now(),
      })
      .returning('*');

    if (!updated) {
      throw new AppError(404, 'Voucher not found');
    }

    return mapVoucher(updated);
  }

  private generateCode(): string {
    const hex = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `V-${hex}`;
  }
}
