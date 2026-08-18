import Redis from 'ioredis'

type SlidingWindow = { count: number; resetTime: number }

const memoryStore = new Map<string, SlidingWindow>()

/** How long to stay on the in-memory fallback after a Redis error. */
const REDIS_COOLDOWN_MS = 30_000

let redis: Redis | null = null
let redisUnavailableUntil = 0

function getRedis(): Redis | null {
  // A transient Redis blip used to latch `redisFailed` for the lifetime of the
  // process, permanently downgrading the limiter to a per-instance memory map.
  // Retry after a cooldown instead.
  if (Date.now() < redisUnavailableUntil) return null
  if (redis) return redis
  try {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 1,
      connectTimeout: 1500,
      enableOfflineQueue: false,
      retryStrategy: () => null, // do not auto-reconnect forever
      lazyConnect: true,
    })
    redis.on('error', () => {
      redisUnavailableUntil = Date.now() + REDIS_COOLDOWN_MS
      redis?.disconnect()
      redis = null
    })
    return redis
  } catch {
    redisUnavailableUntil = Date.now() + REDIS_COOLDOWN_MS
    return null
  }
}

/**
 * Sliding-window rate limiter.
 *
 * `key` should identify the caller *and* the protected resource, e.g.
 * `checkout:<ip>` — sharing one bucket across endpoints lets a cheap endpoint
 * exhaust the budget of an expensive one. Derive the IP part with
 * `clientIp()` from `src/lib/request-ip.ts`; the raw `x-forwarded-for` header
 * is client-writable.
 *
 * Uses Redis when available and falls back to an in-memory store otherwise, so
 * it keeps working on a single instance without a Redis dependency. Note the
 * fallback is per-process: on serverless it does not limit across instances.
 */
export async function rateLimit(
  key: string,
  { max = 20, windowMs = 60_000 }: { max?: number; windowMs?: number } = {}
): Promise<{ allowed: boolean }> {
  const client = getRedis()
  const now = Date.now()
  const windowStart = now - windowMs

  if (client) {
    try {
      const redisKey = `rl:${key}`
      const results = await client
        .multi()
        .zremrangebyscore(redisKey, 0, windowStart)
        // Members must be unique or concurrent hits within the same
        // millisecond collapse into one; `zadd` on an existing member only
        // updates its score.
        .zadd(redisKey, String(now), `${now}-${Math.random().toString(36).slice(2, 10)}`)
        .zcard(redisKey)
        .expire(redisKey, Math.ceil(windowMs / 1000))
        .exec()
      const count = results?.[2]?.[1] as number | undefined
      return { allowed: (count ?? 1) <= max }
    } catch {
      redisUnavailableUntil = Date.now() + REDIS_COOLDOWN_MS
      // fall through to the in-memory store
    }
  }

  let entry = memoryStore.get(key)
  if (!entry || entry.resetTime < now) {
    entry = { count: 1, resetTime: now + windowMs }
    memoryStore.set(key, entry)
  } else {
    entry.count++
  }

  // Bound memory growth by pruning expired entries
  if (memoryStore.size > 10_000) {
    for (const [k, val] of memoryStore) {
      if (val.resetTime < now) memoryStore.delete(k)
    }
  }

  return { allowed: entry.count <= max }
}
