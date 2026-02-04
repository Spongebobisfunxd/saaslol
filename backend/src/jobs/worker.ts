import { createWorker } from './queue';
import { processCampaign } from './processors/campaign.processor';
import { processPointsExpiry } from './processors/points-expiry.processor';
import { processTierRecalc } from './processors/tier-recalc.processor';
import { processWebhookDelivery } from './processors/webhook-delivery.processor';
import { processKioskSync } from './processors/kiosk-sync.processor';
import { processRodoExport } from './processors/rodo.processor';
import { processAnalyticsRollup } from './processors/analytics-rollup.processor';
import { logger } from '../lib/logger';

export function startWorkers() {
  createWorker('campaign', processCampaign, 3);
  createWorker('points-expiry', processPointsExpiry, 1);
  createWorker('tier-recalc', processTierRecalc, 2);
  createWorker('webhook-delivery', processWebhookDelivery, 10);
  createWorker('kiosk-sync', processKioskSync, 5);
  createWorker('rodo', processRodoExport, 1);
  createWorker('analytics-rollup', processAnalyticsRollup, 2);

  logger.info('All BullMQ workers started');
}
