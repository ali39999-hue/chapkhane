import { describe, it, expect } from 'vitest';
import { generateFileHash, checkPdfEncryption, scanForMalware } from './security';
import { PDFDocument } from 'pdf-lib';

describe('Security Pipeline', () => {
  it('should generate a consistent SHA-256 hash', () => {
    const buffer1 = Buffer.from('hello world');
    const buffer2 = Buffer.from('hello world');
    const buffer3 = Buffer.from('hello world 2');

    const hash1 = generateFileHash(buffer1);
    const hash2 = generateFileHash(buffer2);
    const hash3 = generateFileHash(buffer3);

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hash3);
    // Known SHA-256 for 'hello world'
    expect(hash1).toBe('b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9');
  });

  it('should mock scan clean files correctly', async () => {
    const buffer = Buffer.from('fake image data');
    const result = await scanForMalware(buffer, 'my_poster.jpg');
    expect(result).toBe('clean');
  });

  it('should mock scan infected files correctly', async () => {
    const buffer = Buffer.from('fake virus data');
    const result = await scanForMalware(buffer, 'test_eicar_file.zip');
    expect(result).toBe('infected');
  });

  it('should pass unencrypted PDF', async () => {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([200, 200]);
    const pdfBytes = await pdfDoc.save();
    const buffer = Buffer.from(pdfBytes);

    const isEncrypted = await checkPdfEncryption(buffer, 'application/pdf');
    expect(isEncrypted).toBe(false);
  });
});
