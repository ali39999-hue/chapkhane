import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '../../../../payload.config'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { artworkId, secret, result } = body

    if (secret !== (process.env.PREFLIGHT_WEBHOOK_SECRET || 'chapkhane-internal-secret')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!artworkId || !result) {
      return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })

    await payload.update({
      collection: 'artworks',
      id: artworkId,
      data: {
        preflightResult: result
      }
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Webhook Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
