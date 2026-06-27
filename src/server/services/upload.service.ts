import { randomUUID } from "crypto";

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

import { serverEnv } from "@/config/env";

// ---------------------------------------------------------------------------
// Magic-byte signatures for MIME type detection
// ---------------------------------------------------------------------------

type MagicSignature = {
  mimeType: string;
  bytes: number[];
  offset?: number;
};

const MAGIC_SIGNATURES: MagicSignature[] = [
  // Images
  { mimeType: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { mimeType: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mimeType: "image/gif", bytes: [0x47, 0x49, 0x46, 0x38] },
  { mimeType: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 }, // "RIFF" — also check for "WEBP" at offset 8
  { mimeType: "image/svg+xml", bytes: [0x3c, 0x73, 0x76, 0x67] }, // "<svg"
  { mimeType: "image/avif", bytes: [0x00, 0x00, 0x00], offset: 0 }, // ftyp box — further validated below
  // Documents
  { mimeType: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46] }, // "%PDF"
];

/**
 * Detects the MIME type of a file buffer using magic byte signatures.
 * Returns the detected MIME type or null if unrecognized.
 */
function detectMimeType(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;

  // Check WebP specifically (RIFF....WEBP)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }

  // Check AVIF (ftyp box with "avif" or "avis" brand)
  if (buffer.length >= 12) {
    const ftypStr = buffer.toString("ascii", 4, 12);
    if (ftypStr.startsWith("ftyp") && (ftypStr.includes("avif") || ftypStr.includes("avis"))) {
      return "image/avif";
    }
  }

  // Check SVG (can start with whitespace or BOM, then "<svg" or "<?xml")
  const head = buffer.toString("utf8", 0, Math.min(256, buffer.length)).trimStart();
  if (head.startsWith("<svg") || (head.startsWith("<?xml") && head.includes("<svg"))) {
    return "image/svg+xml";
  }

  // Standard magic byte matching
  for (const sig of MAGIC_SIGNATURES) {
    // Skip types we've already handled above
    if (sig.mimeType === "image/webp" || sig.mimeType === "image/avif" || sig.mimeType === "image/svg+xml") {
      continue;
    }

    const offset = sig.offset ?? 0;
    if (buffer.length < offset + sig.bytes.length) continue;

    const match = sig.bytes.every((byte, i) => buffer[offset + i] === byte);
    if (match) return sig.mimeType;
  }

  return null;
}

// ---------------------------------------------------------------------------
// S3 Client (lazily initialized)
// ---------------------------------------------------------------------------

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${serverEnv.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: serverEnv.R2_ACCESS_KEY_ID,
        secretAccessKey: serverEnv.R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3Client;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type ValidationResult =
  | { valid: true }
  | { valid: false; error: string };

/**
 * Validates a file buffer against allowed MIME types and maximum size.
 * Uses magic byte detection rather than trusting client-supplied content-type.
 */
export function validateFile(
  file: Buffer,
  allowedMimeTypes: string[],
  maxSizeBytes: number
): ValidationResult {
  // Check file size
  if (file.length > maxSizeBytes) {
    const maxMB = (maxSizeBytes / (1024 * 1024)).toFixed(1);
    return { valid: false, error: `File exceeds maximum size of ${maxMB} MB` };
  }

  if (file.length === 0) {
    return { valid: false, error: "File is empty" };
  }

  // Detect MIME type from magic bytes
  const detectedType = detectMimeType(file);

  if (!detectedType) {
    return { valid: false, error: "Unable to determine file type" };
  }

  if (!allowedMimeTypes.includes(detectedType)) {
    return {
      valid: false,
      error: `File type "${detectedType}" is not allowed. Accepted types: ${allowedMimeTypes.join(", ")}`,
    };
  }

  return { valid: true };
}

/**
 * Uploads a file buffer to Cloudflare R2.
 * Generates a unique key using crypto.randomUUID() + original filename.
 * Returns the public URL of the uploaded file.
 */
export async function uploadFile(
  file: Buffer,
  options: { filename: string; contentType: string; folder?: string }
): Promise<{ url: string }> {
  const client = getS3Client();

  const uniqueId = randomUUID();
  const key = options.folder
    ? `${options.folder}/${uniqueId}-${options.filename}`
    : `${uniqueId}-${options.filename}`;

  const command = new PutObjectCommand({
    Bucket: serverEnv.R2_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: options.contentType,
    CacheControl: "public, max-age=31536000, immutable",
  });

  await client.send(command);

  const publicUrl = `${serverEnv.R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`;

  return { url: publicUrl };
}

/**
 * Deletes a file from Cloudflare R2 by its key.
 */
export async function deleteFile(key: string): Promise<void> {
  const client = getS3Client();

  const command = new DeleteObjectCommand({
    Bucket: serverEnv.R2_BUCKET_NAME,
    Key: key,
  });

  await client.send(command);
}
