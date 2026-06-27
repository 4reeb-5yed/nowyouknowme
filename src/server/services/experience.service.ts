import { eq, desc, asc, sql } from "drizzle-orm";

import { db } from "@/server/db";
import { experiences } from "@/server/db/schema";

type ExperienceInsert = typeof experiences.$inferInsert;
type ExperienceSelect = typeof experiences.$inferSelect;

type ExperienceCreateInput = Omit<
  ExperienceInsert,
  "id" | "displayOrder" | "createdAt" | "updatedAt"
> & {
  displayOrder?: number;
};

type ExperienceUpdateInput = Partial<
  Omit<ExperienceInsert, "id" | "createdAt" | "updatedAt">
>;

/**
 * Returns the next display order value (max + 1).
 */
async function getNextDisplayOrder(): Promise<number> {
  const result = await db
    .select({ maxOrder: sql<number>`COALESCE(MAX(${experiences.displayOrder}), -1)` })
    .from(experiences);

  return (result[0]?.maxOrder ?? -1) + 1;
}

/**
 * Returns all visible experience entries sorted by startDate descending (most recent first).
 * Used for the public-facing timeline display.
 */
export async function listVisible(): Promise<ExperienceSelect[]> {
  return db
    .select()
    .from(experiences)
    .where(eq(experiences.isVisible, true))
    .orderBy(desc(experiences.startDate));
}

/**
 * Returns all experience entries ordered by displayOrder ascending.
 * Used for admin/CMS views.
 */
export async function listAll(): Promise<ExperienceSelect[]> {
  return db
    .select()
    .from(experiences)
    .orderBy(asc(experiences.displayOrder));
}

/**
 * Creates a new experience entry.
 * Sets displayOrder to max + 1 if not provided.
 */
export async function create(data: ExperienceCreateInput): Promise<ExperienceSelect> {
  const displayOrder = data.displayOrder ?? (await getNextDisplayOrder());

  const result = await db
    .insert(experiences)
    .values({
      ...data,
      displayOrder,
    })
    .returning();

  return result[0]!;
}

/**
 * Updates an existing experience entry by ID. Sets updatedAt to now.
 */
export async function update(
  id: string,
  data: ExperienceUpdateInput
): Promise<ExperienceSelect> {
  const result = await db
    .update(experiences)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(experiences.id, id))
    .returning();

  return result[0]!;
}

/**
 * Deletes an experience entry by ID.
 */
export async function deleteExperience(id: string): Promise<void> {
  await db.delete(experiences).where(eq(experiences.id, id));
}

/**
 * Batch updates displayOrder for multiple experience entries.
 * Each item contains an id and the new displayOrder value.
 */
export async function reorder(
  items: { id: string; displayOrder: number }[]
): Promise<void> {
  await Promise.all(
    items.map((item) =>
      db
        .update(experiences)
        .set({ displayOrder: item.displayOrder, updatedAt: new Date() })
        .where(eq(experiences.id, item.id))
    )
  );
}
