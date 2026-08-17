import { NextRequest, NextResponse } from 'next/server';
import { processCheckout } from '@/modules/checkout/service';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { headers } from 'next/headers';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const { allowed } = await rateLimit(ip, { max: 10, windowMs: 60_000 });
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests (Rate Limited)' }, { status: 429 });
    }

    const payload = await getPayload({ config: configPromise });

    const { user } = await payload.auth({ headers: await headers() });

    if (!user) {
      return NextResponse.json({ error: 'ابتدا وارد حساب کاربری خود شوید.' }, { status: 401 });
    }

    const body = await req.json();
    const { items, shippingAddress, paymentMethod } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'سبد خرید خالی است.' }, { status: 400 });
    }

    // Call the checkout service
    const order = await processCheckout(user.id, items, shippingAddress, paymentMethod || 'gateway');

    return NextResponse.json({ 
      success: true, 
      orderId: order.id, 
      orderNumber: order.orderNumber,
      message: 'سفارش با موفقیت ثبت شد و در انتظار پرداخت است.'
    });

  } catch (error: unknown) {
    console.error('[Checkout API Error]:', error);
    const message = error instanceof Error ? error.message : 'خطای سرور در ثبت سفارش';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
