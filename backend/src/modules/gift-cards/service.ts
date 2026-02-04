import crypto from 'crypto';
import { getDb } from '../../db/connection';
import { AppError } from '../../middleware/errorHandler';
import { CreateGiftCardDto, GiftCardTransactionDto } from './types';

function mapGiftCard(row: any) {
  if (!row) return row;
  return {
    id: row.id,
    code: row.code,
    initialAmountGrosze: Number(row.initial_balance) || 0,
    currentAmountGrosze: Number(row.current_balance) || 0,
    status: row.status,
    customerId: row.issued_to_customer_id || null,
    expiresAt: row.expires_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class GiftCardService {
  async list(tenantId: string) {
    const db = getDb();
    const giftCards = await db('gift_cards')
      .where({ tenant_id: tenantId })
      .orderBy('created_at', 'desc');

    return giftCards.map(mapGiftCard);
  }

  async getById(tenantId: string, id: string) {
    const db = getDb();
    const giftCard = await db('gift_cards')
      .where({ id, tenant_id: tenantId })
      .first();

    if (!giftCard) {
      throw new AppError(404, 'Gift card not found');
    }

    const transactions = await db('gift_card_transactions')
      .where({ gift_card_id: id, tenant_id: tenantId })
      .orderBy('created_at', 'desc');

    return {
      ...mapGiftCard(giftCard),
      transactions: transactions.map((t: any) => ({
        id: t.id,
        type: t.type,
        amount: Number(t.amount) || 0,
        balanceAfter: Number(t.balance_after) || 0,
        description: t.description,
        createdAt: t.created_at,
      })),
    };
  }

  async create(tenantId: string, dto: CreateGiftCardDto) {
    const db = getDb();
    const code = this.generateCode();

    const [giftCard] = await db('gift_cards')
      .insert({
        tenant_id: tenantId,
        code,
        initial_balance: dto.initialBalance,
        current_balance: dto.initialBalance,
        issued_to_customer_id: dto.issuedToCustomerId || null,
        expires_at: dto.expiresAt || null,
        status: 'active',
      })
      .returning('*');

    return mapGiftCard(giftCard);
  }

  async addTransaction(tenantId: string, dto: GiftCardTransactionDto) {
    const db = getDb();

    return db.transaction(async (trx) => {
      const giftCard = await trx('gift_cards')
        .where({ id: dto.giftCardId, tenant_id: tenantId })
        .first();

      if (!giftCard) {
        throw new AppError(404, 'Gift card not found');
      }

      if (giftCard.status !== 'active') {
        throw new AppError(400, 'Gift card is not active');
      }

      if (giftCard.expires_at && new Date(giftCard.expires_at) < new Date()) {
        throw new AppError(400, 'Gift card has expired');
      }

      let newBalance: number;

      if (dto.type === 'redeem') {
        if (giftCard.current_balance < dto.amount) {
          throw new AppError(400, 'Insufficient gift card balance');
        }
        newBalance = Number(giftCard.current_balance) - dto.amount;
      } else {
        newBalance = Number(giftCard.current_balance) + dto.amount;
      }

      const [updatedCard] = await trx('gift_cards')
        .where({ id: dto.giftCardId, tenant_id: tenantId })
        .update({
          current_balance: newBalance,
          status: newBalance === 0 ? 'depleted' : 'active',
          updated_at: trx.fn.now(),
        })
        .returning('*');

      const [transaction] = await trx('gift_card_transactions')
        .insert({
          tenant_id: tenantId,
          gift_card_id: dto.giftCardId,
          type: dto.type,
          amount: dto.type === 'redeem' ? -dto.amount : dto.amount,
          balance_after: newBalance,
          description: dto.description || null,
        })
        .returning('*');

      return { giftCard: mapGiftCard(updatedCard), transaction };
    });
  }

  async cancel(tenantId: string, id: string) {
    const db = getDb();

    const [updated] = await db('gift_cards')
      .where({ id, tenant_id: tenantId })
      .update({
        status: 'cancelled',
        updated_at: db.fn.now(),
      })
      .returning('*');

    if (!updated) {
      throw new AppError(404, 'Gift card not found');
    }

    return mapGiftCard(updated);
  }

  private generateCode(): string {
    const hex = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `GC-${hex}`;
  }
}
