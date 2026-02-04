import { Job } from 'bullmq';
import { getDb } from '../../db/connection';
import { logger } from '../../lib/logger';

export async function processCampaign(job: Job): Promise<void> {
  const { campaignId, tenantId } = job.data;
  const db = getDb();

  await db.raw(`SET app.current_tenant = '${tenantId}'`);

  const campaign = await db('campaigns').where({ id: campaignId, tenant_id: tenantId }).first();
  if (!campaign || campaign.status !== 'scheduled') {
    logger.warn(`Campaign ${campaignId} not found or not scheduled`);
    return;
  }

  await db('campaigns').where('id', campaignId).update({ status: 'sending' });

  try {
    // Build recipient list based on audience filter
    let query = db('customers').where({ tenant_id: tenantId, is_active: true });

    const filter = campaign.audience_filter || {};
    if (filter.tags?.length) {
      query = query.whereRaw(`tags @> ?::jsonb`, [JSON.stringify(filter.tags)]);
    }
    if (filter.tierId) {
      query = query.where('tier_id', filter.tierId);
    }
    if (filter.minPoints) {
      query = query.where('points_balance', '>=', filter.minPoints);
    }

    const customers = await query.select('id', 'email', 'phone');

    // Check consents for each customer
    const channel = campaign.channel;
    const eligibleCustomers = [];

    for (const customer of customers) {
      const consent = await db('consents')
        .where({ customer_id: customer.id, channel, granted: true })
        .first();
      if (consent) {
        eligibleCustomers.push(customer);
      }
    }

    // Create recipient entries
    const recipientRows = eligibleCustomers.map((c) => ({
      tenant_id: tenantId,
      campaign_id: campaignId,
      customer_id: c.id,
      status: 'pending',
    }));

    if (recipientRows.length > 0) {
      await db('campaign_recipients').insert(recipientRows);
    }

    // Batch send (stub - integrate with SES/SMSAPI)
    for (const recipient of recipientRows) {
      try {
        // TODO: Integrate with actual email/SMS provider
        if (channel === 'email') {
          logger.info(`[STUB] Sending email to customer ${recipient.customer_id}`);
        } else if (channel === 'sms') {
          logger.info(`[STUB] Sending SMS to customer ${recipient.customer_id}`);
        }

        await db('campaign_recipients')
          .where({ campaign_id: campaignId, customer_id: recipient.customer_id })
          .update({ status: 'sent', sent_at: new Date() });
      } catch (err: any) {
        await db('campaign_recipients')
          .where({ campaign_id: campaignId, customer_id: recipient.customer_id })
          .update({ status: 'failed', error_message: err.message });
      }
    }

    await db('campaigns').where('id', campaignId).update({
      status: 'sent',
      sent_at: new Date(),
      recipient_count: eligibleCustomers.length,
    });

    logger.info(`Campaign ${campaignId} sent to ${eligibleCustomers.length} recipients`);
  } catch (err: any) {
    logger.error(`Campaign ${campaignId} failed`, { error: err.message });
    await db('campaigns').where('id', campaignId).update({ status: 'draft' });
    throw err;
  }
}
