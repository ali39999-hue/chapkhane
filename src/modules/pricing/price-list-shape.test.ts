import { describe, it, expect } from 'vitest'
import { calculatePrice, PricingError } from './engine'
import type { PriceList, PricingContext, PricingInput } from './types'

/**
 * Regression tests for the price-list *shape* the seeder must produce.
 *
 * The seeded `V1-Seed` fixture was unusable by the engine for two independent
 * reasons, and both were invisible from the UI (the quote endpoint just
 * returned an error):
 *
 *  1. every row was written with `grammage: 300`, while the seeded papers allow
 *     60/80/100/135/300 — and `calculatePrice` matches the base row on grammage;
 *  2. `finishingOption` was set on the row that was supposed to be the *base*
 *     row, but a base row is identified by `!r.finishingOption`.
 *
 * These tests encode both rules so a future fixture change cannot silently
 * reintroduce an unpriceable catalog.
 */
describe('price list shape', () => {
  const context: PricingContext = {
    productConfig: {
      id: 42,
      slug: 'flyer-a4-glossy',
      pricingModel: 'tier',
      standardProductionDays: 3,
      minQuantity: 1000,
      allowDoubleSided: true,
      itemsPerForm: 1000,
    },
    finishingConfigs: [
      { id: 7, name: 'سلفون مات', calculationType: 'perForm', minCost: 0 },
    ],
    turnaroundConfig: { id: 1, name: 'عادی', daysToAdd: 0, priceMultiplier: 1 },
  }

  const input: PricingInput = {
    productTypeSlug: 'flyer-a4-glossy',
    size: { id: '1', width: 210, height: 297 },
    paperTypeId: '9',
    grammage: 135,
    sides: 1,
    quantity: 1000,
    finishing: [],
    turnaroundId: '1',
    customerTier: { type: 'guest', discountPercent: 0 },
  }

  const listWith = (rows: PriceList['rows']): PriceList => ({
    version: 'test',
    status: 'active',
    validFrom: new Date().toISOString(),
    rows,
  })

  it('prices a config when a base row matches the paper grammage', () => {
    const list = listWith([
      { productType: 42, paperType: 9, grammage: 135, sides: 1, basePrice: 1_000_000 },
    ])

    const result = calculatePrice(input, list, context)
    expect(result.subtotal).toBe(1_000_000)
    expect(result.total).toBeGreaterThan(0)
  })

  it('refuses when the only row has a different grammage (the V1-Seed bug)', () => {
    // Row is grammage 300; the paper the customer picked allows only 135.
    const list = listWith([
      { productType: 42, paperType: 9, grammage: 300, sides: 1, basePrice: 1_000_000 },
    ])

    expect(() => calculatePrice(input, list, context)).toThrow(PricingError)
    expect(() => calculatePrice(input, list, context)).toThrow(/قیمت پایه/)
  })

  it('refuses when the matching row carries a finishingOption (the second V1-Seed bug)', () => {
    // Correct grammage and sides, but it is a finishing row, not a base row.
    const list = listWith([
      { productType: 42, paperType: 9, finishingOption: 7, grammage: 135, sides: 1, basePrice: 1_000_000 },
    ])

    expect(() => calculatePrice(input, list, context)).toThrow(/قیمت پایه/)
  })

  it('needs a separate row per `sides` value', () => {
    const list = listWith([
      { productType: 42, paperType: 9, grammage: 135, sides: 1, basePrice: 1_000_000 },
    ])

    expect(calculatePrice(input, list, context).subtotal).toBe(1_000_000)
    expect(() => calculatePrice({ ...input, sides: 2 }, list, context)).toThrow(/قیمت پایه/)
  })

  it('applies a finishing surcharge from a row keyed on productType + finishingOption', () => {
    const list = listWith([
      { productType: 42, paperType: 9, grammage: 135, sides: 1, basePrice: 1_000_000 },
      { productType: 42, paperType: 9, finishingOption: 7, grammage: 0, sides: 1, basePrice: 250_000 },
    ])

    const withFinishing = calculatePrice(
      { ...input, finishing: [{ id: '7' }] },
      list,
      context
    )

    // 1 form at 1000/form: base 1,000,000 + finishing 250,000.
    expect(withFinishing.subtotal).toBe(1_250_000)
    expect(withFinishing.breakdown.map((b) => b.label)).toContain('خدمات: سلفون مات')
  })

  it('reports validation failures as PricingError, not a generic Error', () => {
    const list = listWith([
      { productType: 42, paperType: 9, grammage: 135, sides: 1, basePrice: 1_000_000 },
    ])

    // Below the product's minimum quantity.
    expect(() => calculatePrice({ ...input, quantity: 10 }, list, context)).toThrow(PricingError)

    // `rfq` products are priced manually.
    const rfqContext: PricingContext = {
      ...context,
      productConfig: { ...context.productConfig, pricingModel: 'rfq' },
    }
    expect(() => calculatePrice(input, list, rfqContext)).toThrow(PricingError)
  })
})
