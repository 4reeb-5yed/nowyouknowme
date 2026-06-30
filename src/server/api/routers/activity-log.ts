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
      return activityLogService.getRecentActivity({
        limit: input?.limit,
        entityType: input?.entityType,
      });
    }),

  /**
   * Get activity statistics.
   */
  stats: protectedProcedure
    .input(z.object({
      days: z.number().min(1).max(365).optional().default(7),
    }).optional())
    .query(async ({ input }) => {
      return activityLogService.getActivityStats(input?.days);
    }),

  /**
   * Search activity logs.
   */
  search: protectedProcedure
    .input(z.object({
      query: z.string().min(1),
    }))
    .query(async ({ input }) => {
      return activityLogService.searchActivityLogs(input.query);
    }),

  /**
   * Get history for a specific entity.
   */
  getEntityHistory: protectedProcedure
    .input(z.object({
      entityId: z.string(),
    }))
    .query(async ({ input }) => {
      return activityLogService.getEntityHistory(input.entityId);
    }),
});
