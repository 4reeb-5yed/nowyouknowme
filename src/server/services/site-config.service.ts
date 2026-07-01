import { eq } from "drizzle-orm";

import { db } from "@/server/db";
import { siteConfig } from "@/server/db/schema";

type SiteConfigSelect = typeof siteConfig.$inferSelect;

export type SiteConfigUpdateInput = Partial<{
  // Theme
  theme: string;
  accentColor: string;
  
  // Hero Section
  heroTagline: string;
  heroHeadline: string;
  heroEmphasisWord: string;
  heroSubhead: string;
  heroShowResume: boolean;
  
  // Homepage Sections Visibility
  showFeaturedProjects: boolean;
  showExperience: boolean;
  showSkills: boolean;
  showAbout: boolean;
  showContact: boolean;
  
  // SEO
  metaDescription: string;
  ogImageUrl: string | null;
  
  // Footer
  footerCopyright: string;
  footerTagline: string;
  
  // Section Order
  sectionOrder: string[];
}>;

/**
 * Returns the current site configuration (single-row table).
 * Returns null if no config row exists yet.
 */
export async function getConfig(): Promise<SiteConfigSelect | null> {
  const result = await db.select().from(siteConfig).limit(1);

  return result[0] ?? null;
}

/**
 * Updates the site configuration record.
 * Finds the first (and only) row and applies the partial update.
 * Returns the updated config, or null if no config row exists.
 */
export async function updateConfig(
  data: SiteConfigUpdateInput
): Promise<SiteConfigSelect | null> {
  // Get the existing config row
  const existing = await getConfig();
  if (!existing) {
    return null;
  }

  const result = await db
    .update(siteConfig)
    .set(data)
    .where(eq(siteConfig.id, existing.id))
    .returning();

  return result[0] ?? null;
}
