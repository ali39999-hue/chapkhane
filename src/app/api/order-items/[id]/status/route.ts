import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { headers } from 'next/headers';
import { z } from 'zod';
import { isStaff } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { clientIp } from '@/lib/request-ip';

/** Mirrors the `itemStatus` options on the OrderItems collection. */
const ITEM_STATUSES = [
  'pending',
  'prepress',
  'printing',
  'finishing',
  'quality_check',
  'ready',
  'done',
  'on_hold',
  'cancelled',
] as const;

const BodySchema = z.object({
  status: z.enum(ITEM_STATUSES),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { allowed } = await rateLimit(`item-status:${clientIp(req)}`, { max: 60, windowMs: 60_000 });
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests (Rate Limited)' }, { status: 429 });
    }

    // `params`, the payload instance and the body are mutually independent.
    const [{ id }, payload, body] = await Promise.all([
      params,
      getPayload({ config: configPromise }),
      req.json().catch(() => null),
    ]);

    // Only staff can change order-item status
    const { user } = await payload.auth({ headers: await headers() });
    if (!user || !isStaff(user)) {
      return NextResponse.json({ error: 'عدم دسترسی به این عملیات.' }, { status: 403 });
    }

    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'وضعیت درخواستی نامعتبر است.' }, { status: 400 });
    }

    const updatedItem = await payload.update({
      collection: 'order-items',
      id,
      depth: 0,
      data: {
        itemStatus: parsed.data.status,
      },
    });

    // Only the fields the caller needs, rather than the whole document.
    return NextResponse.json({
      success: true,
      item: { id: updatedItem.id, itemStatus: updatedItem.itemStatus },
    });
  } catch (error: unknown) {
    console.error('[Update Status API Error]:', error);
    return NextResponse.json({ error: 'خطای سرور در تغییر وضعیت.' }, { status: 500 });
  }
}
