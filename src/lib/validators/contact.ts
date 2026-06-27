import { z } from "zod";

/**
 * Schema for contact form submissions.
 * Used on both client-side (React Hook Form) and server-side (API route validation).
 *
 * - name: required, 1–100 characters
 * - email: required, valid email format
 * - message: required, 10–5000 characters
 */
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message must be 5000 characters or less"),
});

// Inferred types for use across the codebase
export type ContactFormInput = z.infer<typeof contactFormSchema>;
