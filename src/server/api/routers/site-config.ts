import { z } from "zod";
import { revalidatePath } from "next/cache";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import * as siteConfigService from "@/server/services/site-config.service";

/**
 * Input schema for updating site configuration.
 * All fields are optional — only provided fields are updated.
 */
const siteConfigUpdateSchema = z.object({
  // Theme
  theme: z.string().max(20).optional(),
  accentColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color (e.g. #2563eb)")
    .optional(),
  
  // Hero Section
  heroTagline: z.string().optional(),
  heroHeadline: z.string().optional(),
  heroEmphasisWord: z.string().max(50).optional(),
  heroSubhead: z.string().optional(),
  heroShowResume: z.boolean().optional(),
  
  // Homepage Sections Visibility
  showFeaturedProjects: z.boolean().optional(),
  showExperience: z.boolean().optional(),
  showSkills: z.boolean().optional(),
  showAbout: z.boolean().optional(),
  showContact: z.boolean().optional(),
  
  // SEO
  metaDescription: z.string().optional(),
  ogImageUrl: z.string().url().nullish().optional(),
  
  // Footer
  footerCopyright: z.string().optional(),
  footerTagline: z.string().optional(),
  
  // Section Order
  sectionOrder: z.array(z.string()).optional(),
});

export const siteConfigRouter = createTRPCRouter({
  /**
   * Get site configuration (public).
   */
  get: publicProcedure.query(async () => {
    try {
      return await siteConfigService.getConfig();
    } catch (error) {
      console.error("[site-config.get] Error:", error);
      // Return defaults on error
      return {
        id: "error",
        theme: "system",
        accentColor: "#2563eb",
        heroTagline: "SOFTWARE ENGINEER",
        metaDescription: "",
        ogImageUrl: null,
        heroHeadline: "I build software that works.",
        heroEmphasisWord: "works",
        heroSubhead: "",
        heroShowResume: true,
        showFeaturedProjects: true,
        showExperience: true,
        showSkills: true,
        showAbout: true,
        showContact: true,
        footerCopyright: "",
        footerTagline: "Built with passion.",
        sectionOrder: ["hero", "featured-projects", "experience", "skills", "about", "contact"],
      };
    }
  }),

  /**
   * Update site configuration (protected, owner-only).
   * Revalidates all public pages since site config affects metadata and theming globally.
   */
  update: protectedProcedure
    .input(siteConfigUpdateSchema)
    .mutation(async ({ input }) => {
      const result = await siteConfigService.updateConfig(input);
      revalidatePath("/", "layout");
      return result;
    }),
});
