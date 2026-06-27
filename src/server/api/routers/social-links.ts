import { z } from "zod";
import { revalidatePath } from "next/cache";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import * as socialLinkService from "@/server/services/social-link.service";
import {
  socialLinkCreateSchema,
  socialLinkUpdateSchema,
  socialLinkReorderSchema,
} from "@/lib/validators/social-link";

/** Revalidate all public pages (social links appear in the footer/layout). */
function revalidateAllPages() {
  revalidatePath("/", "layout");
}

export const socialLinksRouter = createTRPCRouter({
  /**
   * List visible social links (public).
   */
  listVisible: publicProcedure.query(async () => {
    return socialLinkService.listVisible();
  }),

  /**
   * List all social links including hidden ones (protected, admin).
   */
  listAll: protectedProcedure.query(async () => {
    return socialLinkService.listAll();
  }),

  /**
   * Create a new social link (protected).
   */
  create: protectedProcedure
    .input(socialLinkCreateSchema)
    .mutation(async ({ input, ctx }) => {
      const result = await socialLinkService.create({
        ...input,
        userId: ctx.session.user.id!,
      });
      revalidateAllPages();
      return result;
    }),

  /**
   * Update an existing social link (protected).
   */
  update: protectedProcedure
    .input(socialLinkUpdateSchema)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const result = await socialLinkService.update(id, data);
      revalidateAllPages();
      return result;
    }),

  /**
   * Delete a social link by ID (protected).
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await socialLinkService.deleteSocialLink(input.id);
      revalidateAllPages();
    }),

  /**
   * Reorder social links by updating displayOrder (protected).
   */
  reorder: protectedProcedure
    .input(socialLinkReorderSchema)
    .mutation(async ({ input }) => {
      const result = await socialLinkService.reorder(input);
      revalidateAllPages();
      return result;
    }),
});
