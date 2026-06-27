import { describe, it, expect, vi } from 'vitest';

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

// ---------------------------------------------------------------------------
// Magic byte helpers
// ---------------------------------------------------------------------------

/** Creates a Buffer that starts with PDF magic bytes (%PDF) */
function createPdfBuffer(size: number = 1024): Buffer {
  const buf = Buffer.alloc(size);
  // %PDF magic bytes
  buf[0] = 0x25;
  buf[1] = 0x50;
  buf[2] = 0x44;
  buf[3] = 0x46;
  return buf;
}

/** Creates a Buffer that starts with JPEG magic bytes */
function createJpegBuffer(size: number = 1024): Buffer {
  const buf = Buffer.alloc(size);
  buf[0] = 0xff;
  buf[1] = 0xd8;
  buf[2] = 0xff;
  return buf;
}

/** Creates a Buffer that starts with PNG magic bytes */
function createPngBuffer(size: number = 1024): Buffer {
  const buf = Buffer.alloc(size);
  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  pngSignature.forEach((byte, i) => { buf[i] = byte; });
  return buf;
}

/** Creates a Buffer that starts with WebP magic bytes (RIFF....WEBP) */
function createWebpBuffer(size: number = 1024): Buffer {
  const buf = Buffer.alloc(size);
  // RIFF at offset 0
  buf[0] = 0x52; // R
  buf[1] = 0x49; // I
  buf[2] = 0x46; // F
  buf[3] = 0x46; // F
  // File size bytes (can be arbitrary for testing)
  buf[4] = 0x00;
  buf[5] = 0x00;
  buf[6] = 0x00;
  buf[7] = 0x00;
  // WEBP at offset 8
  buf[8] = 0x57;  // W
  buf[9] = 0x45;  // E
  buf[10] = 0x42; // B
  buf[11] = 0x50; // P
  return buf;
}

/** Creates a Buffer with GIF magic bytes (not in allowed types) */
function createGifBuffer(size: number = 1024): Buffer {
  const buf = Buffer.alloc(size);
  // GIF89a magic bytes
  buf[0] = 0x47; // G
  buf[1] = 0x49; // I
  buf[2] = 0x46; // F
  buf[3] = 0x38; // 8
  return buf;
}

/** Creates a Buffer with unrecognized/random bytes */
function createUnrecognizedBuffer(size: number = 1024): Buffer {
  const buf = Buffer.alloc(size);
  // Fill with bytes that don't match any known signature
  buf[0] = 0x01;
  buf[1] = 0x02;
  buf[2] = 0x03;
  buf[3] = 0x04;
  return buf;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

const TEN_MB = 10 * 1024 * 1024;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('validateFile', () => {
  describe('acceptance of valid MIME types', () => {
    it('accepts application/pdf files', () => {
      const file = createPdfBuffer();
      const result = validateFile(file, ALLOWED_MIME_TYPES, TEN_MB);
      expect(result).toEqual({ valid: true });
    });

    it('accepts image/jpeg files', () => {
      const file = createJpegBuffer();
      const result = validateFile(file, ALLOWED_MIME_TYPES, TEN_MB);
      expect(result).toEqual({ valid: true });
    });

    it('accepts image/png files', () => {
      const file = createPngBuffer();
      const result = validateFile(file, ALLOWED_MIME_TYPES, TEN_MB);
      expect(result).toEqual({ valid: true });
    });

    it('accepts image/webp files', () => {
      const file = createWebpBuffer();
      const result = validateFile(file, ALLOWED_MIME_TYPES, TEN_MB);
      expect(result).toEqual({ valid: true });
    });
  });

  describe('rejection of invalid MIME types regardless of file extension', () => {
    it('rejects GIF files (not in allowed list)', () => {
      const file = createGifBuffer();
      const result = validateFile(file, ALLOWED_MIME_TYPES, TEN_MB);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain('image/gif');
        expect(result.error).toContain('not allowed');
      }
    });

    it('rejects files with unrecognized magic bytes', () => {
      const file = createUnrecognizedBuffer();
      const result = validateFile(file, ALLOWED_MIME_TYPES, TEN_MB);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain('Unable to determine file type');
      }
    });

    it('rejects files whose magic bytes do not match regardless of buffer content', () => {
      // A buffer that looks like random data but is large enough
      const file = Buffer.alloc(2048, 0xAA);
      const result = validateFile(file, ALLOWED_MIME_TYPES, TEN_MB);
      expect(result.valid).toBe(false);
    });

    it('detects MIME type from magic bytes, not from any external input', () => {
      // Even if we call it "document.pdf", if bytes are GIF it should reject
      const file = createGifBuffer();
      const result = validateFile(file, ALLOWED_MIME_TYPES, TEN_MB);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain('image/gif');
      }
    });
  });

  describe('rejection of files exceeding 10 MB', () => {
    it('rejects a file that is exactly 1 byte over the 10 MB limit', () => {
      const file = createPdfBuffer(TEN_MB + 1);
      const result = validateFile(file, ALLOWED_MIME_TYPES, TEN_MB);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain('10.0 MB');
      }
    });

    it('accepts a file that is exactly at the 10 MB limit', () => {
      const file = createPdfBuffer(TEN_MB);
      const result = validateFile(file, ALLOWED_MIME_TYPES, TEN_MB);
      expect(result).toEqual({ valid: true });
    });

    it('rejects a file significantly over the limit', () => {
      const file = createPngBuffer(TEN_MB + 5000);
      const result = validateFile(file, ALLOWED_MIME_TYPES, TEN_MB);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain('exceeds maximum size');
      }
    });
  });

  describe('empty file handling', () => {
    it('rejects an empty file with "File is empty" error', () => {
      const file = Buffer.alloc(0);
      const result = validateFile(file, ALLOWED_MIME_TYPES, TEN_MB);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toBe('File is empty');
      }
    });
  });
});
