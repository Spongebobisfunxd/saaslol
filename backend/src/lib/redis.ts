import Redis from 'ioredis';
import { config } from '../config';
import { logger } from './logger';

let redis: Redis;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(config.redis.url, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

    redis.on('connect', () => logger.info('Redis connected'));
    redis.on('error', (err) => logger.error('Redis error', { error: err.message }));
  }
  return redis;
}

export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    logger.info('Redis connection closed');
  }
}
