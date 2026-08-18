import { z } from 'zod'

export const FinishingInputSchema = z.object({
  id: z.coerce.string(),
  parameter: z.number().optional(), 
})

export const PricingInputSchema = z.object({
  productTypeSlug: z.string(),
  size: z.object({
    id: z.coerce.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
  }),
  paperTypeId: z.coerce.string(),
  grammage: z.number(),
  sides: z.union([z.literal(1), z.literal(2)]),
  quantity: z.number().min(1),
  finishing: z.array(FinishingInputSchema).default([]),
  turnaroundId: z.coerce.string(),
  customerTier: z.object({
    type: z.enum(['guest', 'customer', 'b2b']),
    discountPercent: z.number().default(0),
  }).default({ type: 'guest', discountPercent: 0 }),
  couponCode: z.object({
    code: z.string(),
    type: z.enum(['percent', 'fixed']),
    value: z.number(),
    maxDiscount: z.number().optional(),
  }).optional(),
})

export type PricingInput = z.infer<typeof PricingInputSchema>
export type FinishingInput = z.infer<typeof FinishingInputSchema>

/**
 * The shape a browser is allowed to send.
 *
 * `customerTier` and `couponCode` are money-bearing fields that the engine
 * trusts unconditionally, so they must never be parsed from a request body:
 * accepting `couponCode: { type: 'percent', value: 100 }` produced real
 * zero-Rial orders. The server resolves the tier from the authenticated user
 * and (once a coupon collection exists) the coupon from the database.
 */
export const ClientPricingInputSchema = PricingInputSchema.omit({
  customerTier: true,
  couponCode: true,
})

export type ClientPricingInput = z.infer<typeof ClientPricingInputSchema>

/**
 * Payload's Postgres adapter uses numeric IDs, but the pricing input arrives
 * from the client as strings. Accept both and compare via `sameId`.
 */
export type EntityId = string | number

export function sameId(a: EntityId | null | undefined, b: EntityId | null | undefined): boolean {
  if (a === null || a === undefined || b === null || b === undefined) return false
  return String(a) === String(b)
}

export interface PricingResult {
  breakdown: Array<{ label: string; amount: number }>
  subtotal: number
  discount: number
  vat: number
  total: number
  productionDays: number
  priceListVersion: string
  warnings: string[]
}

export interface PriceListRow {
  productType: EntityId // ID
  paperType: EntityId // ID
  finishingOption?: EntityId // ID (optional, only if this row overrides finishing price)
  grammage: number
  sides: number
  basePrice: number
}

export interface PriceList {
  version: string
  status: 'draft' | 'active' | 'archived'
  validFrom: string
  rows: PriceListRow[]
}

export interface ProductTypeConfig {
  id: EntityId
  slug: string
  pricingModel: 'tier' | 'area' | 'perSheet' | 'rfq'
  standardProductionDays: number
  minQuantity?: number
  allowDoubleSided?: boolean
  itemsPerForm?: number // for tier/offset
  itemsPerSheet?: number // for perSheet/digital
  minArea?: number // for area/largeFormat in sq meters
}

export interface FinishingOptionConfig {
  id: EntityId
  name: string
  calculationType: 'perForm' | 'perUnit' | 'perSquareMeter' | 'flat'
  minCost: number
}

export interface TurnaroundConfig {
  id: EntityId
  name: string
  daysToAdd: number
  priceMultiplier: number
}

export interface PricingContext {
  productConfig: ProductTypeConfig
  finishingConfigs: FinishingOptionConfig[]
  turnaroundConfig: TurnaroundConfig
}
