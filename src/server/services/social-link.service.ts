import { eq, asc, sql } from "drizzle-orm";

import { db } from "@/server/db";
import { socialLinks } from "@/server/db/schema";

type SocialLinkSelect = typeof socialLinks.$inferSelect;
type SocialLinkInsert = typeof socialLinks.$inferInsert;

type SocialLinkCreateInput = {
  platform: string;
  url: string;
  userId: string;
};

type SocialLinkUpdateInput = Partial<
  Pick<SocialLinkInsert, "platform" | "url" | "isVisible">
>;

/**
 * Returns the next display order value (max + 1).
 */
async function getNextDisplayOrder(): Promise<number> {
  const result = await db
    .select({
      maxOrder: sql<number>`COALESCE(MAX(${socialLinks.displayOrder}), -1)`,
    })
    .from(socialLinks);

  return (result[0]?.maxOrder ?? -1) + 1;
}

/**
 * Returns visible social links ordered by displayOrder ascending.
 */
export async function listVisible(): Promise<SocialLinkSelect[]> {
  return db
    .select()
    .from(socialLinks)
    .where(eq(socialLinks.isVisible, true))
    .orderBy(asc(socialLinks.displayOrder));
}

/**
 * Returns all social links ordered by displayOrder ascending.
 * Used for admin views.
 */
export async function listAll(): Promise<SocialLinkSelect[]> {
  return db
    .select()
    .from(socialLinks)
    .orderBy(asc(socialLinks.displayOrder));
}

/**
 * Creates a new social link.
 * Sets displayOrder to max + 1.
 */
export async function create(
  data: SocialLinkCreateInput
): Promise<SocialLinkSelect> {
  const displayOrder = await getNextDisplayOrder();

  const result = await db
    .insert(socialLinks)
    .values({
      platform: data.platform,
      url: data.url,
      userId: data.userId,
      displayOrder,
    })
    .returning();

  return result[0]!;
}

/**
 * Updates an existing social link by ID.
 */
export async function update(
  id: string,
  data: SocialLinkUpdateInput
): Promise<SocialLinkSelect> {
  const result = await db
    .update(socialLinks)
    .set(data)
    .where(eq(socialLinks.id, id))
    .returning();

  return result[0]!;
}

/**
 * Deletes a social link by ID.
 */
export async function deleteSocialLink(id: string): Promise<void> {
  await db.delete(socialLinks).where(eq(socialLinks.id, id));
}

/**
 * Batch updates displayOrder for multiple social links.
 * Each item contains an id and the new displayOrder value.
 */
export async function reorder(
  items: { id: string; displayOrder: number }[]
): Promise<void> {
  await Promise.all(
    items.map((item) =>
      db
        .update(socialLinks)
        .set({ displayOrder: item.displayOrder })
        .where(eq(socialLinks.id, item.id))
    )
  );
}
