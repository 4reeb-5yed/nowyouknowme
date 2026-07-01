import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import * as activityLogService from "@/server/services/activity-log.service";

export const activityLogRouter = createTRPCRouter({
  /**
   * Get recent activity logs.
   */
  list: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).optional().default(50),
      entityType: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      try {
        return await activityLogService.getRecentActivity({
          limit: input?.limit,
          entityType: input?.entityType,
        });
      } catch (error) {
        console.error("[activity-log.list] Error:", error);
        return []; // Return empty array on error instead of crashing
      }
    }),

  /**
   * Get activity statistics.
   */
  stats: protectedProcedure
    .input(z.object({
      days: z.number().min(1).max(365).optional().default(7),
    }).optional())
    .query(async ({ input }) => {
      try {
        return await activityLogService.getActivityStats(input?.days);
      } catch (error) {
        console.error("[activity-log.stats] Error:", error);
        return { totalChanges: 0, byDay: {}, byType: {}, byAction: {} };
      }
    }),

  /**
   * Search activity logs.
   */
  search: protectedProcedure
    .input(z.object({
      query: z.string().min(1),
    }))
    .query(async ({ input }) => {
      try {
        return await activityLogService.searchActivityLogs(input.query);
      } catch (error) {
        console.error("[activity-log.search] Error:", error);
        return [];
      }
    }),

  /**
   * Get history for a specific entity.
   */
  getEntityHistory: protectedProcedure
    .input(z.object({
      entityId: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        return await activityLogService.getEntityHistory(input.entityId);
      } catch (error) {
        console.error("[activity-log.getEntityHistory] Error:", error);
        return [];
      }
    }),
});
