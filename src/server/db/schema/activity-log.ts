import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";

/**
 * Activity log for tracking all content changes in the CMS.
 * Stores who changed what, when, and the before/after state.
 */
export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Who made the change
  userId: uuid("user_id"),
  userEmail: text("user_email").notNull(),
  
  // What was changed
  action: text("action").notNull(), // 'create', 'update', 'delete', 'publish', 'unpublish', 'reorder'
  entityType: text("entity_type").notNull(), // 'project', 'experience', 'certification', 'resume', 'social_link', 'section', 'site_config'
  entityId: uuid("entity_id"),
  entityName: text("entity_name"), // Human-readable name of the entity
  
  // Change details
  changes: jsonb("changes"), // { field: { old: any, new: any } }
  
  // Metadata
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  
  // Timestamp
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
