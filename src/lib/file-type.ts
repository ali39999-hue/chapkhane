/**
 * Magic-byte sniffing for the formats we accept.
 *
 * A multipart part's `Content-Type` is supplied by the client, so it decides
 * nothing on its own: the upload route used to trust `file.type` both for the
 * allowlist check and for the value stored on the artwork, which in turn drives
 * which branch of the preflight engine runs.
 */
export type SniffedType = 'application/pdf' | 'image/png' | 'image/jpeg' | 'image/webp' | 'application/zip'

const startsWith = (buf: Buffer, bytes: number[], offset = 0): boolean =>
  bytes.every((byte, i) => buf[offset + i] === byte)

/**
 * Returns the real MIME type of `buffer`, or `null` when it is not a format we
 * support. Only the first few hundred bytes are inspected.
 */
export function sniffMimeType(buffer: Buffer): SniffedType | null {
  if (buffer.length < 12) return null

  // %PDF
  if (startsWith(buffer, [0x25, 0x50, 0x44, 0x46])) return 'application/pdf'

  // \x89PNG\r\n\x1a\n
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png'

  // JPEG SOI
  if (startsWith(buffer, [0xff, 0xd8, 0xff])) return 'image/jpeg'

  // RIFF....WEBP
  if (startsWith(buffer, [0x52, 0x49, 0x46, 0x46]) && startsWith(buffer, [0x57, 0x45, 0x42, 0x50], 8)) {
    return 'image/webp'
  }

  // PK\x03\x04 / PK\x05\x06 (empty) / PK\x07\x08 (spanned)
  if (
    startsWith(buffer, [0x50, 0x4b, 0x03, 0x04]) ||
    startsWith(buffer, [0x50, 0x4b, 0x05, 0x06]) ||
    startsWith(buffer, [0x50, 0x4b, 0x07, 0x08])
  ) {
    return 'application/zip'
  }

  return null
}

/**
 * Strips directory components and characters that have meaning to shells,
 * Windows paths, or S3 keys. Preserves the extension so downstream tooling can
 * still branch on it.
 */
export function sanitizeFilename(name: string, fallback = 'upload'): string {
  const base = name.split(/[/\\]/).pop() ?? fallback
  const cleaned = base
    .replace(/[^\p{L}\p{N}._-]+/gu, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^[._]+/, '')
    .slice(0, 120)

  return cleaned.length > 0 ? cleaned : fallback
}
