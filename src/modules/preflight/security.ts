import crypto from 'crypto';
import { PDFDocument } from 'pdf-lib';

/**
 * Generates a SHA-256 hash for a given buffer.
 */
export function generateFileHash(buffer: Buffer): string {
  const hashSum = crypto.createHash('sha256');
  hashSum.update(buffer);
  return hashSum.digest('hex');
}

/**
 * Checks if a PDF file is encrypted/password-protected.
 * Throws an error if the file is encrypted.
 */
export async function checkPdfEncryption(buffer: Buffer, mimeType: string): Promise<boolean> {
  if (mimeType !== 'application/pdf') return false;

  try {
    const uint8Array = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    // By NOT passing ignoreEncryption: true, pdf-lib will throw if the PDF is encrypted
    await PDFDocument.load(uint8Array, { ignoreEncryption: false });
    return false;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('encrypted')) {
      return true;
    }
    // If it fails for another reason, we ignore it here (engine will catch it)
    return false;
  }
}

/**
 * Mock interface for malware/virus scanning.
 * Returns 'infected' if the filename contains 'eicar' (test string), otherwise 'clean'.
 */
export async function scanForMalware(buffer: Buffer, filename: string): Promise<'clean' | 'infected'> {
  // In production, this would stream the buffer to a clamav daemon (e.g. using NodeClam)
  return new Promise((resolve) => {
    setTimeout(() => {
      if (filename.toLowerCase().includes('eicar')) {
        resolve('infected');
      } else {
        resolve('clean');
      }
    }, 500); // Simulate network latency
  });
}
