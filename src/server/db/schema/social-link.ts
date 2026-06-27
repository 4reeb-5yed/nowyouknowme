import {
  pgTable,
  uuid,
  varchar,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { users } from "./user";

export const socialLinks = pgTable("social_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  platform: varchar("platform", { length: 100 }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  isVisible: boolean("is_visible").default(true).notNull(),
});
