import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  json,
  boolean,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

export const projectCategoryEnum = pgEnum("project_category", [
  "cybersecurity",
  "cloud",
  "web",
  "other",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "draft",
  "published",
]);

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  longDescription: text("long_description"),
  techStack: json("tech_stack").$type<string[]>().default([]),
  category: projectCategoryEnum("category").notNull(),
  githubUrl: varchar("github_url", { length: 500 }),
  liveUrl: varchar("live_url", { length: 500 }),
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  isFeatured: boolean("is_featured").default(false).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  status: projectStatusEnum("status").default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
