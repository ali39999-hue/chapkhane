import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { NextResponse } from 'next/server';
import { devOnlyGuard } from '@/lib/guard';

export async function GET() {
  const blocked = devOnlyGuard();
  if (blocked) return blocked;

  try {
    const payload = await getPayload({ config: configPromise });
    const email = 'admin@chapkhane.ir';
    const password = 'admin123456';

    const existingUsers = await payload.find({
      collection: 'users',
      where: {
        email: { equals: email },
      },
    });

    if (existingUsers.docs.length > 0) {
      const user = existingUsers.docs[0];
      await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          password,
          role: 'admin',
          fullName: 'مدیر چاپخانه',
        },
      });
      return NextResponse.json({
        success: true,
        message: 'Admin user updated successfully',
        email,
        password,
      });
    }

    const newUser = await payload.create({
      collection: 'users',
      data: {
        email,
        password,
        role: 'admin',
        fullName: 'مدیر چاپخانه',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      email,
      password,
      id: newUser.id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || String(error) },
      { status: 500 }
    );
  }
}
