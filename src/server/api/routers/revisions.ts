import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import * as revisionService from "@/server/services/revision.service";

export const revisionsRouter = createTRPCRouter({
  /**
   * Get revisions for a specific entity.
   */
  getEntityRevisions: protectedProcedure
    .input(z.object({
      entityId: z.string(),
      entityType: z.string().optional(),
      limit: z.number().min(1).max(100).optional().default(50),
    }))
    .query(async ({ input }) => {
      try {
        return await revisionService.getEntityRevisions(input.entityId, {
          entityType: input.entityType,
          limit: input.limit,
        });
      } catch (error) {
        console.error("[revisions.getEntityRevisions] Error:", error);
        return [];
      }
    }),

  /**
   * Get a specific revision by ID.
   */
  getById: protectedProcedure
    .input(z.object({
      revisionId: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        return await revisionService.getRevisionById(input.revisionId);
      } catch (error) {
        console.error("[revisions.getById] Error:", error);
        return null;
      }
    }),

  /**
   * Get recent revisions across all entities.
   */
  getRecent: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).optional().default(20),
    }).optional())
    .query(async ({ input }) => {
      try {
        return await revisionService.getRecentRevisions(input?.limit ?? 20);
      } catch (error) {
        console.error("[revisions.getRecent] Error:", error);
        return [];
      }
    }),

  /**
   * Get revision statistics.
   */
  stats: protectedProcedure
    .input(z.object({
      days: z.number().min(1).max(365).optional().default(30),
    }).optional())
    .query(async ({ input }) => {
      try {
        return await revisionService.getRevisionStats(input?.days ?? 30);
      } catch (error) {
        console.error("[revisions.stats] Error:", error);
        return { totalRevisions: 0, byType: {} };
      }
    }),

  /**
   * Compare two revisions.
   */
  compare: protectedProcedure
    .input(z.object({
      oldRevisionId: z.string(),
      newRevisionId: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        const oldRevision = await revisionService.getRevisionById(input.oldRevisionId);
        const newRevision = await revisionService.getRevisionById(input.newRevisionId);
        
        if (!oldRevision || !newRevision) {
          throw new Error("One or both revisions not found");
        }
        
        return revisionService.compareRevisions(oldRevision, newRevision);
      } catch (error) {
        console.error("[revisions.compare] Error:", error);
        throw error;
      }
    }),

  /**
   * Get the snapshot from a revision (for restoring).
   */
  getSnapshot: protectedProcedure
    .input(z.object({
      revisionId: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        const revision = await revisionService.getRevisionById(input.revisionId);
        if (!revision) {
          throw new Error("Revision not found");
        }
        return revision.snapshot;
      } catch (error) {
        console.error("[revisions.getSnapshot] Error:", error);
        throw error;
      }
    }),
});
