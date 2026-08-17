import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { getPreflightQueue } from '@/lib/queue';
import { Buffer } from 'buffer';
import { PDFDocument } from 'pdf-lib';
import { devOnlyGuard } from '@/lib/guard';

export async function GET(req: NextRequest) {
  const blocked = devOnlyGuard();
  if (blocked) return blocked;

  try {
    const payload = await getPayload({ config: configPromise });

    // 1. Get first user
    const users = await payload.find({ collection: 'users', limit: 1 });
    if (!users.docs.length) {
      return NextResponse.json({ error: 'No users found in DB to own the artwork' });
    }
    const admin = users.docs[0];

    // Create a real valid PDF using pdf-lib
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    page.drawText('Valid PDF Test', { x: 50, y: 700, size: 30 });
    const pdfBytes = await pdfDoc.save();
    const validPdfBuffer = Buffer.from(pdfBytes);

    const validArtwork = await payload.create({
      collection: 'artworks',
      data: {
        originalName: 'valid.pdf',
        owner: admin.id,
        virusScanStatus: 'pending',
      },
      file: {
        data: validPdfBuffer,
        mimetype: 'application/pdf',
        name: 'valid.pdf',
        size: validPdfBuffer.length,
      },
    });

    const preflightQueue = getPreflightQueue();
    await preflightQueue.add('process-artwork', {
      artworkId: validArtwork.id,
      filename: validArtwork.filename,
      expectedWidth: 85,
      expectedHeight: 55,
      expectedBleed: 2
    });

    // 3. Create a PDF with wrong dimensions (corrupt in print terms)
    const corruptDoc = await PDFDocument.create();
    const page2 = corruptDoc.addPage([100, 100]); // completely wrong size
    page2.drawText('Wrong Size PDF', { x: 10, y: 50, size: 10 });
    const corruptBytes = await corruptDoc.save();
    const corruptPdfBuffer = Buffer.from(corruptBytes);

    const corruptArtwork = await payload.create({
      collection: 'artworks',
      data: {
        originalName: 'wrong-size.pdf',
        owner: admin.id,
        virusScanStatus: 'pending',
      },
      file: {
        data: corruptPdfBuffer,
        mimetype: 'application/pdf',
        name: 'wrong-size.pdf',
        size: corruptPdfBuffer.length,
      },
    });

    await preflightQueue.add('process-artwork', {
      artworkId: corruptArtwork.id,
      filename: corruptArtwork.filename,
      expectedWidth: 85,
      expectedHeight: 55,
      expectedBleed: 2
    });

    return NextResponse.json({ 
      success: true, 
      validId: validArtwork.id, 
      corruptId: corruptArtwork.id 
    });
  } catch (err: any) {
    console.error('Test Trigger Error:', err);
    if (err.data && err.data.errors) {
       console.error('Validation errors:', JSON.stringify(err.data.errors, null, 2));
    }
    return NextResponse.json({ error: err.message, errors: err.data?.errors }, { status: 500 });
  }
}
