import { describe, it, expect } from 'vitest'
import type { NextRequest } from 'next/server'
import { clientIp } from './request-ip'

/** Minimal NextRequest stand-in: `clientIp` only reads headers. */
function req(headers: Record<string, string>): NextRequest {
  return { headers: new Headers(headers) } as unknown as NextRequest
}

describe('clientIp', () => {
  it('returns the proxy-appended (rightmost) entry, not the client-supplied one', () => {
    // An attacker prepends a spoofed address to reset their rate-limit bucket.
    const ip = clientIp(req({ 'x-forwarded-for': '1.1.1.1, 203.0.113.7' }))
    expect(ip).toBe('203.0.113.7')
  })

  it('handles a single-entry chain', () => {
    expect(clientIp(req({ 'x-forwarded-for': '203.0.113.7' }))).toBe('203.0.113.7')
  })

  it('trims whitespace and ignores empty entries', () => {
    expect(clientIp(req({ 'x-forwarded-for': ' , 203.0.113.7 ' }))).toBe('203.0.113.7')
  })

  it('respects TRUSTED_PROXY_HOPS', () => {
    const original = process.env.TRUSTED_PROXY_HOPS
    try {
      process.env.TRUSTED_PROXY_HOPS = '2'
      // Two trusted proxies: skip the last one, take the next.
      expect(clientIp(req({ 'x-forwarded-for': '1.1.1.1, 203.0.113.7, 10.0.0.1' }))).toBe(
        '203.0.113.7'
      )
    } finally {
      if (original === undefined) delete process.env.TRUSTED_PROXY_HOPS
      else process.env.TRUSTED_PROXY_HOPS = original
    }
  })

  it('falls back to x-real-ip, then to "unknown"', () => {
    expect(clientIp(req({ 'x-real-ip': '203.0.113.9' }))).toBe('203.0.113.9')
    expect(clientIp(req({}))).toBe('unknown')
  })
})
