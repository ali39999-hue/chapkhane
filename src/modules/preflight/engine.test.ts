import { describe, it, expect } from 'vitest';
import { runPreflight } from './engine';
import { PDFDocument } from 'pdf-lib';

describe('Preflight Engine', () => {
  it('should pass a correctly sized PDF', async () => {
    // Generate a dummy PDF with correct size
    // 94mm x 54mm (including 2mm bleed on each side for a 90x50 card)
    // 94mm = 266.45 points, 54mm = 153.07 points
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([266.45, 153.07]);
    const pdfBytes = await pdfDoc.save();
    const buffer = Buffer.from(pdfBytes);

    const result = await runPreflight(buffer, 'application/pdf', 90, 50, 2);
    console.log(result.issues);
    expect(result.status).toBe('pass');
    expect(result.metadata.widthMm).toBeCloseTo(94, 0);
    expect(result.metadata.heightMm).toBeCloseTo(54, 0);
  });

  it('should warn on incorrectly sized PDF', async () => {
    // 100mm x 100mm (283.46 points)
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([283.46, 283.46]);
    const pdfBytes = await pdfDoc.save();
    const buffer = Buffer.from(pdfBytes);

    const result = await runPreflight(buffer, 'application/pdf', 90, 50, 2);
    console.log(result.issues);
    expect(result.status).toBe('warning');
    expect(result.issues[0]).toMatch(/ابعاد فایل.*تطابق ندارد/);
  });

  it('should fail on unsupported mime type', async () => {
    const buffer = Buffer.from('fake data');
    const result = await runPreflight(buffer, 'text/plain', 90, 50, 2);
    
    expect(result.status).toBe('fail');
    expect(result.issues[0]).toMatch(/پشتیبانی نمی‌شود/);
  });
});
