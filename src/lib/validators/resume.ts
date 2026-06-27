import { z } from "zod";

/**
 * Maximum allowed file size for resume uploads: 10MB.
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Schema for validating resume upload metadata.
 * Used for client-side pre-validation before uploading.
 * Actual file validation (magic bytes) happens server-side.
 */
export const resumeUploadSchema = z.object({
  filename: z
    .string()
    .min(1, "Filename is required")
    .refine((name) => name.endsWith(".pdf"), {
      message: "File must be a PDF (.pdf)",
    }),
  fileSize: z
    .number()
    .max(MAX_FILE_SIZE, "File size must not exceed 10MB"),
  mimeType: z.literal("application/pdf"),
});

export type ResumeUploadInput = z.infer<typeof resumeUploadSchema>;
