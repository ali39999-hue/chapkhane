import { Queue } from 'bullmq';
import Redis from 'ioredis';

let preflightQueueInstance: Queue | null = null;

/**
 * Single queue client for the whole app.
 *
 * There used to be two: this one connected via `REDIS_HOST`/`REDIS_PORT` while
 * `src/modules/preflight/queue.ts` used `REDIS_URL`. The API routes imported
 * this one, so setting only `REDIS_URL` (the documented variable, and the one
 * the worker and the rate limiter use) silently failed to configure enqueueing.
 *
 * Lazily created so importing this module never opens a connection — importing
 * it during `next build` page-data collection must not require Redis.
 */
export function getPreflightQueue(): Queue {
  if (!preflightQueueInstance) {
    const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: null,
      lazyConnect: true,
    });
    preflightQueueInstance = new Queue('preflight-jobs', { connection });
  }
  return preflightQueueInstance;
}
