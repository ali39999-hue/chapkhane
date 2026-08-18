import { describe, it, expect } from 'vitest'
import { sanitizeFilename, sniffMimeType } from './file-type'

const withHeader = (bytes: number[], length = 32): Buffer => {
  const buf = Buffer.alloc(length)
  bytes.forEach((b, i) => (buf[i] = b))
  return buf
}

describe('sniffMimeType', () => {
  it('detects PDF', () => {
    expect(sniffMimeType(withHeader([0x25, 0x50, 0x44, 0x46, 0x2d]))).toBe('application/pdf')
  })

  it('detects PNG', () => {
    expect(sniffMimeType(withHeader([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe(
      'image/png'
    )
  })

  it('detects JPEG', () => {
    expect(sniffMimeType(withHeader([0xff, 0xd8, 0xff, 0xe0]))).toBe('image/jpeg')
  })

  it('detects WEBP only with the RIFF....WEBP pair', () => {
    const webp = withHeader([0x52, 0x49, 0x46, 0x46])
    ;[0x57, 0x45, 0x42, 0x50].forEach((b, i) => (webp[8 + i] = b))
    expect(sniffMimeType(webp)).toBe('image/webp')

    // RIFF container that is not WEBP (e.g. WAV) must not pass.
    const wav = withHeader([0x52, 0x49, 0x46, 0x46])
    ;[0x57, 0x41, 0x56, 0x45].forEach((b, i) => (wav[8 + i] = b))
    expect(sniffMimeType(wav)).toBeNull()
  })

  it('detects ZIP', () => {
    expect(sniffMimeType(withHeader([0x50, 0x4b, 0x03, 0x04]))).toBe('application/zip')
  })

  it('rejects an executable masquerading as a PDF', () => {
    // A client can set Content-Type: application/pdf on anything; the bytes cannot lie.
    const exe = withHeader([0x4d, 0x5a, 0x90, 0x00])
    expect(sniffMimeType(exe)).toBeNull()
  })

  it('rejects buffers that are too short to identify', () => {
    expect(sniffMimeType(Buffer.from([0x25, 0x50]))).toBeNull()
  })
})

describe('sanitizeFilename', () => {
  it('strips directory components', () => {
    expect(sanitizeFilename('../../etc/passwd')).toBe('passwd')
    expect(sanitizeFilename('C:\\Users\\x\\art.pdf')).toBe('art.pdf')
  })

  it('removes shell-significant characters', () => {
    const cleaned = sanitizeFilename('a"; rm -rf /;.pdf')
    expect(cleaned).not.toContain('"')
    expect(cleaned).not.toContain(';')
    expect(cleaned).not.toContain(' ')
  })

  it('preserves Persian names and the extension', () => {
    expect(sanitizeFilename('کارت-ویزیت.pdf')).toBe('کارت-ویزیت.pdf')
  })

  it('falls back when nothing usable remains', () => {
    expect(sanitizeFilename('...')).toBe('upload')
    expect(sanitizeFilename('')).toBe('upload')
  })

  it('bounds the length', () => {
    expect(sanitizeFilename(`${'a'.repeat(300)}.pdf`).length).toBeLessThanOrEqual(120)
  })
})
