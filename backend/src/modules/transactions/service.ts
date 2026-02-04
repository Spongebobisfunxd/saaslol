import { getDb } from '../../db/connection';
import { AppError } from '../../middleware/errorHandler';
import { LoyaltyService } from '../loyalty/service';
import { CreateTransactionDto, TransactionFilter } from './types';

const loyaltyService = new LoyaltyService();

function mapTransaction(row: any) {
  return {
    id: row.id,
    customerId: row.customer_id,
    type: row.source || 'purchase',
    amountGrosze: Number(row.amount) || 0,
    pointsEarned: Number(row.points_earned) || 0,
    pointsSpent: Number(row.points_spent) || 0,
    description: row.receipt_number || null,
    locationId: row.location_id,
    customerFirstName: row.customer_first_name,
    customerLastName: row.customer_last_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Map sortBy from camelCase to snake_case column names
const SORT_COLUMNS: Record<string, string> = {
  createdAt: 'transactions.created_at',
  amount: 'transactions.amount',
  type: 'transactions.source',
};

export class TransactionService {
  async list(tenantId: string, filter: TransactionFilter) {
    const db = getDb();

    const query = db('transactions')
      .where({ 'transactions.tenant_id': tenantId });

    if (filter.customerId) {
      query.where('transactions.customer_id', filter.customerId);
    }

    if (filter.locationId) {
      query.where('transactions.location_id', filter.locationId);
    }

    if (filter.startDate) {
      query.where('transactions.created_at', '>=', filter.startDate);
    }

    if (filter.endDate) {
      query.where('transactions.created_at', '<=', filter.endDate);
    }

    // Count total before pagination
    const countQuery = query.clone().count('* as total').first();
    const { total } = (await countQuery) as { total: string };
    const totalCount = parseInt(total, 10);

    // Sorting
    const sortColumn = SORT_COLUMNS[filter.sortBy || ''] || 'transactions.created_at';
    const sortOrder = filter.sortOrder || 'desc';

    // Apply pagination
    const offset = (filter.page - 1) * filter.pageSize;
    const rows = await query
      .leftJoin('customers', 'transactions.customer_id', 'customers.id')
      .leftJoin(
        db.raw(`(
          SELECT reference_id,
            COALESCE(SUM(CASE WHEN type = 'earn' THEN amount ELSE 0 END), 0) as points_earned,
            COALESCE(SUM(CASE WHEN type = 'burn' THEN ABS(amount) ELSE 0 END), 0) as points_spent
          FROM points_ledger
          WHERE tenant_id = ? AND reference_type = 'transaction'
          GROUP BY reference_id
        ) as pl`, [tenantId]),
        'pl.reference_id', 'transactions.id',
      )
      .select(
        'transactions.*',
        'customers.first_name as customer_first_name',
        'customers.last_name as customer_last_name',
        'pl.points_earned',
        'pl.points_spent',
      )
      .orderBy(sortColumn, sortOrder)
      .limit(filter.pageSize)
      .offset(offset);

    return {
      data: rows.map(mapTransaction),
      total: totalCount,
      page: filter.page,
      limit: filter.pageSize,
      totalPages: Math.ceil(totalCount / filter.pageSize),
    };
  }

  async getById(tenantId: string, id: string) {
    const db = getDb();

    const row = await db('transactions')
      .leftJoin('customers', 'transactions.customer_id', 'customers.id')
      .leftJoin(
        db.raw(`(
          SELECT reference_id,
            COALESCE(SUM(CASE WHEN type = 'earn' THEN amount ELSE 0 END), 0) as points_earned,
            COALESCE(SUM(CASE WHEN type = 'burn' THEN ABS(amount) ELSE 0 END), 0) as points_spent
          FROM points_ledger
          WHERE tenant_id = ? AND reference_type = 'transaction'
          GROUP BY reference_id
        ) as pl`, [tenantId]),
        'pl.reference_id', 'transactions.id',
      )
      .where({ 'transactions.id': id, 'transactions.tenant_id': tenantId })
      .select(
        'transactions.*',
        'customers.first_name as customer_first_name',
        'customers.last_name as customer_last_name',
        'pl.points_earned',
        'pl.points_spent',
      )
      .first();

    if (!row) {
      throw new AppError(404, 'Transaction not found');
    }

    return mapTransaction(row);
  }

  async create(tenantId: string, dto: CreateTransactionDto) {
    const db = getDb();

    return db.transaction(async (trx) => {
      // Verify customer exists
      const customer = await trx('customers')
        .where({ id: dto.customerId, tenant_id: tenantId })
        .first();

      if (!customer) {
        throw new AppError(404, 'Customer not found');
      }

      // Create the transaction record
      const [transaction] = await trx('transactions')
        .insert({
          tenant_id: tenantId,
          customer_id: dto.customerId,
          amount: dto.amount,
          location_id: dto.locationId || null,
          receipt_number: dto.receiptNumber || null,
          source: dto.source || 'pos',
        })
        .returning('*');

      // Calculate points for this transaction
      const pointsEarned = await loyaltyService.calculatePointsForTransaction(
        tenantId,
        dto.amount,
        dto.customerId,
      );

      // Award points if any were earned
      let pointsResult = null;
      if (pointsEarned > 0) {
        pointsResult = await loyaltyService.addPoints(
          tenantId,
          dto.customerId,
          pointsEarned,
          `Points earned from transaction #${transaction.id}`,
          'transaction',
          transaction.id,
        );
      }

      // Update customer.total_spent and last_visit_at
      await trx('customers')
        .where({ id: dto.customerId, tenant_id: tenantId })
        .increment('total_spent', dto.amount)
        .update({
          last_visit_at: trx.fn.now(),
          updated_at: trx.fn.now(),
        });

      return {
        transaction: mapTransaction({ ...transaction, points_earned: pointsEarned, points_spent: 0 }),
        pointsEarned,
        pointsResult,
      };
    });
  }
}
