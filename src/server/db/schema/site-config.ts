import { pgTable, uuid, varchar, text } from "drizzle-orm/pg-core";

export const siteConfig = pgTable("site_config", {
  id: uuid("id").primaryKey().defaultRandom(),
  theme: varchar("theme", { length: 20 }).default("system").notNull(),
  accentColor: varchar("accent_color", { length: 7 })
    .default("#2563eb")
    .notNull(),
  heroTagline: text("hero_tagline").default("").notNull(),
  metaDescription: text("meta_description").default("").notNull(),
  ogImageUrl: varchar("og_image_url", { length: 500 }),
});
