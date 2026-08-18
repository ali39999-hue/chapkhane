/**
 * @deprecated Import `getPreflightQueue` from `@/lib/queue` instead.
 *
 * Kept as a re-export so existing imports keep working while there is exactly
 * one queue client and one Redis configuration convention (`REDIS_URL`).
 */
export { getPreflightQueue } from '../../lib/queue';
