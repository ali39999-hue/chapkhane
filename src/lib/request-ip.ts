import type { NextRequest } from 'next/server'

/**
 * Resolves the client IP for rate limiting.
 *
 * `x-forwarded-for` is a client-writable header: a caller can prepend arbitrary
 * entries and, with a naive `get('x-forwarded-for')`, reset their rate-limit
 * bucket on every request. The only value that cannot be forged is the one
 * appended by our own edge proxy, which is the *rightmost* entry — offset by
 * however many additional trusted proxies sit in front of the app.
 *
 * `TRUSTED_PROXY_HOPS` (default 1, matching a single Vercel/nginx layer) says
 * how many entries to skip from the right. Set it to the real number of
 * reverse proxies in the deployment; setting it too high is exploitable again.
 */
export function clientIp(req: NextRequest): string {
  const hops = Number.parseInt(process.env.TRUSTED_PROXY_HOPS ?? '1', 10)
  const trustedHops = Number.isFinite(hops) && hops > 0 ? hops : 1

  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    const chain = forwarded
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)

    if (chain.length > 0) {
      const index = Math.max(0, chain.length - trustedHops)
      const candidate = chain[index] ?? chain[chain.length - 1]
      if (candidate) return candidate
    }
  }

  // Vercel and most proxies also set this, and unlike x-forwarded-for it is
  // overwritten rather than appended to.
  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp.trim()

  return 'unknown'
}
