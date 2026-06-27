import { z } from "zod";

/**
 * Valid theme values for Site_Config.
 */
export const themeValues = ["light", "dark", "system"] as const;

/**
 * Hex color regex: matches #RRGGBB format (6 hex digits).
 */
const hexColorRegex = /^#[0-9a-fA-F]{6}$/;

/**
 * Schema for updating site configuration.
 * All fields are optional to support partial updates.
 *
 * - theme: light, dark, or system
 * - accentColor: valid hex color in #RRGGBB format
 * - heroTagline: text, max 500 characters
 * - metaDescription: text, max 500 characters
 * - ogImageUrl: valid URL string or null
 */
export const siteConfigUpdateSchema = z.object({
  theme: z.enum(themeValues).optional(),
  accentColor: z
    .string()
    .regex(hexColorRegex, "Accent color must be a valid hex color (#RRGGBB)")
    .optional(),
  heroTagline: z.string().max(500, "Hero tagline must not exceed 500 characters").optional(),
  metaDescription: z
    .string()
    .max(500, "Meta description must not exceed 500 characters")
    .optional(),
  ogImageUrl: z.url("OG image must be a valid URL").nullable().optional(),
});

// Inferred types for use across the codebase
export type SiteConfigUpdateInput = z.infer<typeof siteConfigUpdateSchema>;
