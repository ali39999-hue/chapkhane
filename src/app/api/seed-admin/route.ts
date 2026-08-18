import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { NextResponse } from 'next/server';
import { devOnlyGuard } from '@/lib/guard';

/**
 * Bootstraps the first admin account for a fresh local database.
 *
 * Credentials come from the environment. The previous version hardcoded
 * `admin@chapkhane.ir` / `admin123456`, reset the password of an existing
 * account, elevated it to `admin`, and echoed the password in the response —
 * a single unauthenticated GET was full admin takeover anywhere the dev guard
 * did not hold.
 */
export async function GET() {
  const blocked = devOnlyGuard();
  if (blocked) return blocked;

  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!email || !password || password.length < 12) {
    return NextResponse.json(
      {
        success: false,
        error:
          'Set ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD (min 12 chars) before calling this endpoint.',
      },
      { status: 400 }
    );
  }

  try {
    const payload = await getPayload({ config: configPromise });

    const existingUsers = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
      depth: 0,
      pagination: false,
      select: {},
    });

    if (existingUsers.docs.length > 0) {
      // Do not silently reset an existing account's password or elevate its
      // role — that is an account-takeover primitive, not a seed.
      return NextResponse.json({
        success: false,
        message: 'A user with this email already exists; not modifying it.',
      });
    }

    const newUser = await payload.create({
      collection: 'users',
      depth: 0,
      data: {
        email,
        password,
        role: 'admin',
        fullName: 'مدیر چاپخانه',
      },
    });

    // The password is never echoed back.
    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      id: newUser.id,
    });
  } catch (error: unknown) {
    console.error('[Seed Admin Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create admin user.' },
      { status: 500 }
    );
  }
}
