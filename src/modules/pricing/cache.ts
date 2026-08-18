import type { Payload } from 'payload'

export interface PriceListRowDoc {
  productType: string | { id: string }
  paperType: string | { id: string }
  finishingOption?: string | { id: string }
  grammage?: number
  sides?: number
  basePrice: number
}

export interface PriceListDoc {
  version: string
  status: 'draft' | 'active' | 'archived'
  validFrom?: string
  rows?: PriceListRowDoc[]
}

let cached: { doc: PriceListDoc; expiresAt: number } | null = null
const DEFAULT_TTL_MS = 5 * 60 * 1000

/**
 * Returns the currently active price-list document, cached in-memory for a short TTL.
 * The PriceLists collection hook invalidates the cache whenever a list changes.
 */
export async function getCachedActivePriceList(
  payload: Payload,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<PriceListDoc | null> {
  const now = Date.now()
  if (cached && cached.expiresAt > now) return cached.doc

  const res = await payload.find({
    collection: 'price-lists',
    where: { status: { equals: 'active' } },
    limit: 1,
    // Every caller immediately reduces the row relationships back to bare IDs,
    // so populating them (default depth 2, three relationships per row) is
    // wasted work on the whole tariff table.
    depth: 0,
    pagination: false,
    select: { version: true, status: true, validFrom: true, rows: true },
  })

  cached = res.docs.length > 0 ? { doc: res.docs[0] as unknown as PriceListDoc, expiresAt: now + ttlMs } : null
  return cached?.doc ?? null
}

export function invalidatePriceListCache(): void {
  cached = null
}