import { z } from "zod";
import { revalidatePath } from "next/cache";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import * as projectService from "@/server/services/project.service";
import {
  projectCreateSchema,
  projectUpdateSchema,
  projectReorderSchema,
} from "@/lib/validators/project";

/** Revalidate pages affected by project mutations. */
function revalidateProjectPages() {
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/projects/[slug]", "page");
}

export const projectsRouter = createTRPCRouter({
  /**
   * List all published projects (public).
   */
  list: publicProcedure.query(async () => {
    return projectService.listPublished();
  }),

  /**
   * Get a single published project by slug (public).
   */
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return projectService.getBySlug(input.slug);
    }),

  /**
   * List all projects including drafts (protected, admin).
   */
  listAll: protectedProcedure.query(async () => {
    return projectService.listAll();
  }),

  /**
   * Create a new project (protected).
   */
  create: protectedProcedure
    .input(projectCreateSchema)
    .mutation(async ({ input }) => {
      const result = await projectService.create(input);
      revalidateProjectPages();
      return result;
    }),

  /**
   * Update an existing project (protected).
   */
  update: protectedProcedure
    .input(projectUpdateSchema)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const result = await projectService.update(id, data);
      revalidateProjectPages();
      return result;
    }),

  /**
   * Delete a project by ID (protected).
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await projectService.deleteProject(input.id);
      revalidateProjectPages();
    }),

  /**
   * Reorder projects by updating displayOrder (protected).
   */
  reorder: protectedProcedure
    .input(projectReorderSchema)
    .mutation(async ({ input }) => {
      const result = await projectService.reorder(input);
      revalidateProjectPages();
      return result;
    }),
});
