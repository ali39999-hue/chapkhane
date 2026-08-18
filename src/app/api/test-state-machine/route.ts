import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { devOnlyGuard } from '@/lib/guard';

export async function GET() {
  const blocked = devOnlyGuard();
  if (blocked) return blocked;

  const payload = await getPayload({ config: configPromise });

  try {
    const orders = await payload.find({ collection: 'orders', limit: 1, depth: 0, pagination: false });
    
    if (orders.docs.length === 0) {
      // Create a dummy order to test
      const userRes = await payload.find({ collection: 'users', limit: 1, depth: 0, pagination: false });
      const user = userRes.docs[0];
      if (!user) return NextResponse.json({ error: 'No user found' });

      const newOrder = await payload.create({
        collection: 'orders',
        depth: 0,
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
        depth: 0,
        data: {
          status: 'prepress' // Illegal jump from draft/paid/file_review to prepress
        }
      });
      return NextResponse.json({ result: "❌ FAILED: Allowed illegal transition to prepress!" });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      return NextResponse.json({ result: `✅ PASSED: Blocked illegal transition. Error: ${message}` });
    }

  } catch (err: unknown) {
    console.error('[Test State Machine Error]:', err);
    return NextResponse.json({ error: 'Test failed to run.' }, { status: 500 });
  }
}
