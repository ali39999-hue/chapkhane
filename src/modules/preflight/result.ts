/**
 * Shape of the `preflightResult` JSON column on `artworks`.
 *
 * Payload types a `json` field as `unknown`, so every consumer needs to narrow
 * it. This module is intentionally dependency-free (no pdf-lib) so server
 * components can import it without pulling the preflight engine into the graph.
 */
export type PreflightStatus = 'pass' | 'warning' | 'fail'

export interface PreflightMetadata {
  widthMm?: number
  heightMm?: number
  colorSpace?: string
  pages?: number
}

export interface PreflightResult {
  status: PreflightStatus
  issues: string[]
  metadata: PreflightMetadata
}

const STATUSES: readonly PreflightStatus[] = ['pass', 'warning', 'fail']

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Narrows an untyped `preflightResult` JSON value into a usable result object.
 * Returns `null` when preflight has not run yet or the value is malformed.
 */
export function parsePreflightResult(value: unknown): PreflightResult | null {
  if (!isRecord(value)) return null

  const status = value.status
  if (typeof status !== 'string' || !STATUSES.includes(status as PreflightStatus)) return null

  const issues = Array.isArray(value.issues)
    ? value.issues.filter((issue): issue is string => typeof issue === 'string')
    : []

  return {
    status: status as PreflightStatus,
    issues,
    metadata: isRecord(value.metadata) ? (value.metadata as PreflightMetadata) : {},
  }
}
