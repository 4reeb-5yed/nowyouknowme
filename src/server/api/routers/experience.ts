import { z } from "zod";
import { revalidatePath } from "next/cache";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import * as experienceService from "@/server/services/experience.service";
import {
  experienceCreateSchema,
  experienceUpdateSchema,
  experienceReorderSchema,
} from "@/lib/validators/experience";

/** Revalidate pages affected by experience mutations. */
function revalidateExperiencePages() {
  revalidatePath("/");
  revalidatePath("/experience");
}

export const experienceRouter = createTRPCRouter({
  /**
   * List all visible experience entries (public).
   * Sorted by startDate descending (most recent first).
   */
  listVisible: publicProcedure.query(async () => {
    return experienceService.listVisible();
  }),

  /**
   * List all experience entries including hidden (protected, admin).
   * Sorted by displayOrder ascending.
   */
  listAll: protectedProcedure.query(async () => {
    return experienceService.listAll();
  }),

  /**
   * Create a new experience entry (protected).
   */
  create: protectedProcedure
    .input(experienceCreateSchema)
    .mutation(async ({ input }) => {
      const result = await experienceService.create(input);
      revalidateExperiencePages();
      return result;
    }),

  /**
   * Update an existing experience entry (protected).
   */
  update: protectedProcedure
    .input(experienceUpdateSchema)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const result = await experienceService.update(id, data);
      revalidateExperiencePages();
      return result;
    }),

  /**
   * Delete an experience entry by ID (protected).
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await experienceService.deleteExperience(input.id);
      revalidateExperiencePages();
    }),

  /**
   * Reorder experience entries by updating displayOrder (protected).
   */
  reorder: protectedProcedure
    .input(experienceReorderSchema)
    .mutation(async ({ input }) => {
      const result = await experienceService.reorder(input);
      revalidateExperiencePages();
      return result;
    }),
});
