import { eq, desc, and, gte, lte, or, like, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { activityLogs, type ActivityLog, type NewActivityLog } from "@/server/db/schema/activity-log";

/**
 * Log an activity to the activity log.
 */
export async function logActivity(data: NewActivityLog): Promise<ActivityLog | null> {
  try {
    const result = await db.insert(activityLogs).values(data).returning();
    return result[0] ?? null;
  } catch {
    return null;
  }
}

/**
 * Get recent activity logs with optional filters.
 */
export async function getRecentActivity(options?: {
  limit?: number;
  entityType?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<ActivityLog[]> {
  const limit = options?.limit ?? 50;
  const conditions = [];

  if (options?.entityType) {
    conditions.push(eq(activityLogs.entityType, options.entityType));
  }
  if (options?.userId) {
    conditions.push(eq(activityLogs.userId, options.userId));
  }
  if (options?.startDate) {
    conditions.push(gte(activityLogs.createdAt, options.startDate));
  }
  if (options?.endDate) {
    conditions.push(lte(activityLogs.createdAt, options.endDate));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return db.query.activityLogs.findMany({
    where: whereClause,
    orderBy: [desc(activityLogs.createdAt)],
    limit,
  });
}

/**
 * Get activity stats for the dashboard.
 */
export async function getActivityStats(days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const recentLogs = await db.query.activityLogs.findMany({
    where: gte(activityLogs.createdAt, startDate),
    orderBy: [desc(activityLogs.createdAt)],
  });

  // Group by day
  const byDay: Record<string, number> = {};
  const byType: Record<string, number> = {};
  const byAction: Record<string, number> = {};

  for (const log of recentLogs) {
    const day = log.createdAt.toISOString().split("T")[0] ?? "unknown";
    byDay[day] = (byDay[day] ?? 0) + 1;
    if (log.entityType) {
      byType[log.entityType] = (byType[log.entityType] ?? 0) + 1;
    }
    if (log.action) {
      byAction[log.action] = (byAction[log.action] ?? 0) + 1;
    }
  }

  return {
    totalChanges: recentLogs.length,
    byDay,
    byType,
    byAction,
  };
}

/**
 * Search activity logs.
 */
export async function searchActivityLogs(query: string): Promise<ActivityLog[]> {
  const searchPattern = `%${query}%`;
  
  return db.query.activityLogs.findMany({
    where: or(
      like(activityLogs.entityName, searchPattern),
      like(activityLogs.action, searchPattern),
      like(activityLogs.entityType, searchPattern)
    ),
    orderBy: [desc(activityLogs.createdAt)],
    limit: 50,
  });
}

/**
 * Get changes for a specific entity.
 */
export async function getEntityHistory(entityId: string): Promise<ActivityLog[]> {
  return db.query.activityLogs.findMany({
    where: eq(activityLogs.entityId, entityId),
    orderBy: [desc(activityLogs.createdAt)],
  });
}

/**
 * Delete old activity logs (cleanup).
 */
export async function cleanupOldLogs(daysToKeep: number = 90): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const result = await db.delete(activityLogs)
    .where(lte(activityLogs.createdAt, cutoffDate));
  
  return result.rowCount ?? 0;
}
