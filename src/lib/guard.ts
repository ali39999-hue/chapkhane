import { NextResponse } from 'next/server';

/**
 * Blocks an endpoint in production. Dev/test-only endpoints should call this first.
 */
export function devOnlyGuard(): NextResponse | null {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return null;
}