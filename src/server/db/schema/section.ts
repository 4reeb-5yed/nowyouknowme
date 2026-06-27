import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const sections = pgTable("sections", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: varchar("key", { length: 50 }).notNull().unique(),
  content: text("content").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
