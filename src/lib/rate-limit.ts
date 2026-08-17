import Redis from 'ioredis'

type SlidingWindow = { count: number; resetTime: number }

const memoryStore = new Map<string, SlidingWindow>()

let redis: Redis | null = null
let redisFailed = false

function getRedis(): Redis | null {
  if (redisFailed) return null
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
      redisFailed = true
    })
    return redis
  } catch {
    redisFailed = true
    return null
  }
}

/**
 * Sliding-window rate limiter keyed by IP.
 * Uses Redis when available and falls back to an in-memory store otherwise,
 * so it keeps working on a single instance without a Redis dependency.
 */
export async function rateLimit(
  ip: string,
  { max = 20, windowMs = 60_000 }: { max?: number; windowMs?: number } = {}
): Promise<{ allowed: boolean }> {
  const client = getRedis()
  const now = Date.now()
  const windowStart = now - windowMs

  if (client) {
    try {
      const key = `rl:${ip}`
      const results = await client
        .multi()
        .zremrangebyscore(key, 0, windowStart)
        .zadd(key, String(now), String(now))
        .zcard(key)
        .expire(key, Math.ceil(windowMs / 1000))
        .exec()
      const count = results?.[2]?.[1] as number | undefined
      return { allowed: (count ?? 1) <= max }
    } catch {
      // fall through to the in-memory store
    }
  }

  let entry = memoryStore.get(ip)
  if (!entry || entry.resetTime < now) {
    entry = { count: 1, resetTime: now + windowMs }
    memoryStore.set(ip, entry)
  } else {
    entry.count++
  }

  // Bound memory growth by pruning expired entries
  if (memoryStore.size > 10_000) {
    for (const [key, val] of memoryStore) {
      if (val.resetTime < now) memoryStore.delete(key)
    }
  }

  return { allowed: entry.count <= max }
}