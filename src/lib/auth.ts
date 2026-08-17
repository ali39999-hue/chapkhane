import { getPayload, type Payload, type TypedUser, type Where } from 'payload'
import configPromise from '@payload-config'
import { headers as nextHeaders } from 'next/headers'
import { cache } from 'react'
import { redirect } from 'next/navigation'

const STAFF_ROLES: readonly string[] = ['admin', 'operator']

export function isStaff(user: TypedUser | null | undefined): boolean {
  const role = user?.role
  return typeof role === 'string' && STAFF_ROLES.includes(role)
}

/**
 * Resolves the Payload instance and the current user for the incoming request.
 *
 * Wrapped in `React.cache` so a single server render (layout + page +
 * `generateMetadata`) performs exactly one `payload.auth` call instead of one
 * per component.
 */
export const getAuthContext = cache(
  async (): Promise<{ payload: Payload; user: TypedUser | null }> => {
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: await nextHeaders() })
    return { payload, user: user ?? null }
  }
)

/**
 * For portal pages: guarantees an authenticated user or redirects to /login.
 */
export async function requireUser(): Promise<{ payload: Payload; user: TypedUser }> {
  const { payload, user } = await getAuthContext()
  if (!user) redirect('/login')
  return { payload, user }
}

/**
 * For back-office pages: guarantees an admin/operator or redirects away.
 */
export async function requireStaff(): Promise<{ payload: Payload; user: TypedUser }> {
  const { payload, user } = await getAuthContext()
  if (!user) redirect('/admin/login')
  if (!isStaff(user)) redirect('/dashboard')
  return { payload, user }
}

/**
 * Builds a `where` clause that scopes a collection to the current user unless
 * they are staff, in which case everything is visible.
 *
 * Payload's Local API defaults to `overrideAccess: true`, so collection-level
 * access control does NOT apply to these calls. Every portal query must pass
 * this explicitly.
 */
export function scopeToUser(user: TypedUser, field = 'customer'): Where {
  if (isStaff(user)) return {}
  return { [field]: { equals: user.id } }
}
