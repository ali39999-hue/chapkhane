import { Queue } from 'bullmq';

let preflightQueueInstance: Queue | null = null;

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

/**
 * Lazily create the queue so importing this module never attempts a Redis
 * connection (e.g. during `next build` page-data collection). The connection
 * is only opened when the first job is enqueued.
 */
export function getPreflightQueue(): Queue {
  if (!preflightQueueInstance) {
    preflightQueueInstance = new Queue('preflight-jobs', { connection });
  }
  return preflightQueueInstance;
}