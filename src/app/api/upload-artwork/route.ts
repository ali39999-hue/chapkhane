import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { headers } from 'next/headers';
import { getPreflightQueue } from '@/lib/queue';
import { rateLimit } from '@/lib/rate-limit';
import { clientIp } from '@/lib/request-ip';
import { sanitizeFilename, sniffMimeType } from '@/lib/file-type';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/zip',
]);

export async function POST(req: NextRequest) {
  try {
    // Uploads are the most expensive unauthenticated-adjacent endpoint in the
    // app (100 MB buffered in memory), and it had no limiter at all.
    const { allowed } = await rateLimit(`upload:${clientIp(req)}`, { max: 20, windowMs: 60_000 });
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests (Rate Limited)' }, { status: 429 });
    }

    const payload = await getPayload({ config: configPromise });
    const { user } = await payload.auth({ headers: await headers() });

    // Authenticate *before* reading the body, so an anonymous caller cannot
    // make us buffer 100 MB.
    if (!user) {
      return NextResponse.json({ error: 'عدم دسترسی: برای ثبت سفارش و آپلود فایل ابتدا باید وارد حساب کاربری شوید.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'هیچ فایلی ارسال نشده است.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'حجم فایل بیشتر از حد مجاز (۱۰۰ مگابایت) است.' }, { status: 400 });
    }

    // Convert Web File to Buffer for Payload Local API
    const buffer = Buffer.from(await file.arrayBuffer());

    // The declared Content-Type is client-controlled, so the real type is
    // sniffed from the magic bytes and used everywhere downstream.
    const detectedType = sniffMimeType(buffer);
    if (!detectedType || !ALLOWED_MIME_TYPES.has(detectedType)) {
      return NextResponse.json(
        { error: 'فرمت فایل پشتیبانی نمی‌شود. فقط PDF، تصویر و ZIP مجاز است.' },
        { status: 400 }
      );
    }

    const safeName = sanitizeFilename(file.name);

    // Create the Artwork Document in Payload
    const artwork = await payload.create({
      collection: 'artworks',
      depth: 0,
      data: {
        originalName: file.name,
        owner: user.id,
        virusScanStatus: 'pending',
        preflightResult: null,
      },
      file: {
        data: buffer,
        mimetype: detectedType,
        name: safeName,
        size: file.size,
      },
    });

    // Enqueue for preflight via BullMQ. If the queue is unavailable (e.g. no
    // Redis running locally), the upload is still kept, but say so explicitly:
    // an artwork with `preflightResult: null` renders as "در حال بررسی..."
    // forever, so the caller needs to know it was never queued.
    let enqueued = false;
    try {
      const preflightQueue = getPreflightQueue();
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('queue timeout')), 2000)
      );
      await Promise.race([
        preflightQueue.add('process-artwork', {
          artworkId: artwork.id,
          filename: artwork.filename,
        }),
        timeout,
      ]);
      enqueued = true;
    } catch (queueError) {
      console.warn('[Upload API] Preflight queue unavailable, skipping enqueue:', queueError);
    }

    return NextResponse.json({
      success: true,
      artworkId: artwork.id,
      preflightQueued: enqueued,
      ...(enqueued
        ? {}
        : { warning: 'فایل ذخیره شد اما در صف بررسی کیفیت قرار نگرفت و نیازمند بازبینی دستی است.' }),
    });
  } catch (error: unknown) {
    console.error('[Upload API Error]:', error);
    return NextResponse.json({ error: 'خطا در آپلود فایل.' }, { status: 500 });
  }
}
