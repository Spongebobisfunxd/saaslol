import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../../db/connection';
import { AppError } from '../../middleware/errorHandler';
import { LoyaltyService } from '../loyalty/service';
import { RewardService } from '../rewards/service';
import { StampService } from '../stamps/service';
import { TransactionService } from '../transactions/service';
import {
  RegisterDeviceDto,
  CustomerLookupDto,
  KioskSyncPayload,
  SyncResult,
} from './types';

const loyaltyService = new LoyaltyService();
const rewardService = new RewardService();
const stampService = new StampService();
const transactionService = new TransactionService();

export class KioskService {
  async registerDevice(tenantId: string, dto: RegisterDeviceDto) {
    const db = getDb();

    // Verify location exists
    const location = await db('locations')
      .where({ id: dto.locationId, tenant_id: tenantId })
      .first();

    if (!location) {
      throw new AppError(404, 'Location not found');
    }

    const deviceToken = uuidv4();

    const [device] = await db('kiosk_devices')
      .insert({
        tenant_id: tenantId,
        location_id: dto.locationId,
        name: dto.name,
        device_token: deviceToken,
        is_active: true,
      })
      .returning('*');

    return { ...device, device_token: deviceToken };
  }

  async listDevices(tenantId: string) {
    const db = getDb();

    const devices = await db('kiosk_devices')
      .leftJoin('locations', 'kiosk_devices.location_id', 'locations.id')
      .where({ 'kiosk_devices.tenant_id': tenantId })
      .select(
        'kiosk_devices.*',
        'locations.name as location_name',
      )
      .orderBy('kiosk_devices.created_at', 'desc');

    return devices;
  }

  async authenticateDevice(deviceToken: string) {
    const db = getDb();

    const device = await db('kiosk_devices')
      .leftJoin('locations', 'kiosk_devices.location_id', 'locations.id')
      .leftJoin('tenants', 'kiosk_devices.tenant_id', 'tenants.id')
      .where({
        'kiosk_devices.device_token': deviceToken,
        'kiosk_devices.is_active': true,
      })
      .select(
        'kiosk_devices.*',
        'locations.name as location_name',
        'tenants.name as tenant_name',
        'tenants.slug as tenant_slug',
      )
      .first();

    if (!device) {
      throw new AppError(401, 'Invalid or inactive device token');
    }

    // Update last_sync_at
    await db('kiosk_devices')
      .where({ id: device.id })
      .update({ last_sync_at: db.fn.now() });

    return device;
  }

  async lookupCustomer(tenantId: string, dto: CustomerLookupDto) {
    const db = getDb();

    if (!dto.phone && !dto.qrCode) {
      throw new AppError(400, 'Either phone or qrCode must be provided');
    }

    let customer;

    if (dto.phone) {
      customer = await db('customers')
        .where({ tenant_id: tenantId, phone: dto.phone, is_active: true })
        .first();
    } else if (dto.qrCode) {
      // QR code contains the customer ID
      customer = await db('customers')
        .where({ tenant_id: tenantId, id: dto.qrCode, is_active: true })
        .first();
    }

    if (!customer) {
      throw new AppError(404, 'Customer not found');
    }

    // Get active stamp cards
    const stampCards = await db('stamp_cards')
      .join('stamp_card_definitions', 'stamp_cards.definition_id', 'stamp_card_definitions.id')
      .where({
        'stamp_cards.tenant_id': tenantId,
        'stamp_cards.customer_id': customer.id,
        'stamp_cards.is_completed': false,
      })
      .select(
        'stamp_cards.*',
        'stamp_card_definitions.name as definition_name',
        'stamp_card_definitions.stamps_required',
        'stamp_card_definitions.reward_description',
      );

    return { ...customer, stampCards };
  }

  async processSyncQueue(
    tenantId: string,
    deviceId: string,
    payload: KioskSyncPayload,
  ): Promise<SyncResult[]> {
    const db = getDb();
    const results: SyncResult[] = [];

    for (const operation of payload.operations) {
      // Check if this idempotency key has already been processed
      const existing = await db('kiosk_sync_queue')
        .where({
          tenant_id: tenantId,
          device_id: deviceId,
          idempotency_key: operation.idempotencyKey,
        })
        .first();

      if (existing) {
        results.push({
          idempotencyKey: operation.idempotencyKey,
          status: 'skipped',
          message: 'Already processed',
        });
        continue;
      }

      try {
        let resultData: Record<string, unknown> = {};

        switch (operation.operation) {
          case 'add_points': {
            const pointsResult = await loyaltyService.addPoints(
              tenantId,
              operation.payload.customerId as string,
              operation.payload.amount as number,
              (operation.payload.description as string) || 'Points added via kiosk',
              'kiosk',
              deviceId,
            );
            resultData = { pointsBalance: pointsResult.customer.points_balance };
            break;
          }

          case 'redeem_reward': {
            const redeemResult = await rewardService.redeem(
              tenantId,
              operation.payload.customerId as string,
              operation.payload.rewardId as string,
            );
            resultData = {
              rewardName: redeemResult.reward.name,
              pointsRemaining: redeemResult.customer.points_balance,
            };
            break;
          }

          case 'add_stamp': {
            const stampResult = await stampService.addStamp(
              tenantId,
              operation.payload.customerId as string,
              operation.payload.definitionId as string,
              operation.payload.locationId as string | undefined,
            );
            resultData = {
              currentStamps: stampResult.current_stamps,
              stampsRequired: stampResult.stamps_required,
              justCompleted: stampResult.just_completed,
            };
            break;
          }

          case 'record_transaction': {
            const txResult = await transactionService.create(tenantId, {
              customerId: operation.payload.customerId as string,
              amount: operation.payload.amount as number,
              locationId: operation.payload.locationId as string | undefined,
              receiptNumber: operation.payload.receiptNumber as string | undefined,
              source: 'kiosk',
            });
            resultData = {
              transactionId: txResult.transaction.id,
              pointsEarned: txResult.pointsEarned,
            };
            break;
          }

          default:
            throw new Error(`Unknown operation: ${operation.operation}`);
        }

        // Record in sync queue as processed
        await db('kiosk_sync_queue').insert({
          tenant_id: tenantId,
          device_id: deviceId,
          idempotency_key: operation.idempotencyKey,
          operation: operation.operation,
          payload: JSON.stringify(operation.payload),
          status: 'processed',
          processed_at: db.fn.now(),
        });

        results.push({
          idempotencyKey: operation.idempotencyKey,
          status: 'processed',
          data: resultData,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Record in sync queue as error
        await db('kiosk_sync_queue').insert({
          tenant_id: tenantId,
          device_id: deviceId,
          idempotency_key: operation.idempotencyKey,
          operation: operation.operation,
          payload: JSON.stringify(operation.payload),
          status: 'error',
          error_message: errorMessage,
          processed_at: db.fn.now(),
        });

        results.push({
          idempotencyKey: operation.idempotencyKey,
          status: 'error',
          message: errorMessage,
        });
      }
    }

    return results;
  }

  async getDeviceSyncStatus(tenantId: string, deviceId: string) {
    const db = getDb();

    // Verify device exists
    const device = await db('kiosk_devices')
      .where({ id: deviceId, tenant_id: tenantId })
      .first();

    if (!device) {
      throw new AppError(404, 'Device not found');
    }

    const recentSync = await db('kiosk_sync_queue')
      .where({
        tenant_id: tenantId,
        device_id: deviceId,
      })
      .orderBy('created_at', 'desc')
      .limit(50);

    return {
      device,
      recentSync,
    };
  }
}
