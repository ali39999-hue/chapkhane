import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { z } from 'zod';
import { transitionOrderState } from '@/modules/workflow/state-machine';
import { headers } from 'next/headers';
import { relationId } from '@/lib/relations';
import { isStaff } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { clientIp } from '@/lib/request-ip';
import {
  PaymentGatewayUnavailableError,
  resolvePaymentGateway,
} from '@/modules/payment/gateway';

const VerifyBodySchema = z.object({
  orderId: z.union([z.number(), z.string()]),
  /**
   * Free-form provider callback parameters. Deliberately NOT typed as
   * `{ status }`: the outcome is decided by the gateway, not the caller. The
   * old handler read `status` straight from this body, which let a customer
   * mark their own order paid.
   */
  callback: z.record(z.string(), z.unknown()).default({}),
});

export async function POST(req: NextRequest) {
  try {
    const { allowed } = await rateLimit(`payment-verify:${clientIp(req)}`, {
      max: 20,
      windowMs: 60_000,
    });
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests (Rate Limited)' }, { status: 429 });
    }

    const [payload, body] = await Promise.all([
      getPayload({ config: configPromise }),
      req.json().catch(() => null),
    ]);

    const parsed = VerifyBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'شماره سفارش الزامی است.' }, { status: 400 });
    }
    const { orderId, callback } = parsed.data;

    // Only authenticated users can verify payments
    const { user } = await payload.auth({ headers: await headers() });
    if (!user) {
      return NextResponse.json({ error: 'ابتدا وارد حساب کاربری خود شوید.' }, { status: 401 });
    }

    const order = await payload
      .findByID({ collection: 'orders', id: orderId, depth: 0 })
      .catch(() => null);

    if (!order) {
      return NextResponse.json({ error: 'سفارش یافت نشد.' }, { status: 404 });
    }

    // Ownership check: staff or the order's customer
    const customerId = relationId(order.customer);
    if (!isStaff(user) && customerId !== user.id) {
      return NextResponse.json({ error: 'شما به این سفارش دسترسی ندارید.' }, { status: 403 });
    }

    if (customerId === undefined) {
      return NextResponse.json({ error: 'سفارش فاقد مشتری معتبر است.' }, { status: 422 });
    }

    if (order.status !== 'draft' && order.status !== 'awaiting_payment') {
      return NextResponse.json(
        { success: true, message: 'این سفارش قبلاً پردازش شده است.' }
      );
    }

    // The amount is always read from the order, never from the request.
    const amount = order.totals?.total ?? 0;

    const gateway = resolvePaymentGateway();
    const verdict = await gateway.verify({ orderId: order.id, amount, callback });

    // Idempotency is anchored on the provider's transaction reference, so a
    // replayed callback cannot produce a second payment row. The UNIQUE
    // constraint on `payments.idempotencyKey` is the real guard; this read
    // just turns a duplicate into a friendly response instead of a 500.
    const idempotencyKey = `${verdict.provider}:${verdict.refId}`;

    const existing = await payload.find({
      collection: 'payments',
      where: { idempotencyKey: { equals: idempotencyKey } },
      limit: 1,
      depth: 0,
      pagination: false,
      // `id` is always returned, so an empty projection is the leanest read.
      select: {},
    });

    if (existing.docs.length > 0) {
      return NextResponse.json({ success: true, message: 'این درخواست قبلاً پردازش شده است.' });
    }

    await payload.create({
      collection: 'payments',
      depth: 0,
      data: {
        order: order.id,
        customer: customerId,
        amount,
        provider: verdict.provider,
        refId: verdict.refId,
        status: verdict.status,
        idempotencyKey,
        rawPayload: verdict.raw ?? {},
      },
    });

    if (verdict.status !== 'success') {
      return NextResponse.json({ success: true, message: 'انصراف از پرداخت ثبت شد.' });
    }

    // paid -> file_review, validated as a single chain.
    await transitionOrderState(order.id, ['paid', 'file_review'], { payload });

    return NextResponse.json({ success: true, message: 'پرداخت با موفقیت تایید شد.' });
  } catch (error: unknown) {
    console.error('[Payment Verify Error]:', error);
    if (error instanceof PaymentGatewayUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    // Never echo the raw error: Payload/Postgres messages leak column and
    // constraint names.
    return NextResponse.json(
      { error: 'خطای سرور در تایید پرداخت. لطفاً دوباره تلاش کنید.' },
      { status: 500 }
    );
  }
}
