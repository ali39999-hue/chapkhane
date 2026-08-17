/**
 * Typed readers for the JSON columns used across orders and invoices.
 *
 * Payload types `json` fields as `unknown`, so every consumer would otherwise
 * need its own casts. Centralising the narrowing here keeps pages type-safe
 * without sprinkling `any` around.
 */

export interface ShippingAddress {
  fullName?: string
  phone?: string
  province?: string
  city?: string
  address?: string
  postalCode?: string
  nationalId?: string
  economicCode?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function str(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value : undefined
}

export function parseShippingAddress(value: unknown): ShippingAddress {
  if (!isRecord(value)) return {}
  return {
    fullName: str(value.fullName),
    phone: str(value.phone),
    province: str(value.province),
    city: str(value.city),
    address: str(value.address),
    postalCode: str(value.postalCode),
    nationalId: str(value.nationalId),
    economicCode: str(value.economicCode),
  }
}

/** Invoices store a snapshot of the buyer, with the same shape. */
export const parseBuyerInfo = parseShippingAddress

export interface OrderItemConfiguration {
  productTypeSlug?: string
  paperTypeId?: string
  grammage?: number
  sides?: number
  quantity?: number
  size?: { width?: number; height?: number }
}

export function parseItemConfiguration(value: unknown): OrderItemConfiguration {
  if (!isRecord(value)) return {}
  const size = isRecord(value.size) ? value.size : {}
  return {
    productTypeSlug: str(value.productTypeSlug),
    paperTypeId: str(value.paperTypeId),
    grammage: typeof value.grammage === 'number' ? value.grammage : undefined,
    sides: typeof value.sides === 'number' ? value.sides : undefined,
    quantity: typeof value.quantity === 'number' ? value.quantity : undefined,
    size: {
      width: typeof size.width === 'number' ? size.width : undefined,
      height: typeof size.height === 'number' ? size.height : undefined,
    },
  }
}
