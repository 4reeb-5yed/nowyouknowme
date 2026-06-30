import { pgTable, uuid, text, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";

/**
 * Revision history for tracking content changes.
 * Stores snapshots of entity state before modifications, enabling rollback.
 */
export const revisions = pgTable("revisions", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Entity being revised
  entityType: varchar("entity_type", { length: 50 }).notNull(), // 'project', 'experience', 'certification', 'section', 'site_config', 'social_link'
  entityId: uuid("entity_id").notNull(),
  
  // Revision metadata
  action: varchar("action", { length: 20 }).notNull(), // 'create', 'update', 'delete', 'publish', 'unpublish'
  
  // Who made the change
  userId: uuid("user_id"),
  userEmail: text("user_email").notNull(),
  
  // Snapshot of entity state before the change
  snapshot: jsonb("snapshot").notNull(), // Complete entity state at time of revision
  
  // Optional description of changes
  description: text("description"),
  
  // Timestamp
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Revision = typeof revisions.$inferSelect;
export type NewRevision = typeof revisions.$inferInsert;
