import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../../db/connection';
import { AppError } from '../../middleware/errorHandler';
import { CreatePaymentDto, PaymentNotificationDto } from './types';

export class PaymentService {
  async createPayment(tenantId: string, dto: CreatePaymentDto) {
    const db = getDb();

    // If customerId is provided, verify the customer exists
    if (dto.customerId) {
      const customer = await db('customers')
        .where({ id: dto.customerId, tenant_id: tenantId })
        .first();

      if (!customer) {
        throw new AppError(404, 'Customer not found');
      }
    }

    const externalId = uuidv4();

    const [payment] = await db('payment_events')
      .insert({
        tenant_id: tenantId,
        provider: dto.paymentMethod || 'manual',
        external_id: externalId,
        status: 'pending',
        amount: dto.amount,
        currency: dto.currency || 'PLN',
        payment_method: dto.paymentMethod || null,
        customer_id: dto.customerId || null,
        metadata: JSON.stringify({
          description: dto.description || null,
        }),
      })
      .returning('*');

    return payment;
  }

  async handleNotification(dto: PaymentNotificationDto) {
    const db = getDb();

    // Find the payment event by provider and external ID
    const payment = await db('payment_events')
      .where({
        provider: dto.provider,
        external_id: dto.externalId,
      })
      .first();

    if (!payment) {
      throw new AppError(404, 'Payment event not found');
    }

    // Update the payment status
    const [updated] = await db('payment_events')
      .where({ id: payment.id })
      .update({
        status: dto.status,
        metadata: JSON.stringify({
          ...(typeof payment.metadata === 'string'
            ? JSON.parse(payment.metadata)
            : payment.metadata),
          ...(dto.metadata || {}),
          notification_received_at: new Date().toISOString(),
        }),
        updated_at: db.fn.now(),
      })
      .returning('*');

    return updated;
  }

  async getPayments(tenantId: string, page: number, pageSize: number) {
    const db = getDb();

    const query = db('payment_events')
      .where({ 'payment_events.tenant_id': tenantId });

    // Count total before pagination
    const countQuery = query.clone().count('* as total').first();
    const { total } = (await countQuery) as { total: string };
    const totalCount = parseInt(total, 10);

    // Apply pagination
    const offset = (page - 1) * pageSize;
    const data = await query
      .leftJoin('customers', 'payment_events.customer_id', 'customers.id')
      .select(
        'payment_events.*',
        'customers.first_name as customer_first_name',
        'customers.last_name as customer_last_name',
      )
      .orderBy('payment_events.created_at', 'desc')
      .limit(pageSize)
      .offset(offset);

    return {
      data,
      total: totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  }

  async getById(tenantId: string, id: string) {
    const db = getDb();

    const payment = await db('payment_events')
      .leftJoin('customers', 'payment_events.customer_id', 'customers.id')
      .where({
        'payment_events.id': id,
        'payment_events.tenant_id': tenantId,
      })
      .select(
        'payment_events.*',
        'customers.first_name as customer_first_name',
        'customers.last_name as customer_last_name',
      )
      .first();

    if (!payment) {
      throw new AppError(404, 'Payment not found');
    }

    return payment;
  }
}
