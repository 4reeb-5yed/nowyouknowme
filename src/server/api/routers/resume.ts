import { z } from "zod";
import { revalidatePath } from "next/cache";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import * as resumeService from "@/server/services/resume.service";

export const resumeRouter = createTRPCRouter({
  /**
   * Get the currently active resume (public).
   */
  getActive: publicProcedure.query(async () => {
    return resumeService.getActive();
  }),

  /**
   * List all resumes (protected, admin).
   */
  listAll: protectedProcedure.query(async () => {
    return resumeService.listAll();
  }),

  /**
   * Set a specific resume as active (protected).
   * Revalidates all pages since the resume button can appear globally.
   */
  setActive: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const result = await resumeService.setActive(input.id);
      revalidatePath("/", "layout");
      return result;
    }),
});
