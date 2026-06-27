import { eq } from "drizzle-orm";

import { db } from "@/server/db";
import { siteConfig } from "@/server/db/schema";

type SiteConfigSelect = typeof siteConfig.$inferSelect;

export type SiteConfigUpdateInput = Partial<{
  theme: string;
  accentColor: string;
  heroTagline: string;
  metaDescription: string;
  ogImageUrl: string | null;
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
