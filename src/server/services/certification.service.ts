import { eq, asc, sql } from "drizzle-orm";

import { db } from "@/server/db";
import { certifications } from "@/server/db/schema";

type CertificationInsert = typeof certifications.$inferInsert;
type CertificationSelect = typeof certifications.$inferSelect;

type CertificationCreateInput = Omit<
  CertificationInsert,
  "id" | "displayOrder" | "createdAt" | "updatedAt"
> & {
  displayOrder?: number;
};

type CertificationUpdateInput = Partial<
  Omit<CertificationInsert, "id" | "createdAt" | "updatedAt">
>;

/**
 * Returns the next display order value (max + 1).
 */
async function getNextDisplayOrder(): Promise<number> {
  const result = await db
    .select({ maxOrder: sql<number>`COALESCE(MAX(${certifications.displayOrder}), -1)` })
    .from(certifications);

  return (result[0]?.maxOrder ?? -1) + 1;
}

/**
 * Returns all visible certifications ordered by displayOrder ascending.
 */
export async function listVisible(): Promise<CertificationSelect[]> {
  return db
    .select()
    .from(certifications)
    .where(eq(certifications.isVisible, true))
    .orderBy(asc(certifications.displayOrder));
}

/**
 * Returns all certifications ordered by displayOrder ascending.
 * Used for admin views.
 */
export async function listAll(): Promise<CertificationSelect[]> {
  return db
    .select()
    .from(certifications)
    .orderBy(asc(certifications.displayOrder));
}

/**
 * Creates a new certification.
 * Sets displayOrder to max + 1 if not provided.
 */
export async function create(data: CertificationCreateInput): Promise<CertificationSelect> {
  const displayOrder = data.displayOrder ?? (await getNextDisplayOrder());

  const result = await db
    .insert(certifications)
    .values({
      ...data,
      displayOrder,
    })
    .returning();

  return result[0]!;
}

/**
 * Updates an existing certification by ID. Sets updatedAt to now.
 */
export async function update(
  id: string,
  data: CertificationUpdateInput
): Promise<CertificationSelect> {
  const result = await db
    .update(certifications)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(certifications.id, id))
    .returning();

  return result[0]!;
}

/**
 * Deletes a certification by ID.
 */
export async function deleteCertification(id: string): Promise<void> {
  await db.delete(certifications).where(eq(certifications.id, id));
}

/**
 * Updates displayOrder for multiple certifications in a batch.
 * Each item contains an id and the new displayOrder value.
 */
export async function reorder(
  items: { id: string; displayOrder: number }[]
): Promise<void> {
  await Promise.all(
    items.map((item) =>
      db
        .update(certifications)
        .set({ displayOrder: item.displayOrder, updatedAt: new Date() })
        .where(eq(certifications.id, item.id))
    )
  );
}
