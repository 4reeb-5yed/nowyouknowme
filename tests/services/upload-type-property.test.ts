import { describe, it, vi } from 'vitest';
import fc from 'fast-check';

// Mock @/config/env before importing the service
vi.mock('@/config/env', () => ({
  serverEnv: {
    R2_ACCOUNT_ID: 'test-account-id',
    R2_ACCESS_KEY_ID: 'test-access-key',
    R2_SECRET_ACCESS_KEY: 'test-secret-key',
    R2_BUCKET_NAME: 'test-bucket',
    R2_PUBLIC_URL: 'https://cdn.test.example.com',
  },
  clientEnv: {
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  },
  env: {
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  },
}));

import { validateFile } from '@/server/services/upload.service';

/**
 * Property 8: File Upload Type Safety
 *
 * FOR ALL file upload requests, THE Validation_Layer SHALL reject files whose detected
 * MIME type does not match the allowed set (application/pdf for resumes,
 * image/jpeg|image/png|image/webp for images), regardless of file extension.
 *
 * Validates: Requirements 12.5, 14.4
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

// ---------------------------------------------------------------------------
// Magic byte helpers for known types
// ---------------------------------------------------------------------------

/** PDF magic bytes: %PDF */
const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46];

/** JPEG magic bytes: FF D8 FF */
const JPEG_MAGIC = [0xff, 0xd8, 0xff];

/** PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A */
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/** WebP magic bytes: RIFF....WEBP (bytes at 0-3 and 8-11) */
const WEBP_RIFF = [0x52, 0x49, 0x46, 0x46]; // "RIFF"
const WEBP_MARKER = [0x57, 0x45, 0x42, 0x50]; // "WEBP"

/** GIF magic bytes (NOT in allowed set): GIF8 */
const GIF_MAGIC = [0x47, 0x49, 0x46, 0x38];

// ---------------------------------------------------------------------------
// Arbitraries (generators)
// ---------------------------------------------------------------------------

/**
 * Generate a buffer with valid magic bytes for one of the allowed MIME types.
 * The buffer is at least 12 bytes (minimum for detectMimeType) and within size limit.
 */
const allowedMagicBufferArb = fc.oneof(
  // PDF buffer
  fc.integer({ min: 12, max: 4096 }).map((size) => {
    const buf = Buffer.alloc(size);
    PDF_MAGIC.forEach((b, i) => { buf[i] = b; });
    return buf;
  }),
  // JPEG buffer
  fc.integer({ min: 12, max: 4096 }).map((size) => {
    const buf = Buffer.alloc(size);
    JPEG_MAGIC.forEach((b, i) => { buf[i] = b; });
    return buf;
  }),
  // PNG buffer
  fc.integer({ min: 12, max: 4096 }).map((size) => {
    const buf = Buffer.alloc(size);
    PNG_MAGIC.forEach((b, i) => { buf[i] = b; });
    return buf;
  }),
  // WebP buffer (RIFF at 0, WEBP at 8)
  fc.integer({ min: 12, max: 4096 }).map((size) => {
    const buf = Buffer.alloc(size);
    WEBP_RIFF.forEach((b, i) => { buf[i] = b; });
    WEBP_MARKER.forEach((b, i) => { buf[8 + i] = b; });
    return buf;
  }),
);

/**
 * Generate a buffer with valid magic bytes for a NON-allowed MIME type (GIF).
 * These should always be rejected even though they're a valid detected type.
 */
const nonAllowedMagicBufferArb = fc.integer({ min: 12, max: 4096 }).map((size) => {
  const buf = Buffer.alloc(size);
  GIF_MAGIC.forEach((b, i) => { buf[i] = b; });
  return buf;
});

/**
 * Generate a random buffer that does NOT match any known magic byte signature.
 * We ensure the first bytes don't accidentally match known signatures by
 * avoiding the specific byte patterns used for detection.
 */
const unrecognizedBufferArb = fc
  .tuple(
    fc.integer({ min: 12, max: 4096 }),
    fc.uint8Array({ minLength: 12, maxLength: 12 })
  )
  .filter(([, header]) => {
    // Reject if header accidentally matches any known signature
    // PDF: starts with 0x25, 0x50, 0x44, 0x46
    if (header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46) return false;
    // JPEG: starts with 0xFF, 0xD8, 0xFF
    if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) return false;
    // PNG: starts with 0x89, 0x50, 0x4E, 0x47
    if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47) return false;
    // WebP: RIFF at 0 + WEBP at 8
    if (header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46 &&
        header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50) return false;
    // GIF: starts with 0x47, 0x49, 0x46, 0x38
    if (header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x38) return false;
    // SVG: starts with '<svg' (0x3C, 0x73, 0x76, 0x67) or '<?xm'
    if (header[0] === 0x3c && header[1] === 0x73 && header[2] === 0x76 && header[3] === 0x67) return false;
    if (header[0] === 0x3c && header[1] === 0x3f && header[2] === 0x78 && header[3] === 0x6d) return false;
    // AVIF: check for 'ftyp' at offset 4
    const ftypCheck = String.fromCharCode(
      header[4] ?? 0,
      header[5] ?? 0,
      header[6] ?? 0,
      header[7] ?? 0
    );
    if (ftypCheck === 'ftyp') return false;
    return true;
  })
  .map(([size, header]) => {
    const buf = Buffer.alloc(size);
    Buffer.from(header).copy(buf, 0);
    return buf;
  });

// ---------------------------------------------------------------------------
// Property Tests
// ---------------------------------------------------------------------------

describe('Property 8: File Upload Type Safety', () => {
  /**
   * **Validates: Requirements 12.5, 14.4**
   *
   * Buffers with magic bytes matching allowed MIME types should always be accepted.
   */
  it('always accepts buffers with valid magic bytes for allowed types', () => {
    fc.assert(
      fc.property(allowedMagicBufferArb, (buffer) => {
        const result = validateFile(buffer, ALLOWED_MIME_TYPES, MAX_SIZE);
        return result.valid === true;
      }),
      { numRuns: 200 }
    );
  });

  /**
   * **Validates: Requirements 12.5, 14.4**
   *
   * Buffers with magic bytes matching a non-allowed type (GIF) should always be rejected,
   * even though they are a recognized format — the allowed set gate must hold.
   */
  it('always rejects buffers with valid magic bytes for non-allowed types (GIF)', () => {
    fc.assert(
      fc.property(nonAllowedMagicBufferArb, (buffer) => {
        const result = validateFile(buffer, ALLOWED_MIME_TYPES, MAX_SIZE);
        return result.valid === false;
      }),
      { numRuns: 200 }
    );
  });

  /**
   * **Validates: Requirements 12.5, 14.4**
   *
   * Random buffers that don't match any known magic byte signature should always be rejected.
   * This demonstrates that detection depends solely on magic bytes, not external metadata.
   */
  it('always rejects buffers with unrecognized magic bytes', () => {
    fc.assert(
      fc.property(unrecognizedBufferArb, (buffer) => {
        const result = validateFile(buffer, ALLOWED_MIME_TYPES, MAX_SIZE);
        return result.valid === false;
      }),
      { numRuns: 200 }
    );
  });
});
