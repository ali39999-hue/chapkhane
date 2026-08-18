import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { calculatePrice, PricingError } from '@/modules/pricing/engine'
import {
  ClientPricingInputSchema,
  type PricingContext,
  type PriceList,
  type PricingInput,
} from '@/modules/pricing/types'
import { getCachedActivePriceList } from '@/modules/pricing/cache'
import { rateLimit } from '@/lib/rate-limit'
import { clientIp } from '@/lib/request-ip'
import { relationId } from '@/lib/relations'

export async function POST(req: NextRequest) {
  const { allowed } = await rateLimit(`quote:${clientIp(req)}`, { max: 30, windowMs: 60_000 })
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests (Rate Limited)' }, { status: 429 })
  }

  try {
    const body = await req.json()
    // Parsed with the client-facing schema, which strips `customerTier` and
    // `couponCode`. Both are resolved server-side below.
    const parseResult = ClientPricingInputSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json({ error: 'خطا در اعتبارسنجی ورودی‌ها', details: parseResult.error.format() }, { status: 400 })
    }

    const input: PricingInput = {
      ...parseResult.data,
      customerTier: { type: 'guest', discountPercent: 0 },
    }
    const payload = await getPayload({ config: configPromise })

    const finishingIds = input.finishing.map((f) => f.id)

    // The auth check, the price list and all catalog lookups are independent,
    // so they run as a single parallel batch instead of sequentially.
    const [{ user }, priceListDoc, productRes, turnaroundRes, finRes] = await Promise.all([
      payload.auth({ headers: req.headers }),
      getCachedActivePriceList(payload),
      payload.find({
        collection: 'product-types',
        where: { slug: { equals: input.productTypeSlug } },
        limit: 1,
        depth: 0,
        pagination: false,
      }),
      payload.find({
        collection: 'turnaround-options',
        where: { id: { equals: input.turnaroundId } },
        limit: 1,
        depth: 0,
        pagination: false,
      }),
      finishingIds.length > 0
        ? payload.find({
            collection: 'finishing-options',
            where: { id: { in: finishingIds } },
            limit: finishingIds.length,
            depth: 0,
            pagination: false,
          })
        : Promise.resolve(null),
    ])

    if (!priceListDoc) {
      return NextResponse.json({ error: 'هیچ لیست قیمت فعالی یافت نشد.' }, { status: 500 })
    }

    const productType = productRes.docs[0]
    if (!productType) {
      return NextResponse.json({ error: 'محصول درخواستی یافت نشد.' }, { status: 404 })
    }

    const turnaround = turnaroundRes.docs[0]
    if (!turnaround) {
      return NextResponse.json({ error: 'گزینه زمان تحویل یافت نشد.' }, { status: 404 })
    }

    // Server is the authority on the customer tier; the client body cannot
    // carry one (see ClientPricingInputSchema).
    const orgId = relationId(user?.organization)
    if (user?.role === 'b2b' && orgId !== undefined) {
      const org = await payload.findByID({
        collection: 'organizations',
        id: orgId,
        depth: 0,
      })
      if (org?.status === 'active' && (org.baseDiscount ?? 0) > 0) {
        input.customerTier = { type: 'b2b', discountPercent: org.baseDiscount! }
      }
    }

    const priceList: PriceList = {
      version: priceListDoc.version,
      status: priceListDoc.status,
      validFrom: priceListDoc.validFrom || '',
      rows: (priceListDoc.rows ?? []).map((r) => ({
        productType: relationId(r.productType) ?? '',
        paperType: relationId(r.paperType) ?? '',
        finishingOption: r.finishingOption ? relationId(r.finishingOption) : undefined,
        grammage: r.grammage ?? 0,
        sides: r.sides ?? 1,
        basePrice: r.basePrice,
      })),
    }

    const context: PricingContext = {
      productConfig: {
        id: productType.id,
        slug: productType.slug,
        pricingModel: productType.pricingModel,
        standardProductionDays: productType.standardProductionDays,
        minQuantity: productType.minQuantity ?? 1,
        allowDoubleSided: productType.allowDoubleSided ?? false,
        // Normally stored in DB, fallback here for demo safety
        itemsPerForm: 1000,
        itemsPerSheet: 1,
        minArea: 1,
      },
      turnaroundConfig: {
        id: turnaround.id,
        name: turnaround.name,
        daysToAdd: turnaround.daysToAdd,
        priceMultiplier: turnaround.priceMultiplier,
      },
      finishingConfigs: (finRes?.docs ?? []).map((f) => ({
        id: f.id,
        name: f.name,
        calculationType: f.calculationType,
        minCost: f.minCost ?? 0,
      })),
    }

    const result = calculatePrice(input, priceList, context)

    return NextResponse.json(result)
  } catch (error: unknown) {
    // A configuration the price list cannot price is a 422, not a 500: the
    // request was well-formed, the combination simply has no tariff row. This
    // previously surfaced in the browser console as a server error on every
    // product whose seeded grammage did not match its price row.
    if (error instanceof PricingError) {
      return NextResponse.json({ error: error.message, unpriceable: true }, { status: 422 })
    }
    console.error('[Pricing Quote Error]:', error)
    return NextResponse.json({ error: 'خطای سرور در محاسبه قیمت.' }, { status: 500 })
  }
}
