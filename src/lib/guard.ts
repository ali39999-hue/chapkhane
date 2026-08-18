import { NextResponse } from 'next/server';

/**
 * Fail-closed gate for development-only endpoints (seeding, fixtures, manual
 * test triggers).
 *
 * `NODE_ENV !== 'production'` alone is not a gate: preview builds, containers
 * that never set NODE_ENV, and `next start` behind a wrapper that clears the
 * environment all sail straight through it. These endpoints create users,
 * mutate orders and bulk-delete catalog rows, so they now require an explicit
 * opt-in that nobody sets by accident.
 *
 * Set `ENABLE_DEV_ENDPOINTS=true` locally. It is refused outright when
 * `NODE_ENV === 'production'`.
 */
export function devOnlyGuard(): NextResponse | null {
  const notFound = NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (process.env.NODE_ENV === 'production') return notFound;
  if (process.env.ENABLE_DEV_ENDPOINTS !== 'true') return notFound;

  return null;
}
