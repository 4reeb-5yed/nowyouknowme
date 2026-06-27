import { eq } from "drizzle-orm";

import { db } from "@/server/db";
import { sections } from "@/server/db/schema";
import { sanitizeHtml } from "@/lib/sanitize";

type SectionSelect = typeof sections.$inferSelect;

/**
 * Returns a section by its key ('about', 'skills', 'contact'), or null if not found.
 */
export async function getSection(key: string): Promise<SectionSelect | null> {
  const result = await db
    .select()
    .from(sections)
    .where(eq(sections.key, key))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Updates the content for a section by key and sets updatedAt.
 * Applies basic HTML sanitization (strips <script> tags and on* attributes).
 * Returns the updated section, or null if the key does not exist.
 */
export async function updateSection(
  key: string,
  content: string
): Promise<SectionSelect | null> {
  const sanitizedContent = sanitizeHtml(content);

  const result = await db
    .update(sections)
    .set({
      content: sanitizedContent,
      updatedAt: new Date(),
    })
    .where(eq(sections.key, key))
    .returning();

  return result[0] ?? null;
}
