import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { devOnlyGuard } from '@/lib/guard';

export async function GET() {
  const blocked = devOnlyGuard();
  if (blocked) return blocked;

  const payload = await getPayload({ config: configPromise });

  try {
    const orders = await payload.find({ collection: 'orders', limit: 1 });
    
    if (orders.totalDocs === 0) {
      // Create a dummy order to test
      const userRes = await payload.find({ collection: 'users', limit: 1 });
      const user = userRes.docs[0];
      if (!user) return NextResponse.json({ error: 'No user found' });

      const newOrder = await payload.create({
        collection: 'orders',
        data: {
          orderNumber: 'TEST-123',
          customer: user.id,
          status: 'paid',
          totals: { subtotal: 0, discount: 0, vat: 0, shipping: 0, total: 0 }
        }
      });
      orders.docs = [newOrder];
    }

    const order = orders.docs[0];
    
    try {
      await payload.update({
        collection: 'orders',
        id: order.id,
        data: {
          status: 'prepress' // Illegal jump from draft/paid/file_review to prepress
        }
      });
      return NextResponse.json({ result: "❌ FAILED: Allowed illegal transition to prepress!" });
    } catch (e: any) {
      return NextResponse.json({ result: `✅ PASSED: Blocked illegal transition. Error: ${e.message}` });
    }

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
