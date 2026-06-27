import { z } from "zod";
import { revalidatePath } from "next/cache";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import * as certificationService from "@/server/services/certification.service";
import {
  certificationCreateSchema,
  certificationUpdateSchema,
  certificationReorderSchema,
} from "@/lib/validators/certification";

/** Revalidate pages affected by certification mutations. */
function revalidateCertificationPages() {
  revalidatePath("/");
  revalidatePath("/certifications");
}

export const certificationsRouter = createTRPCRouter({
  /**
   * List all visible certifications (public).
   */
  listVisible: publicProcedure.query(async () => {
    return certificationService.listVisible();
  }),

  /**
   * List all certifications including hidden ones (protected, admin).
   */
  listAll: protectedProcedure.query(async () => {
    return certificationService.listAll();
  }),

  /**
   * Create a new certification (protected).
   */
  create: protectedProcedure
    .input(certificationCreateSchema)
    .mutation(async ({ input }) => {
      const result = await certificationService.create(input);
      revalidateCertificationPages();
      return result;
    }),

  /**
   * Update an existing certification (protected).
   */
  update: protectedProcedure
    .input(certificationUpdateSchema)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const result = await certificationService.update(id, data);
      revalidateCertificationPages();
      return result;
    }),

  /**
   * Delete a certification by ID (protected).
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await certificationService.deleteCertification(input.id);
      revalidateCertificationPages();
    }),

  /**
   * Reorder certifications by updating displayOrder (protected).
   */
  reorder: protectedProcedure
    .input(certificationReorderSchema)
    .mutation(async ({ input }) => {
      const result = await certificationService.reorder(input);
      revalidateCertificationPages();
      return result;
    }),
});
