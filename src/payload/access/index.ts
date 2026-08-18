import type { Access, FieldAccess } from 'payload'

/**
 * Single source of truth for role checks.
 *
 * Before this module existed the string literal `['admin', 'operator']` was
 * duplicated in ~20 collection files and every API route, which is exactly
 * where authorization drift starts. `src/lib/auth.ts#isStaff` is the
 * request-side twin of `isStaffRole`.
 */
export const STAFF_ROLES: readonly string[] = ['admin', 'operator']

export function isStaffRole(role: unknown): boolean {
  return typeof role === 'string' && STAFF_ROLES.includes(role)
}

/** Anyone, including anonymous visitors. Use only for public catalog/content. */
export const publicRead: Access = () => true

/** Any authenticated user. */
export const authenticated: Access = ({ req: { user } }) => !!user

/** Admin or operator. */
export const staffOnly: Access = ({ req: { user } }) => isStaffRole(user?.role)

/** Admin only — reserved for destructive operations. */
export const adminOnly: Access = ({ req: { user } }) => user?.role === 'admin'

/**
 * Field-level guard: only staff may write (or read) the field.
 *
 * Server-side writes through the Local API default to `overrideAccess: true`,
 * so trusted code paths (checkout, state machine, webhooks) are unaffected;
 * this only constrains requests that arrive through the REST/GraphQL API with
 * a customer session.
 */
export const staffOnlyField: FieldAccess = ({ req: { user } }) => isStaffRole(user?.role)

/**
 * Read-scoped-to-owner factory. Staff see everything, everyone else sees only
 * the documents whose `field` points at them.
 */
export function ownerScoped(field = 'customer'): Access {
  return ({ req: { user } }) => {
    if (!user) return false
    if (isStaffRole(user.role)) return true
    return { [field]: { equals: user.id } }
  }
}
