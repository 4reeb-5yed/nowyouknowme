import { pgTable, uuid, varchar, text, boolean, json } from "drizzle-orm/pg-core";

export const siteConfig = pgTable("site_config", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Theme
  theme: varchar("theme", { length: 20 }).default("system").notNull(),
  accentColor: varchar("accent_color", { length: 7 })
    .default("#2563eb")
    .notNull(),
  
  // Hero Section
  heroTagline: text("hero_tagline").default("SOFTWARE ENGINEER").notNull(),
  heroHeadline: text("hero_headline").default("I build software that works.").notNull(),
  heroEmphasisWord: varchar("hero_emphasis_word", { length: 50 }).default("works"),
  heroSubhead: text("hero_subhead").default("").notNull(),
  heroShowResume: boolean("hero_show_resume").default(true),
  
  // Homepage Sections Visibility
  showFeaturedProjects: boolean("show_featured_projects").default(true),
  showExperience: boolean("show_experience").default(true),
  showSkills: boolean("show_skills").default(true),
  showAbout: boolean("show_about").default(true),
  showContact: boolean("show_contact").default(true),
  
  // SEO
  metaDescription: text("meta_description").default("").notNull(),
  ogImageUrl: varchar("og_image_url", { length: 500 }),
  
  // Footer
  footerCopyright: text("footer_copyright").default("").notNull(),
  footerTagline: text("footer_tagline").default("Built with passion.").notNull(),
  
  // Homepage Section Order (JSON array of section keys)
  sectionOrder: json("section_order").$type<string[]>().default([
    "hero", "featured-projects", "experience", "skills", "about", "contact"
  ]),
});
