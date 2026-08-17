import { PDFDocument } from 'pdf-lib';

export async function checkPreflightNative(buffer: Buffer): Promise<{ status: 'approved' | 'rejected', errors: string[] }> {
  const errors: string[] = [];

  try {
    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pages = pdfDoc.getPages();

    // 1. Check Page Count
    if (pages.length === 0) {
      errors.push('فایل PDF خالی است.');
    }

    // 2. Check Dimensions (Example: A4 is 595 x 842 points)
    // 1 point = 1/72 inch.
    if (pages.length > 0) {
      const { width, height } = pages[0].getSize();
      // Very basic check - you can expand this based on the exact product
      if (width < 100 || height < 100) {
        errors.push(`ابعاد فایل بسیار کوچک است (کمتر از حداقل مجاز). Width: ${width.toFixed(1)}pt`);
      }
    }

    // 3. Hacky check for RGB Colorspace
    // We convert buffer to string and search for standard RGB markers
    const pdfString = buffer.toString('ascii');
    if (pdfString.includes('/DeviceRGB')) {
      errors.push('فایل دارای رنگ‌های RGB است. برای چاپ باید تمام رنگ‌ها CMYK باشند.');
    }

    if (errors.length > 0) {
      return { status: 'rejected', errors };
    }

    return { status: 'approved', errors: [] };
  } catch (error: any) {
    return { status: 'rejected', errors: ['فایل نامعتبر است یا با رمز عبور قفل شده است.'] };
  }
}
