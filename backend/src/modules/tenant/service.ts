import { getDb } from '../../db/connection';
import { AppError } from '../../middleware/errorHandler';
import { UpdateTenantDto, CreateLocationDto, UpdateLocationDto } from './types';

const knex = getDb();

export class TenantService {
  async getTenant(tenantId: string) {
    const tenant = await knex('tenants')
      .where({ id: tenantId })
      .first();

    if (!tenant) {
      throw new AppError(404, 'Tenant not found');
    }

    return tenant;
  }

  async updateTenant(tenantId: string, dto: UpdateTenantDto) {
    const [updated] = await knex('tenants')
      .where({ id: tenantId })
      .update({
        ...dto,
        updated_at: knex.fn.now(),
      })
      .returning('*');

    if (!updated) {
      throw new AppError(404, 'Tenant not found');
    }

    return updated;
  }

  async getLocations(tenantId: string) {
    const locations = await knex('locations')
      .where({ tenant_id: tenantId, is_active: true })
      .orderBy('name', 'asc');

    return locations;
  }

  async createLocation(tenantId: string, dto: CreateLocationDto) {
    const [location] = await knex('locations')
      .insert({
        tenant_id: tenantId,
        name: dto.name,
        address: dto.address,
        city: dto.city,
        postal_code: dto.postalCode,
        phone: dto.phone,
        latitude: dto.latitude,
        longitude: dto.longitude,
      })
      .returning('*');

    return location;
  }

  async updateLocation(tenantId: string, locationId: string, dto: UpdateLocationDto) {
    const updateData: Record<string, unknown> = {
      updated_at: knex.fn.now(),
    };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.address !== undefined) updateData.address = dto.address;
    if (dto.city !== undefined) updateData.city = dto.city;
    if (dto.postalCode !== undefined) updateData.postal_code = dto.postalCode;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.latitude !== undefined) updateData.latitude = dto.latitude;
    if (dto.longitude !== undefined) updateData.longitude = dto.longitude;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    const [updated] = await knex('locations')
      .where({ id: locationId, tenant_id: tenantId })
      .update(updateData)
      .returning('*');

    if (!updated) {
      throw new AppError(404, 'Location not found');
    }

    return updated;
  }

  async deleteLocation(tenantId: string, locationId: string) {
    const [deleted] = await knex('locations')
      .where({ id: locationId, tenant_id: tenantId })
      .update({
        is_active: false,
        updated_at: knex.fn.now(),
      })
      .returning('*');

    if (!deleted) {
      throw new AppError(404, 'Location not found');
    }

    return deleted;
  }
}
