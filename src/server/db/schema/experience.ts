import {
  pgTable,
  uuid,
  varchar,
  text,
  date,
  json,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const experiences = pgTable("experiences", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  roleTitle: varchar("role_title", { length: 255 }).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  description: text("description"),
  techStack: json("tech_stack").$type<string[]>().default([]),
  displayOrder: integer("display_order").default(0).notNull(),
  isVisible: boolean("is_visible").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
