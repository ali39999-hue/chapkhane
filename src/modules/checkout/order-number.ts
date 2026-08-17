import { randomInt } from 'node:crypto'
import type { Payload } from 'payload'

/**
 * Generates a unique human-readable order number.
 *
 * `orderNumber` carries a UNIQUE constraint, and the previous generator
 * (`Date.now().slice(-6)` + `Math.random() * 1000`) collided often enough to
 * throw a 500 during checkout. This uses a CSPRNG for the suffix and verifies
 * against the database, retrying on collision.
 */
export async function nextOrderNumber(payload: Payload, attempts = 5): Promise<string> {
  const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '') // YYMMDD

  for (let i = 0; i < attempts; i++) {
    const candidate = `ORD-${datePart}-${randomInt(0, 1_000_000).toString().padStart(6, '0')}`

    const existing = await payload.find({
      collection: 'orders',
      where: { orderNumber: { equals: candidate } },
      limit: 1,
      depth: 0,
      pagination: false,
    })

    if (existing.docs.length === 0) return candidate
  }

  // Fall back to a value that is unique by construction (timestamp + CSPRNG).
  return `ORD-${datePart}-${Date.now().toString(36)}${randomInt(0, 4096).toString(36)}`
}

/**
 * Same idea for invoice serial numbers, which are also UNIQUE.
 */
export async function nextInvoiceSerial(payload: Payload, attempts = 5): Promise<string> {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD

  for (let i = 0; i < attempts; i++) {
    const candidate = `INV-${datePart}-${randomInt(0, 1_000_000).toString().padStart(6, '0')}`

    const existing = await payload.find({
      collection: 'invoices',
      where: { serialNumber: { equals: candidate } },
      limit: 1,
      depth: 0,
      pagination: false,
    })

    if (existing.docs.length === 0) return candidate
  }

  return `INV-${datePart}-${Date.now().toString(36)}${randomInt(0, 4096).toString(36)}`
}
