import { describe, it, expect } from 'vitest'
import {
  SIGNATURE_HEADER,
  TIMESTAMP_HEADER,
  signWebhookPayload,
  verifyWebhookSignature,
  requireWebhookSecret,
} from './webhook-signature'

const SECRET = 'a'.repeat(32)

describe('webhook signature', () => {
  it('accepts a correctly signed, fresh payload', () => {
    const body = JSON.stringify({ artworkId: 1, result: { status: 'pass' } })
    const timestamp = Date.now().toString()
    const signature = signWebhookPayload(body, timestamp, SECRET)

    expect(verifyWebhookSignature(body, signature, timestamp, SECRET)).toEqual({ valid: true })
  })

  it('rejects a missing signature or timestamp', () => {
    const body = '{}'
    const timestamp = Date.now().toString()

    expect(verifyWebhookSignature(body, null, timestamp, SECRET)).toEqual({
      valid: false,
      reason: 'missing',
    })
    expect(verifyWebhookSignature(body, signWebhookPayload(body, timestamp, SECRET), null, SECRET)).toEqual({
      valid: false,
      reason: 'missing',
    })
  })

  it('rejects a tampered body', () => {
    const body = JSON.stringify({ artworkId: 1, result: { status: 'fail' } })
    const timestamp = Date.now().toString()
    const signature = signWebhookPayload(body, timestamp, SECRET)

    // The attacker flips the verdict to `pass` but replays the old signature.
    const tampered = JSON.stringify({ artworkId: 1, result: { status: 'pass' } })

    expect(verifyWebhookSignature(tampered, signature, timestamp, SECRET)).toEqual({
      valid: false,
      reason: 'mismatch',
    })
  })

  it('rejects a signature made with a different secret', () => {
    const body = '{}'
    const timestamp = Date.now().toString()
    const signature = signWebhookPayload(body, timestamp, 'b'.repeat(32))

    expect(verifyWebhookSignature(body, signature, timestamp, SECRET)).toEqual({
      valid: false,
      reason: 'mismatch',
    })
  })

  it('rejects a stale timestamp (replay)', () => {
    const body = '{}'
    const timestamp = (Date.now() - 10 * 60 * 1000).toString()
    const signature = signWebhookPayload(body, timestamp, SECRET)

    expect(verifyWebhookSignature(body, signature, timestamp, SECRET)).toEqual({
      valid: false,
      reason: 'stale',
    })
  })

  it('rejects a non-numeric timestamp instead of throwing', () => {
    const body = '{}'
    expect(verifyWebhookSignature(body, 'ff', 'not-a-number', SECRET)).toEqual({
      valid: false,
      reason: 'stale',
    })
  })

  it('rejects a malformed hex signature instead of throwing', () => {
    const body = '{}'
    const timestamp = Date.now().toString()

    expect(verifyWebhookSignature(body, 'zzzz', timestamp, SECRET).valid).toBe(false)
    expect(verifyWebhookSignature(body, '', timestamp, SECRET).valid).toBe(false)
  })

  it('uses stable header names', () => {
    expect(SIGNATURE_HEADER).toBe('x-preflight-signature')
    expect(TIMESTAMP_HEADER).toBe('x-preflight-timestamp')
  })

  describe('requireWebhookSecret', () => {
    it('throws when the secret is missing or too short', () => {
      const original = process.env.PREFLIGHT_WEBHOOK_SECRET

      try {
        delete process.env.PREFLIGHT_WEBHOOK_SECRET
        expect(() => requireWebhookSecret()).toThrow(/at least 32/)

        process.env.PREFLIGHT_WEBHOOK_SECRET = 'too-short'
        expect(() => requireWebhookSecret()).toThrow(/at least 32/)

        process.env.PREFLIGHT_WEBHOOK_SECRET = SECRET
        expect(requireWebhookSecret()).toBe(SECRET)
      } finally {
        if (original === undefined) delete process.env.PREFLIGHT_WEBHOOK_SECRET
        else process.env.PREFLIGHT_WEBHOOK_SECRET = original
      }
    })
  })
})
