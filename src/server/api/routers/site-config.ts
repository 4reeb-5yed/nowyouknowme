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
  theme: z.string().max(20).optional(),
  accentColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color (e.g. #2563eb)")
    .optional(),
  heroTagline: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImageUrl: z.string().url().nullish(),
});

export const siteConfigRouter = createTRPCRouter({
  /**
   * Get site configuration (public).
   */
  get: publicProcedure.query(async () => {
    return siteConfigService.getConfig();
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
