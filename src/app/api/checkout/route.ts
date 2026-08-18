import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CheckoutError, processCheckout } from '@/modules/checkout/service';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { headers } from 'next/headers';
import { rateLimit } from '@/lib/rate-limit';
import { clientIp } from '@/lib/request-ip';

/** Persian mobile / landline, loose enough for both formats. */
const phonePattern = /^0\d{9,10}$/;

/**
 * Shipping address fields.
 *
 * Every field is optional because the current configurator submits the order
 * before collecting an address (it is gathered later in the portal), but each
 * one is length- and format-bounded: this value is stored as JSON and rendered
 * onto the printed invoice, and it used to accept arbitrary unbounded data.
 * Unknown keys are stripped by zod.
 */
const ShippingAddressSchema = z.object({
  fullName: z.string().trim().min(2).max(120).optional(),
  phone: z.string().trim().regex(phonePattern, 'شماره تماس معتبر نیست.').optional(),
  province: z.string().trim().max(60).optional(),
  city: z.string().trim().max(60).optional(),
  postalCode: z.string().trim().regex(/^\d{10}$/, 'کد پستی باید ۱۰ رقم باشد.').optional(),
  address: z.string().trim().max(500).optional(),
  notes: z.string().trim().max(1000).optional(),
});

/**
 * The checkout envelope. Previously only `items.length > 0` was checked, so a
 * single request could create an unbounded number of `order-items` rows.
 * Per-item configs are validated inside the service.
 */
const CheckoutBodySchema = z.object({
  items: z
    .array(
      z.object({
        config: z.unknown(),
        artworkId: z.union([z.number(), z.string()]).nullish(),
      })
    )
    .min(1, 'سبد خرید خالی است.')
    .max(50, 'حداکثر ۵۰ آیتم در هر سفارش مجاز است.'),
  shippingAddress: ShippingAddressSchema.default({}),
  paymentMethod: z.enum(['gateway', 'wallet']).default('gateway'),
});

export async function POST(req: NextRequest) {
  try {
    const { allowed } = await rateLimit(`checkout:${clientIp(req)}`, { max: 10, windowMs: 60_000 });
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests (Rate Limited)' }, { status: 429 });
    }

    // `getPayload` and reading the body are independent of each other.
    const [payload, body] = await Promise.all([
      getPayload({ config: configPromise }),
      req.json().catch(() => null),
    ]);

    const { user } = await payload.auth({ headers: await headers() });

    if (!user) {
      return NextResponse.json({ error: 'ابتدا وارد حساب کاربری خود شوید.' }, { status: 401 });
    }

    const parsed = CheckoutBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'اطلاعات سفارش ناقص یا نامعتبر است.', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { items, shippingAddress, paymentMethod } = parsed.data;

    const order = await processCheckout(user.id, items, shippingAddress, paymentMethod, { payload });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      message: 'سفارش با موفقیت ثبت شد و در انتظار پرداخت است.'
    });

  } catch (error: unknown) {
    console.error('[Checkout API Error]:', error);
    // Domain errors (validation, credit limit, missing product) are safe and
    // useful to surface; anything else could leak DB/constraint internals.
    const message =
      error instanceof CheckoutError
        ? error.message
        : 'خطای سرور در ثبت سفارش. لطفاً دوباره تلاش کنید.';
    const status = error instanceof CheckoutError ? error.status : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
