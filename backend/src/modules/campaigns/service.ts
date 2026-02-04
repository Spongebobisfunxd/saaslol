import { getDb } from '../../db/connection';
import { AppError } from '../../middleware/errorHandler';
import { CreateCampaignDto, UpdateCampaignDto } from './types';

function mapCampaign(row: any) {
  if (!row) return row;
  return {
    id: row.id,
    name: row.name,
    description: row.subject || '',
    type: row.channel || 'email',
    status: row.status,
    channel: row.channel,
    startDate: row.scheduled_at || row.created_at,
    endDate: null,
    targetAudience: row.audience_filter ? (typeof row.audience_filter === 'string' ? row.audience_filter : JSON.stringify(row.audience_filter)) : null,
    bonusPoints: 0,
    multiplier: 1,
    subject: row.subject,
    content: row.content,
    message: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class CampaignService {
  async list(tenantId: string) {
    const db = getDb();

    const campaigns = await db('campaigns')
      .where({ tenant_id: tenantId })
      .orderBy('created_at', 'desc');

    return campaigns.map(mapCampaign);
  }

  async getById(tenantId: string, id: string) {
    const db = getDb();

    const campaign = await db('campaigns')
      .where({ id, tenant_id: tenantId })
      .first();

    if (!campaign) {
      throw new AppError(404, 'Campaign not found');
    }

    const stats = await db('campaign_recipients')
      .where({ campaign_id: id, tenant_id: tenantId })
      .select(
        db.raw('COUNT(*) as total_recipients'),
        db.raw("COUNT(*) FILTER (WHERE status = 'sent') as sent_count"),
        db.raw("COUNT(*) FILTER (WHERE status = 'delivered') as delivered_count"),
        db.raw("COUNT(*) FILTER (WHERE status = 'opened') as opened_count"),
        db.raw("COUNT(*) FILTER (WHERE status = 'clicked') as clicked_count"),
        db.raw("COUNT(*) FILTER (WHERE status = 'failed') as failed_count"),
      )
      .first();

    return {
      ...mapCampaign(campaign),
      stats: {
        totalRecipients: Number(stats?.total_recipients) || 0,
        sentCount: Number(stats?.sent_count) || 0,
        deliveredCount: Number(stats?.delivered_count) || 0,
        openedCount: Number(stats?.opened_count) || 0,
        clickedCount: Number(stats?.clicked_count) || 0,
        failedCount: Number(stats?.failed_count) || 0,
      },
    };
  }

  async create(tenantId: string, dto: CreateCampaignDto) {
    const db = getDb();

    const [campaign] = await db('campaigns')
      .insert({
        tenant_id: tenantId,
        name: dto.name,
        channel: dto.channel,
        subject: dto.subject || null,
        content: dto.content,
        audience_filter: dto.audienceFilter
          ? JSON.stringify(dto.audienceFilter)
          : null,
        scheduled_at: dto.scheduledAt || null,
        status: 'draft',
      })
      .returning('*');

    return mapCampaign(campaign);
  }

  async update(tenantId: string, id: string, dto: UpdateCampaignDto) {
    const db = getDb();

    const existing = await db('campaigns')
      .where({ id, tenant_id: tenantId })
      .first();

    if (!existing) {
      throw new AppError(404, 'Campaign not found');
    }

    if (existing.status !== 'draft') {
      throw new AppError(400, 'Only draft campaigns can be updated');
    }

    const updateData: Record<string, unknown> = {
      updated_at: db.fn.now(),
    };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.channel !== undefined) updateData.channel = dto.channel;
    if (dto.subject !== undefined) updateData.subject = dto.subject;
    if (dto.content !== undefined) updateData.content = dto.content;
    if (dto.audienceFilter !== undefined) {
      updateData.audience_filter = dto.audienceFilter
        ? JSON.stringify(dto.audienceFilter)
        : null;
    }
    if (dto.scheduledAt !== undefined) updateData.scheduled_at = dto.scheduledAt;

    const [updated] = await db('campaigns')
      .where({ id, tenant_id: tenantId })
      .update(updateData)
      .returning('*');

    return mapCampaign(updated);
  }

  async schedule(tenantId: string, id: string, scheduledAt: string) {
    const db = getDb();

    const campaign = await db('campaigns')
      .where({ id, tenant_id: tenantId })
      .first();

    if (!campaign) {
      throw new AppError(404, 'Campaign not found');
    }

    if (campaign.status !== 'draft') {
      throw new AppError(400, 'Only draft campaigns can be scheduled');
    }

    const scheduledDate = new Date(scheduledAt);
    if (scheduledDate <= new Date()) {
      throw new AppError(400, 'Scheduled date must be in the future');
    }

    const [updated] = await db('campaigns')
      .where({ id, tenant_id: tenantId })
      .update({
        status: 'scheduled',
        scheduled_at: scheduledAt,
        updated_at: db.fn.now(),
      })
      .returning('*');

    return mapCampaign(updated);
  }

  async cancel(tenantId: string, id: string) {
    const db = getDb();

    const campaign = await db('campaigns')
      .where({ id, tenant_id: tenantId })
      .first();

    if (!campaign) {
      throw new AppError(404, 'Campaign not found');
    }

    if (!['draft', 'scheduled'].includes(campaign.status)) {
      throw new AppError(400, 'Only draft or scheduled campaigns can be cancelled');
    }

    const [updated] = await db('campaigns')
      .where({ id, tenant_id: tenantId })
      .update({
        status: 'cancelled',
        updated_at: db.fn.now(),
      })
      .returning('*');

    return mapCampaign(updated);
  }

  async getRecipients(
    tenantId: string,
    campaignId: string,
    page: number,
    pageSize: number,
  ) {
    const db = getDb();

    const campaign = await db('campaigns')
      .where({ id: campaignId, tenant_id: tenantId })
      .first();

    if (!campaign) {
      throw new AppError(404, 'Campaign not found');
    }

    const query = db('campaign_recipients')
      .where({ campaign_id: campaignId, tenant_id: tenantId });

    const countQuery = query.clone().count('* as total').first();
    const { total } = (await countQuery) as { total: string };
    const totalCount = parseInt(total, 10);

    const offset = (page - 1) * pageSize;
    const data = await query
      .leftJoin('customers', 'campaign_recipients.customer_id', 'customers.id')
      .select(
        'campaign_recipients.*',
        'customers.first_name as customer_first_name',
        'customers.last_name as customer_last_name',
        'customers.email as customer_email',
      )
      .orderBy('campaign_recipients.created_at', 'desc')
      .limit(pageSize)
      .offset(offset);

    return {
      data,
      total: totalCount,
      page,
      limit: pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  }
}
