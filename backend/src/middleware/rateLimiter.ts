import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { getRedis } from '../lib/redis';

export function createRateLimiter(windowMs: number = 60_000, max: number = 100) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      sendCommand: (...args: string[]) => getRedis().call(...(args as [string, ...string[]])) as any,
    }),
    message: { success: false, message: 'Too many requests, please try again later' },
  });
}

export const defaultLimiter = createRateLimiter(60_000, 100);
export const authLimiter = createRateLimiter(15 * 60_000, 20);
export const strictLimiter = createRateLimiter(60_000, 10);
