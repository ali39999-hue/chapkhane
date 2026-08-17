import { Queue } from 'bullmq';
import Redis from 'ioredis';

let preflightQueueInstance: Queue | null = null;

export const getPreflightQueue = (): Queue => {
  if (!preflightQueueInstance) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const redisConnection = new Redis(redisUrl, { maxRetriesPerRequest: null, lazyConnect: true });
    preflightQueueInstance = new Queue('preflight-jobs', { connection: redisConnection });
  }
  return preflightQueueInstance;
};
