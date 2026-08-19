import { PricingInput, PricingResult, PriceList, PricingContext, sameId } from './types'

/**
 * A pricing failure caused by the requested configuration rather than by a bug.
 *
 * These messages are written for the customer and are safe to display. The
 * quote endpoint maps them to 422 instead of 500, so an unpriceable — but
 * otherwise valid — combination is not reported as a server fault.
 */
export class PricingError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PricingError'
  }
}

function roundTo10000(amount: number): number {
  return Math.ceil(amount / 10000) * 10000
}

export function calculatePrice(
  input: PricingInput,
  priceList: PriceList,
  context: PricingContext
): PricingResult {
  const result: PricingResult = {
    breakdown: [],
    subtotal: 0,
    discount: 0,
    vat: 0,
    total: 0,
    productionDays: context.productConfig.standardProductionDays + context.turnaroundConfig.daysToAdd,
    priceListVersion: priceList.version,
    warnings: [],
  }

  // 1. Validation and Setup
  if (!context.productConfig.allowDoubleSided && input.sides === 2) {
    throw new PricingError('محصول انتخاب شده قابلیت چاپ دورو ندارد.')
  }

  const minQ = context.productConfig.minQuantity || 1
  if (input.quantity < minQ) {
    throw new PricingError(`حداقل تیراژ مجاز ${minQ} عدد است.`)
  }

  // 1.5 Handle RFQ model early
  const model = context.productConfig.pricingModel
  if (model === 'rfq') {
    throw new PricingError('این محصول نیازمند استعلام قیمت دستی است.')
  }

  // 1. Find Base Price
  const baseRow = priceList.rows.find(
    r =>
      sameId(r.productType, context.productConfig.id) &&
      sameId(r.paperType, input.paperTypeId) &&
      (!r.grammage || r.grammage === input.grammage) &&
      (!r.sides || r.sides === input.sides) &&
      !r.finishingOption // Base row has no finishing option specified
  )

  if (!baseRow) {
    throw new PricingError('قیمت پایه برای این ترکیب کاغذ، گراماژ و وجه یافت نشد.')
  }

  let rawSubtotal = 0

  // 2. Base Calculation
  if (model === 'tier') {
    // Offset logic
    const itemsPerForm = context.productConfig.itemsPerForm || 1000
    const formCount = Math.ceil(input.quantity / itemsPerForm)
    
    // Base price per form * forms
    const baseCost = baseRow.basePrice * formCount
    rawSubtotal += baseCost
    result.breakdown.push({ label: 'چاپ پایه (افست)', amount: baseCost })
  } else if (model === 'perSheet') {
    // Digital logic
    const itemsPerSheet = context.productConfig.itemsPerSheet || 1
    const sheetCount = Math.ceil(input.quantity / itemsPerSheet)
    const baseCost = baseRow.basePrice * sheetCount
    rawSubtotal += baseCost
    result.breakdown.push({ label: 'چاپ پایه (دیجیتال)', amount: baseCost })
  } else if (model === 'area') {
    // Large format logic
    if (!input.size.width || !input.size.height) {
      throw new PricingError('برای چاپ عریض، ابعاد سفارشی (عرض و ارتفاع) الزامی است.')
    }
    const widthM = input.size.width / 1000
    const heightM = input.size.height / 1000
    let area = widthM * heightM * input.quantity
    
    const minArea = context.productConfig.minArea || 1
    if (area < minArea) {
      result.warnings.push(`متراژ زیر حداقل مجاز (${minArea} متر مربع) است، لذا حداقل محاسبه شد.`)
      area = minArea
    }
    
    const baseCost = baseRow.basePrice * area
    rawSubtotal += baseCost
    result.breakdown.push({ label: 'چاپ پایه (متراژ)', amount: Math.round(baseCost) })
  } else if (model === 'rfq') {
    throw new PricingError('این محصول نیازمند استعلام قیمت دستی است.')
  }

  // 3. Finishing Options
  for (const fin of input.finishing) {
    const finConfig = context.finishingConfigs.find(fc => sameId(fc.id, fin.id))
    if (!finConfig) {
      result.warnings.push(`تنظیمات عملیات تکمیلی ${fin.id} یافت نشد.`)
      continue
    }

    const finRow = priceList.rows.find(
      r =>
        sameId(r.productType, context.productConfig.id) &&
        sameId(r.finishingOption, fin.id)
    )
    
    const unitFinishingPrice = finRow ? finRow.basePrice : finConfig.minCost
    let finCost = 0

    if (finConfig.calculationType === 'perForm') {
      const itemsPerForm = context.productConfig.itemsPerForm || 1000
      const formCount = Math.ceil(input.quantity / itemsPerForm)
      finCost = unitFinishingPrice * formCount
    } else if (finConfig.calculationType === 'perUnit') {
      finCost = unitFinishingPrice * input.quantity
    } else if (finConfig.calculationType === 'perSquareMeter') {
      const widthM = (input.size.width || 1000) / 1000
      const heightM = (input.size.height || 1000) / 1000
      const area = widthM * heightM * input.quantity
      finCost = unitFinishingPrice * Math.max(area, 1) // default 1 sqm min
    } else if (finConfig.calculationType === 'flat') {
      finCost = unitFinishingPrice
    }

    if (finCost < finConfig.minCost) {
      finCost = finConfig.minCost
    }
    
    rawSubtotal += finCost
    result.breakdown.push({ label: `خدمات: ${finConfig.name}`, amount: Math.round(finCost) })
  }

  // 4. Turnaround Multiplier
  if (context.turnaroundConfig.priceMultiplier !== 1) {
    const originalSubtotal = rawSubtotal
    rawSubtotal *= context.turnaroundConfig.priceMultiplier
    result.breakdown.push({ label: `فوریت: ${context.turnaroundConfig.name}`, amount: Math.round(rawSubtotal - originalSubtotal) })
  }

  result.subtotal = Math.round(rawSubtotal)

  // 5. Discounts
  let totalDiscount = 0
  
  if (input.customerTier.discountPercent > 0) {
    totalDiscount += (result.subtotal * input.customerTier.discountPercent) / 100
  }

  if (input.couponCode) {
    let couponDiscount = 0
    if (input.couponCode.type === 'percent') {
      couponDiscount = ((result.subtotal - totalDiscount) * input.couponCode.value) / 100
      if (input.couponCode.maxDiscount && couponDiscount > input.couponCode.maxDiscount) {
        couponDiscount = input.couponCode.maxDiscount
      }
    } else {
      couponDiscount = input.couponCode.value
    }
    totalDiscount += couponDiscount
  }

  result.discount = Math.round(totalDiscount)
  
  const taxableAmount = Math.max(0, result.subtotal - result.discount)
  result.vat = Math.round(taxableAmount * 0.10) // 10% VAT
  
  const rawTotal = taxableAmount + result.vat
  
  // 6. Final Rounding (to nearest 10,000 up)
  result.total = roundTo10000(rawTotal)

  return result
}
