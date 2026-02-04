import { Queue, Worker, Job } from 'bullmq';
import { getRedis } from '../lib/redis';
import { logger } from '../lib/logger';

const connection = { connection: getRedis() };

// Queue definitions
export const campaignQueue = new Queue('campaign', connection);
export const pointsExpiryQueue = new Queue('points-expiry', connection);
export const tierRecalcQueue = new Queue('tier-recalc', connection);
export const kioskSyncQueue = new Queue('kiosk-sync', connection);
export const webhookDeliveryQueue = new Queue('webhook-delivery', connection);
export const rodoQueue = new Queue('rodo', connection);
export const analyticsRollupQueue = new Queue('analytics-rollup', connection);

export function createWorker(
  queueName: string,
  processor: (job: Job) => Promise<void>,
  concurrency = 5
): Worker {
  const worker = new Worker(queueName, processor, {
    ...connection,
    concurrency,
  });

  worker.on('completed', (job) => {
    logger.debug(`Job ${job.id} in ${queueName} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Job ${job?.id} in ${queueName} failed`, { error: err.message });
  });

  return worker;
}
