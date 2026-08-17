import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { headers } from 'next/headers';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getPayload({ config: configPromise });
    const { id } = await params;

    // Only staff can change order-item status
    const { user } = await payload.auth({ headers: await headers() });
    if (!user || !['admin', 'operator'].includes(user.role)) {
      return NextResponse.json({ error: 'عدم دسترسی به این عملیات.' }, { status: 403 });
    }

    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const updatedItem = await payload.update({
      collection: 'order-items',
      id,
      data: {
        itemStatus: status,
      }
    });

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error: any) {
    console.error('[Update Status API Error]:', error);
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}
