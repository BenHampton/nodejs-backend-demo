import { createClient } from 'redis';
import config from './env.js';
import logger from '../utils/logger.js';
import { Check } from '../controllers/health.controller.js';

const redis = createClient({ url: config.redisUrl });

redis.on('error', (e) => logger.error({ err: e }, 'redis'));

// Connecting is an explicit, awaiting step the composition root calls = no top-level await
export const connectRedis = () => redis.connect();

export const redisHealth: Check = async () => {
  try {
    await redis.ping();
    return {
      name: 'redis',
      ok: true,
    };
  } catch {
    return {
      name: 'redis',
      ok: false,
    };
  }
};

export default redis;
