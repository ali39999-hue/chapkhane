import { describe, it, expect } from 'vitest'
import { calculatePrice } from './engine'
import { PricingInput, PriceList, PricingContext } from './types'

describe('Pricing Engine', () => {
  const dummyPriceList: PriceList = {
    version: 'v1.0.0',
    status: 'active',
    validFrom: new Date().toISOString(),
    rows: [
      { productType: 'prod-offset', paperType: 'paper-matte', grammage: 300, sides: 2, basePrice: 500000 },
      { productType: 'prod-digital', paperType: 'paper-glossy', grammage: 135, sides: 1, basePrice: 20000 },
      { productType: 'prod-banner', paperType: 'paper-banner', grammage: 280, sides: 1, basePrice: 150000 }, // per sqm
    ]
  }

  const baseContext: PricingContext = {
    productConfig: {
      id: 'prod-offset',
      slug: 'business-card-offset',
      pricingModel: 'tier',
      standardProductionDays: 7,
      allowDoubleSided: true,
      itemsPerForm: 1000,
    },
    finishingConfigs: [],
    turnaroundConfig: { id: 'turn-normal', name: 'عادی', daysToAdd: 0, priceMultiplier: 1 }
  }

  const baseInput: PricingInput = {
    productTypeSlug: 'business-card-offset',
    size: {},
    paperTypeId: 'paper-matte',
    grammage: 300,
    sides: 2,
    quantity: 1000,
    finishing: [],
    turnaroundId: 'turn-normal',
    customerTier: { type: 'guest', discountPercent: 0 }
  }

  describe('Validation & Edge Cases', () => {
    it('1. should throw if double sided is not allowed', () => {
      const ctx = { ...baseContext, productConfig: { ...baseContext.productConfig, allowDoubleSided: false } }
      expect(() => calculatePrice(baseInput, dummyPriceList, ctx)).toThrow(/دورو ندارد/)
    })

    it('2. should throw if quantity is less than minimum', () => {
      const ctx = { ...baseContext, productConfig: { ...baseContext.productConfig, minQuantity: 500 } }
      const input = { ...baseInput, quantity: 499 }
      expect(() => calculatePrice(input, dummyPriceList, ctx)).toThrow(/حداقل تیراژ مجاز/)
    })

    it('3. should throw if base price row is not found', () => {
      const input = { ...baseInput, grammage: 999 }
      expect(() => calculatePrice(input, dummyPriceList, baseContext)).toThrow(/قیمت پایه برای این ترکیب/)
    })

    it('4. should throw if area calculation misses size', () => {
      const ctx = { ...baseContext, productConfig: { ...baseContext.productConfig, id: 'prod-banner', pricingModel: 'area' as const } }
      const input = { ...baseInput, paperTypeId: 'paper-banner', grammage: 280, sides: 1 as const }
      expect(() => calculatePrice(input, dummyPriceList, ctx)).toThrow(/ابعاد سفارشی/)
    })
    
    it('5. should throw if rfq model is used', () => {
      const ctx = { ...baseContext, productConfig: { ...baseContext.productConfig, pricingModel: 'rfq' as const } }
      expect(() => calculatePrice(baseInput, dummyPriceList, ctx)).toThrow(/دستی است/)
    })
  })

  describe('Offset / Tier Model', () => {
    it('6. should calculate correctly for exactly 1 form', () => {
      const result = calculatePrice(baseInput, dummyPriceList, baseContext)
      // 500,000 base -> +10% vat -> 550,000 -> round to 550,000
      expect(result.subtotal).toBe(500000)
      expect(result.vat).toBe(50000)
      expect(result.total).toBe(550000)
    })

    it('7. should round up forms for quantities not divisible by itemsPerForm', () => {
      const input = { ...baseInput, quantity: 1001 } // 2 forms
      const result = calculatePrice(input, dummyPriceList, baseContext)
      // 2 * 500k = 1M
      expect(result.subtotal).toBe(1000000)
    })
  })

  describe('Digital / PerSheet Model', () => {
    const digitalContext = {
      ...baseContext,
      productConfig: { id: 'prod-digital', slug: 'flyer-digital', pricingModel: 'perSheet' as const, standardProductionDays: 1, itemsPerSheet: 4 }
    }
    const digitalInput = { ...baseInput, productTypeSlug: 'flyer-digital', paperTypeId: 'paper-glossy', grammage: 135, sides: 1 as const, quantity: 5 }
    
    it('8. should calculate correctly per sheet', () => {
      // 5 items / 4 per sheet = 2 sheets. 2 * 20000 = 40000
      const result = calculatePrice(digitalInput, dummyPriceList, digitalContext)
      expect(result.subtotal).toBe(40000)
    })
  })

  describe('Large Format / Area Model', () => {
    const bannerContext = {
      ...baseContext,
      productConfig: { id: 'prod-banner', slug: 'banner-print', pricingModel: 'area' as const, standardProductionDays: 1, minArea: 2 }
    }
    const bannerInput = { ...baseInput, productTypeSlug: 'banner-print', paperTypeId: 'paper-banner', grammage: 280, sides: 1 as const, quantity: 1, size: { width: 1000, height: 1500 } }
    
    it('9. should apply minimum area limit', () => {
      // Area = 1 * 1.5 = 1.5 sqm. Minimum is 2 sqm. Base cost = 150k/sqm. Total base = 300k.
      const result = calculatePrice(bannerInput, dummyPriceList, bannerContext)
      expect(result.subtotal).toBe(300000)
      expect(result.warnings.length).toBeGreaterThan(0)
    })

    it('10. should calculate area properly if above minimum', () => {
      const input = { ...bannerInput, size: { width: 2000, height: 2000 } } // 4 sqm
      const result = calculatePrice(input, dummyPriceList, bannerContext)
      expect(result.subtotal).toBe(600000) // 4 * 150k
    })
  })

  describe('Finishing Options', () => {
    const finContext: PricingContext = {
      ...baseContext,
      finishingConfigs: [
        { id: 'fin-cellophane', name: 'سلفون مات', calculationType: 'perForm', minCost: 100000 },
        { id: 'fin-crease', name: 'خط تا', calculationType: 'perUnit', minCost: 50000 },
        { id: 'fin-eyelet', name: 'پانچ', calculationType: 'flat', minCost: 30000 },
      ]
    }
    
    const finPriceList: PriceList = {
      ...dummyPriceList,
      rows: [
        ...dummyPriceList.rows,
        { productType: 'prod-offset', paperType: '', finishingOption: 'fin-cellophane', grammage: 0, sides: 0, basePrice: 150000 },
        { productType: 'prod-offset', paperType: '', finishingOption: 'fin-crease', grammage: 0, sides: 0, basePrice: 200 },
      ]
    }

    it('11. should add perForm finishing cost', () => {
      const input = { ...baseInput, finishing: [{ id: 'fin-cellophane' }] } // 1 form -> 150k
      const result = calculatePrice(input, finPriceList, finContext)
      expect(result.subtotal).toBe(500000 + 150000)
    })

    it('12. should add perUnit finishing cost', () => {
      const input = { ...baseInput, finishing: [{ id: 'fin-crease' }] } // 1000 units * 200 = 200k (above minCost 50k)
      const result = calculatePrice(input, finPriceList, finContext)
      expect(result.subtotal).toBe(500000 + 200000)
    })

    it('13. should apply flat minCost if perUnit is too low', () => {
      const input = { ...baseInput, quantity: 100, finishing: [{ id: 'fin-crease' }] } // 100 * 200 = 20k. minCost is 50k -> 50k.
      const result = calculatePrice(input, finPriceList, finContext)
      expect(result.subtotal).toBe(500000 + 50000)
    })

    it('14. should apply flat cost if calculationType is flat', () => {
      const input = { ...baseInput, finishing: [{ id: 'fin-eyelet' }] }
      const result = calculatePrice(input, finPriceList, finContext)
      expect(result.subtotal).toBe(500000 + 30000)
    })

    it('15. should warn if finishing config is missing', () => {
      const input = { ...baseInput, finishing: [{ id: 'fin-unknown' }] }
      const result = calculatePrice(input, finPriceList, finContext)
      expect(result.subtotal).toBe(500000)
      expect(result.warnings.length).toBeGreaterThan(0)
    })
  })

  describe('Turnaround & Production Days', () => {
    const fastContext = {
      ...baseContext,
      turnaroundConfig: { id: 'turn-fast', name: 'فوری', daysToAdd: -2, priceMultiplier: 1.5 }
    }

    it('16. should calculate days properly', () => {
      const result = calculatePrice(baseInput, dummyPriceList, fastContext)
      expect(result.productionDays).toBe(5) // 7 + (-2)
    })

    it('17. should multiply price', () => {
      const result = calculatePrice(baseInput, dummyPriceList, fastContext)
      expect(result.subtotal).toBe(750000) // 500k * 1.5
    })
  })

  describe('Discounts & VAT', () => {
    it('18. should apply customer tier discount', () => {
      const input = { ...baseInput, customerTier: { type: 'b2b' as const, discountPercent: 10 } }
      const result = calculatePrice(input, dummyPriceList, baseContext)
      // subtotal: 500k -> 10% disc = 50k. taxable: 450k -> vat 45k -> total: 495k -> rounded to nearest 10k: 500k.
      expect(result.discount).toBe(50000)
      expect(result.vat).toBe(45000)
      expect(result.total).toBe(500000)
    })

    it('19. should apply percentage coupon', () => {
      const input = { ...baseInput, couponCode: { code: 'SALE', type: 'percent' as const, value: 20 } }
      const result = calculatePrice(input, dummyPriceList, baseContext)
      // subtotal 500k -> 20% disc = 100k
      expect(result.discount).toBe(100000)
      expect(result.vat).toBe(40000) // 10% of 400k
      expect(result.total).toBe(440000) 
    })

    it('20. should respect maxDiscount for percentage coupon', () => {
      const input = { ...baseInput, couponCode: { code: 'SALE', type: 'percent' as const, value: 50, maxDiscount: 100000 } }
      const result = calculatePrice(input, dummyPriceList, baseContext)
      expect(result.discount).toBe(100000)
    })

    it('21. should apply fixed coupon', () => {
      const input = { ...baseInput, couponCode: { code: 'GIFT', type: 'fixed' as const, value: 150000 } }
      const result = calculatePrice(input, dummyPriceList, baseContext)
      expect(result.discount).toBe(150000)
      expect(result.vat).toBe(35000)
    })

    it('22. should apply both tier and coupon correctly', () => {
      const input = { 
        ...baseInput, 
        customerTier: { type: 'b2b' as const, discountPercent: 10 },
        couponCode: { code: 'SALE', type: 'percent' as const, value: 10 }
      }
      const result = calculatePrice(input, dummyPriceList, baseContext)
      // Subtotal 500k -> Tier disc: 50k. Remaining 450k -> Coupon disc: 45k. Total disc: 95k.
      expect(result.discount).toBe(95000)
    })
  })

  describe('Rounding to 10000', () => {
    it('23. should round up nicely', () => {
      // Let's create a raw subtotal that results in non-rounded numbers
      const oddList = { ...dummyPriceList, rows: [{ ...dummyPriceList.rows[0], basePrice: 500001 }] }
      const result = calculatePrice(baseInput, oddList, baseContext)
      // subtotal 500001 -> vat 50000.1 = 50000 -> total 550001 -> round to 560000
      expect(result.total).toBe(560000)
    })
  })

  describe('Additional Edge Cases', () => {
    it('24. should not allow negative VAT taxable amount if discount is huge', () => {
      const input = { ...baseInput, couponCode: { code: 'BIG', type: 'fixed' as const, value: 1000000 } }
      const result = calculatePrice(input, dummyPriceList, baseContext)
      expect(result.subtotal).toBe(500000)
      expect(result.discount).toBe(1000000)
      expect(result.vat).toBe(0)
      expect(result.total).toBe(0) // Minimum total is 0
    })

    it('25. should process multiple finishing options correctly', () => {
      const finContext = {
        ...baseContext,
        finishingConfigs: [
          { id: 'fin1', name: 'f1', calculationType: 'flat' as const, minCost: 10000 },
          { id: 'fin2', name: 'f2', calculationType: 'flat' as const, minCost: 20000 },
        ]
      }
      const input = { ...baseInput, finishing: [{ id: 'fin1' }, { id: 'fin2' }] }
      const result = calculatePrice(input, dummyPriceList, finContext)
      expect(result.subtotal).toBe(530000)
    })
  })
})
