import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { z } from 'zod'
import {
  SIGNATURE_HEADER,
  TIMESTAMP_HEADER,
  requireWebhookSecret,
  verifyWebhookSignature,
} from '@/lib/webhook-signature'

/**
 * Result payload from the preflight worker.
 *
 * This writes directly into the gate that decides whether a file may enter
 * production, so it is validated rather than stored verbatim. The previous
 * version accepted any JSON and authenticated on a plaintext `secret` field
 * inside the body, with a hardcoded fallback — i.e. anyone could flip any
 * artwork to `pass`.
 */
const WebhookBodySchema = z.object({
  artworkId: z.union([z.number(), z.string()]),
  result: z.object({
    status: z.enum(['pass', 'warning', 'fail']),
    issues: z.array(z.string().max(500)).max(50).default([]),
    metadata: z
      .object({
        widthMm: z.number().optional(),
        heightMm: z.number().optional(),
        colorSpace: z.string().max(100).optional(),
        pages: z.number().int().nonnegative().optional(),
      })
      .default({}),
  }),
})

export async function POST(req: Request) {
  let secret: string
  try {
    secret = requireWebhookSecret()
  } catch (err) {
    console.error('[Preflight Webhook] Misconfigured:', err)
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
  }

  // Signature must be verified against the raw body: re-serializing parsed
  // JSON changes byte order and breaks the HMAC.
  const rawBody = await req.text()
  const verification = verifyWebhookSignature(
    rawBody,
    req.headers.get(SIGNATURE_HEADER),
    req.headers.get(TIMESTAMP_HEADER),
    secret
  )

  if (!verification.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const parsed = WebhookBodySchema.safeParse(JSON.parse(rawBody))
    if (!parsed.success) {
      return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
    }

    const { artworkId, result } = parsed.data
    const payload = await getPayload({ config: configPromise })

    await payload.update({
      collection: 'artworks',
      id: artworkId,
      depth: 0,
      data: {
        preflightResult: result,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('[Preflight Webhook] Error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
