import { eq, desc, and, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { revisions, type Revision, type NewRevision } from "@/server/db/schema/revision";

/**
 * Create a revision snapshot before an entity change.
 */
export async function createRevision(data: NewRevision): Promise<Revision | null> {
  try {
    const result = await db.insert(revisions).values(data).returning();
    return result[0] ?? null;
  } catch {
    return null;
  }
}

/**
 * Get all revisions for a specific entity.
 */
export async function getEntityRevisions(
  entityId: string,
  options?: {
    entityType?: string;
    limit?: number;
  }
): Promise<Revision[]> {
  const conditions = [eq(revisions.entityId, entityId)];
  
  if (options?.entityType) {
    conditions.push(eq(revisions.entityType, options.entityType));
  }

  return db.query.revisions.findMany({
    where: and(...conditions),
    orderBy: [desc(revisions.createdAt)],
    limit: options?.limit ?? 50,
  });
}

/**
 * Get the most recent revision for an entity (before current state).
 */
export async function getLatestRevision(entityId: string): Promise<Revision | null> {
  const result = await db.query.revisions.findFirst({
    where: eq(revisions.entityId, entityId),
    orderBy: [desc(revisions.createdAt)],
  });
  return result ?? null;
}

/**
 * Get a specific revision by ID.
 */
export async function getRevisionById(revisionId: string): Promise<Revision | null> {
  const result = await db.query.revisions.findFirst({
    where: eq(revisions.id, revisionId),
  });
  return result ?? null;
}

/**
 * Get revision by ID using direct query (for mutations that need the full revision).
 */
export async function getRevisionByIdDirect(revisionId: string): Promise<Revision | null> {
  const results = await db.select().from(revisions).where(eq(revisions.id, revisionId)).limit(1);
  return results[0] ?? null;
}

/**
 * Get recent revisions across all entities (for activity feed).
 */
export async function getRecentRevisions(limit: number = 20): Promise<Revision[]> {
  return db.query.revisions.findMany({
    orderBy: [desc(revisions.createdAt)],
    limit,
  });
}

/**
 * Compare two revisions and return the differences.
 */
export function compareRevisions(oldRevision: Revision, newRevision: Revision): RevisionDiff {
  const oldData = oldRevision.snapshot as Record<string, unknown>;
  const newData = newRevision.snapshot as Record<string, unknown>;
  
  const changes: Record<string, { old: unknown; new: unknown }> = {};
  
  // Find all keys in both revisions
  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
  
  for (const key of allKeys) {
    const oldValue = oldData[key];
    const newValue = newData[key];
    
    // Skip internal fields
    if (key === "id" || key === "updatedAt" || key === "createdAt") {
      continue;
    }
    
    // Compare values
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes[key] = { old: oldValue, new: newValue };
    }
  }
  
  return {
    oldRevision,
    newRevision,
    changes,
    hasChanges: Object.keys(changes).length > 0,
  };
}

export interface RevisionDiff {
  oldRevision: Revision;
  newRevision: Revision;
  changes: Record<string, { old: unknown; new: unknown }>;
  hasChanges: boolean;
}

/**
 * Get revision statistics.
 */
export async function getRevisionStats(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const recentRevisions = await db.query.revisions.findMany({
    where: sql`${revisions.createdAt} >= ${startDate}`,
  });

  // Group by entity type
  const byEntityType: Record<string, number> = {};
  const byAction: Record<string, number> = {};
  const byDay: Record<string, number> = {};

  for (const rev of recentRevisions) {
    if (rev.entityType) {
      byEntityType[rev.entityType] = (byEntityType[rev.entityType] ?? 0) + 1;
    }
    if (rev.action) {
      byAction[rev.action] = (byAction[rev.action] ?? 0) + 1;
    }
    
    const day = rev.createdAt.toISOString().split("T")[0] ?? "unknown";
    byDay[day] = (byDay[day] ?? 0) + 1;
  }

  return {
    totalRevisions: recentRevisions.length,
    byEntityType,
    byAction,
    byDay,
  };
}

/**
 * Delete old revisions (cleanup).
 */
export async function cleanupOldRevisions(
  daysToKeep: number = 90,
  entityType?: string
): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const conditions = [sql`${revisions.createdAt} < ${cutoffDate}`];
  if (entityType) {
    conditions.push(eq(revisions.entityType, entityType));
  }

  // Keep at least the last 10 revisions per entity
  // This is a simplified cleanup - in production you'd want more sophisticated logic
  const result = await db.delete(revisions).where(and(...conditions));
  
  return result.rowCount ?? 0;
}

/**
 * Create a snapshot of an entity for revision tracking.
 */
export function createEntitySnapshot<T extends Record<string, unknown>>(
  entity: T,
  entityType: string,
  entityId: string
): Record<string, unknown> {
  // Clone and sanitize the entity
  const snapshot: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(entity)) {
    // Skip functions and circular references
    if (typeof value === "function") continue;
    
    // Convert dates to ISO strings for storage
    if (value instanceof Date) {
      snapshot[key] = value.toISOString();
    } else if (typeof value === "object" && value !== null) {
      try {
        snapshot[key] = JSON.parse(JSON.stringify(value));
      } catch {
        snapshot[key] = String(value);
      }
    } else {
      snapshot[key] = value;
    }
  }
  
  return snapshot;
}
