import { pgTable, uuid, varchar, timestamp, boolean } from "drizzle-orm/pg-core";

// Future: Newsletter subscriber schema (stub)
export const subscribers = pgTable("subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});
