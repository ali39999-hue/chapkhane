import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { getPreflightQueue } from '@/lib/queue';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'application/zip'];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'هیچ فایلی ارسال نشده است.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'حجم فایل بیشتر از حد مجاز (۱۰۰ مگابایت) است.' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'فرمت فایل پشتیبانی نمی‌شود. فقط PDF، تصویر و ZIP مجاز است.' }, { status: 400 });
    }

    const payload = await getPayload({ config: configPromise });

    const { headers } = await import('next/headers');
    const { user } = await payload.auth({ headers: await headers() });

    if (!user) {
      return NextResponse.json({ error: 'عدم دسترسی: برای ثبت سفارش و آپلود فایل ابتدا باید وارد حساب کاربری شوید.' }, { status: 401 });
    }

    const ownerId = user.id; 

    // Convert Web File to Buffer for Payload Local API
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create the Artwork Document in Payload
    const artwork = await payload.create({
      collection: 'artworks',
      data: {
        originalName: file.name,
        owner: ownerId,
        virusScanStatus: 'pending',
        preflightResult: null,
      },
      file: {
        data: buffer,
        mimetype: file.type,
        name: file.name,
        size: file.size,
      },
    });

    // Enqueue for preflight via BullMQ. If the queue is unavailable (e.g. no
    // Redis running locally), still return success so the upload isn't lost;
    // the artwork will be processed later or flagged manually.
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

    return NextResponse.json({ success: true, artworkId: artwork.id, preflightQueued: enqueued });
  } catch (error: any) {
    console.error('[Upload API Error]:', error);
    return NextResponse.json({ error: 'خطا در آپلود فایل: ' + error.message }, { status: 500 });
  }
}
