/**
 * Helpers for working with Payload relationship fields, which are either a raw
 * ID or a fully populated document depending on the query `depth`.
 */

export function relationId(value: unknown): number | undefined {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  if (value && typeof value === 'object' && 'id' in value) {
    return relationId((value as { id: unknown }).id)
  }
  return undefined
}

/**
 * Same as `relationId` but throws instead of returning `undefined`, for call
 * sites where a missing relationship is a programming error.
 */
export function requireRelationId(value: unknown, label = 'relationship'): number {
  const id = relationId(value)
  if (id === undefined) throw new Error(`Missing ${label} id`)
  return id
}
