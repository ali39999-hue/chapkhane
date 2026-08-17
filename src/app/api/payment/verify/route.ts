import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { transitionOrderState } from '@/modules/workflow/state-machine';
import { headers } from 'next/headers';
import { relationId } from '@/lib/relations';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const { allowed } = await rateLimit(ip, { max: 20, windowMs: 60_000 });
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests (Rate Limited)' }, { status: 429 });
    }

    const { orderId, status, refId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'شماره سفارش الزامی است.' }, { status: 400 });
    }

    const payload = await getPayload({ config: configPromise });

    // Only authenticated users can verify payments
    const { user } = await payload.auth({ headers: await headers() });
    if (!user) {
      return NextResponse.json({ error: 'ابتدا وارد حساب کاربری خود شوید.' }, { status: 401 });
    }

    // Idempotency: prevent double processing of the same request. The unique
    // constraint on `payments.idempotencyKey` is the real guard; this read just
    // lets us return a friendly response instead of a 500.
    const idempotencyKey = `verify-${orderId}-${status}`;

    const [order, existing] = await Promise.all([
      payload.findByID({ collection: 'orders', id: orderId, depth: 0 }),
      payload.find({
        collection: 'payments',
        where: { idempotencyKey: { equals: idempotencyKey } },
        limit: 1,
        depth: 0,
        pagination: false,
      }),
    ]);

    // Ownership check: staff or the order's customer
    const isStaff = ['admin', 'operator'].includes(user.role);
    const customerId = relationId(order.customer);
    if (!isStaff && customerId !== user.id) {
      return NextResponse.json({ error: 'شما به این سفارش دسترسی ندارید.' }, { status: 403 });
    }

    if (existing.docs.length > 0) {
      return NextResponse.json({ success: true, message: 'این درخواست قبلاً پردازش شده است.' });
    }

    if (customerId === undefined) {
      return NextResponse.json({ error: 'سفارش فاقد مشتری معتبر است.' }, { status: 422 });
    }

    const amount = order.totals?.total ?? 0;

    if (status === 'success') {
      await payload.create({
        collection: 'payments',
        depth: 0,
        data: {
          order: order.id,
          customer: customerId,
          amount,
          provider: 'mock-zarinpal',
          refId: refId || `TRX-MOCK-${Date.now()}`,
          status: 'success',
          idempotencyKey,
          rawPayload: { gateway: 'MockZarinpal' },
        },
      });

      // paid -> file_review, validated as a single chain.
      await transitionOrderState(order.id, ['paid', 'file_review'], { payload });

      return NextResponse.json({ success: true, message: 'پرداخت با موفقیت تایید شد.' });
    }

    // Payment Failed/Cancelled
    await payload.create({
      collection: 'payments',
      depth: 0,
      data: {
        order: order.id,
        customer: customerId,
        amount,
        provider: 'mock-zarinpal',
        refId: refId || `TRX-MOCK-FAILED-${Date.now()}`,
        status: 'failed',
        idempotencyKey,
      },
    });
    return NextResponse.json({ success: true, message: 'انصراف از پرداخت ثبت شد.' });
  } catch (error: unknown) {
    console.error('[Payment Verify Error]:', error);
    const message = error instanceof Error ? error.message : 'خطای نامشخص';
    return NextResponse.json({ error: 'خطای سرور در تایید پرداخت: ' + message }, { status: 500 });
  }
}
