import { PDFDocument } from 'pdf-lib';
import imageSize from 'image-size';
import type { PreflightResult } from './result';

export type { PreflightResult, PreflightStatus, PreflightMetadata } from './result';

export async function runPreflight(
  buffer: Buffer, 
  mimeType: string, 
  expectedWidthMm: number, 
  expectedHeightMm: number, 
  expectedBleedMm: number
): Promise<PreflightResult> {
  const result: PreflightResult = { status: 'pass', issues: [], metadata: {} };
  const targetWidthMm = expectedWidthMm + (expectedBleedMm * 2);
  const targetHeightMm = expectedHeightMm + (expectedBleedMm * 2);
  const tolerance = 1.0; // 1mm tolerance

  try {
    if (mimeType === 'application/pdf') {
      const uint8Array = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      const pdf = await PDFDocument.load(uint8Array, { ignoreEncryption: true });
      const pages = pdf.getPages();
      result.metadata.pages = pages.length;

      if (pages.length === 0) {
        result.status = 'fail';
        result.issues.push('فایل PDF فاقد صفحه است.');
        return result;
      }

      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();
      // pdf-lib returns dimensions in points (1/72 inch). convert to mm:
      const widthMm = (width / 72) * 25.4;
      const heightMm = (height / 72) * 25.4;
      
      result.metadata.widthMm = parseFloat(widthMm.toFixed(2));
      result.metadata.heightMm = parseFloat(heightMm.toFixed(2));

      const isWidthMatch = Math.abs(widthMm - targetWidthMm) <= tolerance;
      const isHeightMatch = Math.abs(heightMm - targetHeightMm) <= tolerance;
      // Also check landscape vs portrait rotation
      const isRotatedMatch = Math.abs(heightMm - targetWidthMm) <= tolerance && Math.abs(widthMm - targetHeightMm) <= tolerance;

      if (!isWidthMatch && !isHeightMatch && !isRotatedMatch) {
        result.status = 'warning';
        result.issues.push(`ابعاد فایل (${result.metadata.widthMm}x${result.metadata.heightMm} میلی‌متر) با ابعاد استاندارد + بلید (${targetWidthMm}x${targetHeightMm} میلی‌متر) تطابق ندارد.`);
      }

      result.metadata.colorSpace = 'Unknown (CMYK recommended)';
    } else if (mimeType.startsWith('image/')) {
      const dimensions = imageSize(buffer);
      result.metadata.widthMm = dimensions.width; 
      result.metadata.heightMm = dimensions.height; 
      
      if ((dimensions.width || 0) < 1000 || (dimensions.height || 0) < 1000) {
        result.status = 'warning';
        result.issues.push('رزولوشن تصویر پایین است و ممکن است در چاپ بی‌کیفیت شود (حداقل ۱۰۰۰ پیکسل پیشنهاد می‌شود).');
      }
    } else {
      result.status = 'fail';
      result.issues.push(`فرمت ${mimeType} برای چاپ پشتیبانی نمی‌شود.`);
    }
  } catch (error: unknown) {
    result.status = 'fail';
    result.issues.push(`خطا در پردازش فایل: ${error instanceof Error ? error.message : String(error)}`);
  }

  return result;
}
