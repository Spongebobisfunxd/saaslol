import { getDb } from '../../db/connection';
import { AppError } from '../../middleware/errorHandler';
import { CreateStampCardDefDto, UpdateStampCardDefDto } from './types';

function mapDefinition(row: any) {
  if (!row) return row;
  return {
    id: row.id,
    name: row.name,
    description: row.reward_description || null,
    stampsRequired: Number(row.stamps_required) || 0,
    rewardDescription: row.reward_description || '',
    status: row.is_active ? 'active' : 'inactive',
    imageUrl: row.image_url || null,
    rewardId: row.reward_id || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCard(row: any) {
  if (!row) return row;
  return {
    id: row.id,
    customerId: row.customer_id,
    definitionId: row.definition_id,
    currentStamps: Number(row.current_stamps) || 0,
    stampsRequired: Number(row.stamps_required) || 0,
    isCompleted: !!row.is_completed,
    completedAt: row.completed_at || null,
    definitionName: row.definition_name || null,
    rewardDescription: row.reward_description || null,
    imageUrl: row.definition_image_url || row.image_url || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class StampService {
  async listDefinitions(tenantId: string) {
    const db = getDb();
    const definitions = await db('stamp_card_definitions')
      .where({ tenant_id: tenantId })
      .orderBy('created_at', 'desc');

    return definitions.map(mapDefinition);
  }

  async getDefinitionById(tenantId: string, id: string) {
    const db = getDb();
    const definition = await db('stamp_card_definitions')
      .where({ id, tenant_id: tenantId })
      .first();

    if (!definition) {
      throw new AppError(404, 'Stamp card definition not found');
    }

    return mapDefinition(definition);
  }

  async createDefinition(tenantId: string, dto: CreateStampCardDefDto) {
    const db = getDb();
    const [definition] = await db('stamp_card_definitions')
      .insert({
        tenant_id: tenantId,
        name: dto.name,
        stamps_required: dto.stampsRequired,
        reward_description: dto.rewardDescription,
        reward_id: dto.rewardId || null,
        image_url: dto.imageUrl || null,
        is_active: dto.isActive !== undefined ? dto.isActive : true,
      })
      .returning('*');

    return mapDefinition(definition);
  }

  async updateDefinition(tenantId: string, id: string, dto: UpdateStampCardDefDto) {
    const db = getDb();
    const updateData: Record<string, unknown> = {
      updated_at: db.fn.now(),
    };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.stampsRequired !== undefined) updateData.stamps_required = dto.stampsRequired;
    if (dto.rewardDescription !== undefined) updateData.reward_description = dto.rewardDescription;
    if (dto.rewardId !== undefined) updateData.reward_id = dto.rewardId;
    if (dto.imageUrl !== undefined) updateData.image_url = dto.imageUrl;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    const [updated] = await db('stamp_card_definitions')
      .where({ id, tenant_id: tenantId })
      .update(updateData)
      .returning('*');

    if (!updated) {
      throw new AppError(404, 'Stamp card definition not found');
    }

    return mapDefinition(updated);
  }

  async getCustomerCards(tenantId: string, customerId: string) {
    const db = getDb();

    const customer = await db('customers')
      .where({ id: customerId, tenant_id: tenantId })
      .first();

    if (!customer) {
      throw new AppError(404, 'Customer not found');
    }

    const cards = await db('stamp_cards')
      .join('stamp_card_definitions', 'stamp_cards.definition_id', 'stamp_card_definitions.id')
      .where({
        'stamp_cards.tenant_id': tenantId,
        'stamp_cards.customer_id': customerId,
      })
      .select(
        'stamp_cards.*',
        'stamp_card_definitions.name as definition_name',
        'stamp_card_definitions.stamps_required',
        'stamp_card_definitions.reward_description',
        'stamp_card_definitions.image_url as definition_image_url',
      )
      .orderBy('stamp_cards.created_at', 'desc');

    return cards.map(mapCard);
  }

  async listCards(tenantId: string, customerId?: string) {
    const db = getDb();

    let query = db('stamp_cards')
      .join('stamp_card_definitions', 'stamp_cards.definition_id', 'stamp_card_definitions.id')
      .where({ 'stamp_cards.tenant_id': tenantId });

    if (customerId) {
      query = query.where({ 'stamp_cards.customer_id': customerId });
    }

    const cards = await query
      .select(
        'stamp_cards.*',
        'stamp_card_definitions.name as definition_name',
        'stamp_card_definitions.stamps_required',
        'stamp_card_definitions.reward_description',
        'stamp_card_definitions.image_url as definition_image_url',
      )
      .orderBy('stamp_cards.created_at', 'desc');

    return cards.map(mapCard);
  }

  async addStamp(
    tenantId: string,
    customerId: string,
    definitionId: string,
    locationId?: string,
  ) {
    const db = getDb();

    return db.transaction(async (trx) => {
      const definition = await trx('stamp_card_definitions')
        .where({ id: definitionId, tenant_id: tenantId, is_active: true })
        .first();

      if (!definition) {
        throw new AppError(404, 'Stamp card definition not found or inactive');
      }

      const customer = await trx('customers')
        .where({ id: customerId, tenant_id: tenantId })
        .first();

      if (!customer) {
        throw new AppError(404, 'Customer not found');
      }

      let card = await trx('stamp_cards')
        .where({
          tenant_id: tenantId,
          customer_id: customerId,
          definition_id: definitionId,
          is_completed: false,
        })
        .first();

      if (!card) {
        const [newCard] = await trx('stamp_cards')
          .insert({
            tenant_id: tenantId,
            customer_id: customerId,
            definition_id: definitionId,
            current_stamps: 0,
            is_completed: false,
          })
          .returning('*');

        card = newCard;
      }

      const newStampCount = card.current_stamps + 1;
      const isCompleted = newStampCount >= definition.stamps_required;

      const updateData: Record<string, unknown> = {
        current_stamps: newStampCount,
        updated_at: trx.fn.now(),
      };

      if (isCompleted) {
        updateData.is_completed = true;
        updateData.completed_at = trx.fn.now();
      }

      const [updatedCard] = await trx('stamp_cards')
        .where({ id: card.id })
        .update(updateData)
        .returning('*');

      await trx('stamp_events')
        .insert({
          tenant_id: tenantId,
          stamp_card_id: card.id,
          location_id: locationId || null,
          stamps_added: 1,
        });

      return mapCard({
        ...updatedCard,
        definition_name: definition.name,
        stamps_required: definition.stamps_required,
        reward_description: definition.reward_description,
        definition_image_url: definition.image_url,
      });
    });
  }

  async getCard(tenantId: string, cardId: string) {
    const db = getDb();

    const card = await db('stamp_cards')
      .join('stamp_card_definitions', 'stamp_cards.definition_id', 'stamp_card_definitions.id')
      .where({
        'stamp_cards.id': cardId,
        'stamp_cards.tenant_id': tenantId,
      })
      .select(
        'stamp_cards.*',
        'stamp_card_definitions.name as definition_name',
        'stamp_card_definitions.stamps_required',
        'stamp_card_definitions.reward_description',
        'stamp_card_definitions.image_url as definition_image_url',
      )
      .first();

    if (!card) {
      throw new AppError(404, 'Stamp card not found');
    }

    const events = await db('stamp_events')
      .leftJoin('locations', 'stamp_events.location_id', 'locations.id')
      .where({ 'stamp_events.stamp_card_id': cardId, 'stamp_events.tenant_id': tenantId })
      .select(
        'stamp_events.*',
        'locations.name as location_name',
      )
      .orderBy('stamp_events.created_at', 'desc');

    return { ...mapCard(card), events };
  }
}
