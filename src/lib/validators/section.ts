import { z } from "zod";

/**
 * Schema for updating a section's content.
 * Validates that the key is one of the allowed section identifiers
 * and that content is a non-empty string.
 */
export const sectionUpdateSchema = z.object({
  key: z.enum(["about", "skills", "contact"]),
  content: z.string().min(1, "Content cannot be empty"),
});

export type SectionUpdateInput = z.infer<typeof sectionUpdateSchema>;
