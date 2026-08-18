import { createHmac, timingSafeEqual } from 'node:crypto'

export const SIGNATURE_HEADER = 'x-preflight-signature'
export const TIMESTAMP_HEADER = 'x-preflight-timestamp'

/** Reject callbacks older than this to blunt replay attacks. */
const MAX_SKEW_MS = 5 * 60 * 1000

/**
 * Returns the shared secret, refusing to fall back to a literal.
 *
 * The previous fallback (`'chapkhane-internal-secret'`) was committed in three
 * places, so any deployment that forgot the env var authenticated its internal
 * webhook with a value published in the repository.
 */
export function requireWebhookSecret(): string {
  const secret = process.env.PREFLIGHT_WEBHOOK_SECRET
  if (!secret || secret.length < 32) {
    throw new Error(
      'PREFLIGHT_WEBHOOK_SECRET must be set and at least 32 characters long.'
    )
  }
  return secret
}

/** HMAC-SHA256 over `timestamp.rawBody`, so the signature covers both. */
export function signWebhookPayload(rawBody: string, timestamp: string, secret: string): string {
  return createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex')
}

export type SignatureVerification =
  | { valid: true }
  | { valid: false; reason: 'missing' | 'stale' | 'mismatch' }

/**
 * Constant-time verification of a webhook signature.
 *
 * The signature must be computed over the *raw* body: re-serializing parsed
 * JSON changes key order and whitespace and would break verification.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
  timestamp: string | null,
  secret: string
): SignatureVerification {
  if (!signature || !timestamp) return { valid: false, reason: 'missing' }

  const sentAt = Number.parseInt(timestamp, 10)
  if (!Number.isFinite(sentAt) || Math.abs(Date.now() - sentAt) > MAX_SKEW_MS) {
    return { valid: false, reason: 'stale' }
  }

  const expected = signWebhookPayload(rawBody, timestamp, secret)
  const expectedBuf = Buffer.from(expected, 'hex')
  const providedBuf = Buffer.from(signature, 'hex')

  // `timingSafeEqual` throws on length mismatch, which is itself a mismatch.
  if (expectedBuf.length !== providedBuf.length) return { valid: false, reason: 'mismatch' }
  if (!timingSafeEqual(expectedBuf, providedBuf)) return { valid: false, reason: 'mismatch' }

  return { valid: true }
}
