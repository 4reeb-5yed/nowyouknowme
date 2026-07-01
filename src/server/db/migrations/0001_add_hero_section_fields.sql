-- Migration: Add new columns to site_config for enhanced CMS functionality
-- Run this migration to extend the site_config table with hero, visibility, and footer fields

ALTER TABLE "site_config" ADD COLUMN IF NOT EXISTS "hero_headline" text DEFAULT 'I build software that works.' NOT NULL;
ALTER TABLE "site_config" ADD COLUMN IF NOT EXISTS "hero_emphasis_word" varchar(50) DEFAULT 'works';
ALTER TABLE "site_config" ADD COLUMN IF NOT EXISTS "hero_subhead" text DEFAULT '' NOT NULL;
ALTER TABLE "site_config" ADD COLUMN IF NOT EXISTS "hero_show_resume" boolean DEFAULT true NOT NULL;
ALTER TABLE "site_config" ADD COLUMN IF NOT EXISTS "show_featured_projects" boolean DEFAULT true NOT NULL;
ALTER TABLE "site_config" ADD COLUMN IF NOT EXISTS "show_experience" boolean DEFAULT true NOT NULL;
ALTER TABLE "site_config" ADD COLUMN IF NOT EXISTS "show_skills" boolean DEFAULT true NOT NULL;
ALTER TABLE "site_config" ADD COLUMN IF NOT EXISTS "show_about" boolean DEFAULT true NOT NULL;
ALTER TABLE "site_config" ADD COLUMN IF NOT EXISTS "show_contact" boolean DEFAULT true NOT NULL;
ALTER TABLE "site_config" ADD COLUMN IF NOT EXISTS "footer_copyright" text DEFAULT '' NOT NULL;
ALTER TABLE "site_config" ADD COLUMN IF NOT EXISTS "footer_tagline" text DEFAULT 'Built with passion.' NOT NULL;
ALTER TABLE "site_config" ADD COLUMN IF NOT EXISTS "section_order" jsonb DEFAULT '["hero", "featured-projects", "experience", "skills", "about", "contact"]' NOT NULL;
