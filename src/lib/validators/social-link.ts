import { z } from "zod";

/**
 * Schema for creating a new social link.
 * Validates platform name and URL format with length constraints.
 */
export const socialLinkCreateSchema = z.object({
  platform: z.string().min(1, "Platform is required").max(100),
  url: z.url().max(500),
});

/**
 * Schema for updating an existing social link.
 * All fields except id are optional to allow partial updates.
 */
export const socialLinkUpdateSchema = z.object({
  id: z.uuid(),
  platform: z.string().min(1).max(100).optional(),
  url: z.url().max(500).optional(),
  isVisible: z.boolean().optional(),
});

/**
 * Schema for reordering social links.
 * Accepts an array of objects mapping link IDs to their new display order.
 */
export const socialLinkReorderSchema = z.array(
  z.object({
    id: z.uuid(),
    displayOrder: z.number().int().min(0),
  })
);

export type SocialLinkCreateInput = z.infer<typeof socialLinkCreateSchema>;
export type SocialLinkUpdateInput = z.infer<typeof socialLinkUpdateSchema>;
export type SocialLinkReorderInput = z.infer<typeof socialLinkReorderSchema>;
