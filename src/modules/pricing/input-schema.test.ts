import { describe, it, expect } from 'vitest'
import { ClientPricingInputSchema, PricingInputSchema } from './types'

const validConfig = {
  productTypeSlug: 'bc-matte',
  size: { id: '1', width: 85, height: 55 },
  paperTypeId: '2',
  grammage: 300,
  sides: 1,
  quantity: 1000,
  finishing: [],
  turnaroundId: '3',
}

describe('ClientPricingInputSchema', () => {
  it('strips a client-supplied coupon', () => {
    const parsed = ClientPricingInputSchema.parse({
      ...validConfig,
      // The exploit: a 100% "coupon" produced real zero-Rial orders.
      couponCode: { code: 'FREE', type: 'percent', value: 100 },
    })

    expect('couponCode' in parsed).toBe(false)
  })

  it('strips a client-supplied customer tier', () => {
    const parsed = ClientPricingInputSchema.parse({
      ...validConfig,
      customerTier: { type: 'b2b', discountPercent: 90 },
    })

    expect('customerTier' in parsed).toBe(false)
  })

  it('still validates the rest of the configuration', () => {
    expect(ClientPricingInputSchema.safeParse({ ...validConfig, quantity: 0 }).success).toBe(false)
    expect(ClientPricingInputSchema.safeParse({ ...validConfig, sides: 3 }).success).toBe(false)
    expect(ClientPricingInputSchema.safeParse({ ...validConfig }).success).toBe(true)
  })

  it('leaves the internal schema able to carry a server-resolved tier', () => {
    const parsed = PricingInputSchema.parse({
      ...validConfig,
      customerTier: { type: 'b2b', discountPercent: 10 },
    })

    expect(parsed.customerTier).toEqual({ type: 'b2b', discountPercent: 10 })
  })
})
