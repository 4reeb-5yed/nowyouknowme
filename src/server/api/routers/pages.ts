import { z } from "zod";
import { revalidatePath } from "next/cache";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import * as contentService from "@/server/services/content.service";
import { sectionUpdateSchema } from "@/lib/validators/section";

/** Revalidate pages affected by content mutations (about, hero, contact, homepage). */
function revalidateContentPages() {
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/contact");
}

export const pagesRouter = createTRPCRouter({
  /**
   * Get a section by key (public).
   */
  getSection: publicProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      return contentService.getSection(input.key);
    }),

  /**
   * Update a section's content (protected, admin).
   */
  updateSection: protectedProcedure
    .input(sectionUpdateSchema)
    .mutation(async ({ input }) => {
      const result = await contentService.updateSection(input.key, input.content);
      revalidateContentPages();
      return result;
    }),
});
