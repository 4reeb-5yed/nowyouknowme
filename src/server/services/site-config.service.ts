import { eq } from "drizzle-orm";

import { db } from "@/server/db";
import { siteConfig } from "@/server/db/schema";

type SiteConfigSelect = typeof siteConfig.$inferSelect;

export type SiteConfigUpdateInput = Partial<SiteConfigSelect>;

const DEFAULT_CONFIG = {
  theme: "system" as const,
  accentColor: "#2563eb",
  heroTagline: "SOFTWARE ENGINEER",
  heroHeadline: "I build software that works.",
  heroEmphasisWord: "works",
  heroSubhead: "",
  heroShowResume: true,
  showFeaturedProjects: true,
  showExperience: true,
  showSkills: true,
  showAbout: true,
  showContact: true,
  metaDescription: "",
  ogImageUrl: null as string | null,
  footerCopyright: "",
  footerTagline: "Built with passion.",
  sectionOrder: ["hero", "featured-projects", "experience", "skills", "about", "contact"],
};

/**
 * Returns the current site configuration (single-row table).
 * Creates a default row if none exists.
 */
export async function getConfig(): Promise<SiteConfigSelect> {
  try {
    const result = await db.select().from(siteConfig).limit(1);
    
    if (result[0]) {
      return result[0];
    }
    
    // No config exists - create default
    console.log("[site-config] No config found, creating default...");
    const insertResult = await db.insert(siteConfig).values(DEFAULT_CONFIG).returning();
    
    if (insertResult[0]) {
      return insertResult[0];
    }
    
    throw new Error("Failed to create config");
  } catch (error) {
    console.error("[site-config] Error fetching config:", error);
    // Return defaults on error to prevent crashes
    return {
      id: "default",
      ...DEFAULT_CONFIG,
    } as SiteConfigSelect;
  }
}

/**
 * Updates the site configuration record.
 * Creates a new row if none exists.
 */
export async function updateConfig(
  data: SiteConfigUpdateInput
): Promise<SiteConfigSelect> {
  try {
    const existing = await getConfig();
    
    const result = await db
      .update(siteConfig)
      .set(data)
      .where(eq(siteConfig.id, existing.id))
      .returning();

    if (result[0]) {
      return result[0];
    }
    
    // If no result, return merged data
    return { ...existing, ...data } as SiteConfigSelect;
  } catch (error) {
    console.error("[site-config] Error updating config:", error);
    throw error;
  }
}
