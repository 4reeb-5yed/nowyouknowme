import { eq, sql } from "drizzle-orm";

import { db } from "@/server/db";
import { siteConfig } from "@/server/db/schema";

// Extended config type that includes all fields
export interface SiteConfigData {
  // Core config (in DB)
  id: string;
  theme: string;
  accentColor: string;
  heroTagline: string;
  metaDescription: string;
  ogImageUrl: string | null;
  
  // Extended config (stored in JSONB extra_config column)
  heroHeadline?: string;
  heroEmphasisWord?: string;
  heroSubhead?: string;
  heroShowResume?: boolean;
  showFeaturedProjects?: boolean;
  showExperience?: boolean;
  showSkills?: boolean;
  showAbout?: boolean;
  showContact?: boolean;
  footerCopyright?: string;
  footerTagline?: string;
  sectionOrder?: string[];
}

export type SiteConfigUpdateInput = Partial<SiteConfigData>;

const DEFAULT_EXTRA_CONFIG = {
  heroHeadline: "I build software that works.",
  heroEmphasisWord: "works",
  heroSubhead: "",
  heroShowResume: true,
  showFeaturedProjects: true,
  showExperience: true,
  showSkills: true,
  showAbout: true,
  showContact: true,
  footerCopyright: "",
  footerTagline: "Built with passion.",
  sectionOrder: ["hero", "featured-projects", "experience", "skills", "about", "contact"],
};

/**
 * Returns the full site configuration by combining DB columns with extra_config JSONB.
 * Creates a default row if none exists.
 */
export async function getConfig(): Promise<SiteConfigData> {
  try {
    // First, ensure the extra_config column exists
    await ensureExtraConfigColumn();
    
    const result = await db.select().from(siteConfig).limit(1);
    
    if (result[0]) {
      const row = result[0];
      // Parse extra_config from the row
      const extraConfig = (row as Record<string, unknown>).extra_config 
        ? JSON.parse(String((row as Record<string, unknown>).extra_config)) 
        : {};
      
      return {
        id: row.id,
        theme: row.theme ?? "system",
        accentColor: row.accentColor ?? "#2563eb",
        heroTagline: row.heroTagline ?? "",
        metaDescription: row.metaDescription ?? "",
        ogImageUrl: row.ogImageUrl,
        ...DEFAULT_EXTRA_CONFIG,
        ...extraConfig,
      };
    }
    
    // No config exists - create default
    console.log("[site-config] No config found, creating default...");
    await db.insert(siteConfig).values({
      theme: "system",
      accentColor: "#2563eb",
      heroTagline: "SOFTWARE ENGINEER",
      metaDescription: "",
    });
    
    // Fetch and return the created config
    const newResult = await db.select().from(siteConfig).limit(1);
    if (newResult[0]) {
      const row = newResult[0];
      return {
        id: row.id,
        theme: row.theme,
        accentColor: row.accentColor,
        heroTagline: row.heroTagline,
        metaDescription: row.metaDescription,
        ogImageUrl: row.ogImageUrl,
        ...DEFAULT_EXTRA_CONFIG,
      };
    }
    
    throw new Error("Failed to create config");
  } catch (error) {
    console.error("[site-config] Error fetching config:", error);
    // Return defaults on error
    return {
      id: "default",
      theme: "system",
      accentColor: "#2563eb",
      heroTagline: "SOFTWARE ENGINEER",
      metaDescription: "",
      ogImageUrl: null,
      ...DEFAULT_EXTRA_CONFIG,
    };
  }
}

/**
 * Ensure the extra_config JSONB column exists in the site_config table.
 */
async function ensureExtraConfigColumn(): Promise<void> {
  try {
    await db.execute(sql`
      ALTER TABLE site_config 
      ADD COLUMN IF NOT EXISTS extra_config jsonb DEFAULT '{}'::jsonb
    `);
  } catch {
    // Column might already exist, ignore error
  }
}

/**
 * Updates the site configuration record.
 */
export async function updateConfig(
  data: SiteConfigUpdateInput
): Promise<SiteConfigData> {
  try {
    const existing = await getConfig();
    
    // Separate core fields from extended fields
    const coreFields: Record<string, unknown> = {};
    const extraConfig: Record<string, unknown> = {};
    
    if (data.theme !== undefined) coreFields.theme = data.theme;
    if (data.accentColor !== undefined) coreFields.accentColor = data.accentColor;
    if (data.heroTagline !== undefined) coreFields.heroTagline = data.heroTagline;
    if (data.metaDescription !== undefined) coreFields.metaDescription = data.metaDescription;
    if (data.ogImageUrl !== undefined) coreFields.ogImageUrl = data.ogImageUrl;
    
    // Extended fields go to extra_config
    if (data.heroHeadline !== undefined) extraConfig.heroHeadline = data.heroHeadline;
    if (data.heroEmphasisWord !== undefined) extraConfig.heroEmphasisWord = data.heroEmphasisWord;
    if (data.heroSubhead !== undefined) extraConfig.heroSubhead = data.heroSubhead;
    if (data.heroShowResume !== undefined) extraConfig.heroShowResume = data.heroShowResume;
    if (data.showFeaturedProjects !== undefined) extraConfig.showFeaturedProjects = data.showFeaturedProjects;
    if (data.showExperience !== undefined) extraConfig.showExperience = data.showExperience;
    if (data.showSkills !== undefined) extraConfig.showSkills = data.showSkills;
    if (data.showAbout !== undefined) extraConfig.showAbout = data.showAbout;
    if (data.showContact !== undefined) extraConfig.showContact = data.showContact;
    if (data.footerCopyright !== undefined) extraConfig.footerCopyright = data.footerCopyright;
    if (data.footerTagline !== undefined) extraConfig.footerTagline = data.footerTagline;
    if (data.sectionOrder !== undefined) extraConfig.sectionOrder = data.sectionOrder;
    
    // Merge extra_config with existing
    const currentExtra = {
      ...DEFAULT_EXTRA_CONFIG,
      ...extraConfig,
    };
    
    // Update core fields
    if (Object.keys(coreFields).length > 0) {
      await db
        .update(siteConfig)
        .set({ ...coreFields, extraConfig: JSON.stringify(currentExtra) } as Record<string, unknown>)
        .where(eq(siteConfig.id, existing.id));
    } else {
      // Just update extra_config
      await db.execute(sql`
        UPDATE site_config 
        SET extra_config = ${JSON.stringify(currentExtra)}
        WHERE id = ${existing.id}
      `);
    }
    
    // Return updated config
    return { ...existing, ...data };
  } catch (error) {
    console.error("[site-config] Error updating config:", error);
    throw error;
  }
}
