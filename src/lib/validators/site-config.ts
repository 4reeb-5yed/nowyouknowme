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
 */
export const siteConfigUpdateSchema = z.object({
  // Theme
  theme: z.enum(themeValues).optional(),
  accentColor: z
    .string()
    .regex(hexColorRegex, "Accent color must be a valid hex color (#RRGGBB)")
    .optional(),
  
  // Hero Section
  heroTagline: z.string().max(200).optional(),
  heroHeadline: z.string().max(500).optional(),
  heroEmphasisWord: z.string().max(50).optional(),
  heroSubhead: z.string().max(500).optional(),
  heroShowResume: z.boolean().optional(),
  
  // Homepage Sections Visibility
  showFeaturedProjects: z.boolean().optional(),
  showExperience: z.boolean().optional(),
  showSkills: z.boolean().optional(),
  showAbout: z.boolean().optional(),
  showContact: z.boolean().optional(),
  
  // SEO
  metaDescription: z.string().max(500).optional(),
  ogImageUrl: z.string().url().nullable().optional(),
  
  // Footer
  footerCopyright: z.string().max(200).optional(),
  footerTagline: z.string().max(200).optional(),
  
  // Section Order
  sectionOrder: z.array(z.string()).optional(),
});

// Inferred types for use across the codebase
export type SiteConfigUpdateInput = z.infer<typeof siteConfigUpdateSchema>;
