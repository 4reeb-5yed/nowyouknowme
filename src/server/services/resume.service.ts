import { eq, desc } from "drizzle-orm";

import { db } from "@/server/db";
import { resumes } from "@/server/db/schema";

type ResumeSelect = typeof resumes.$inferSelect;

/**
 * Returns the currently active resume, or null if none is active.
 */
export async function getActive(): Promise<ResumeSelect | null> {
  const result = await db
    .select()
    .from(resumes)
    .where(eq(resumes.isActive, true))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Returns all resumes ordered by uploadedAt descending.
 * Used for admin views.
 */
export async function listAll(): Promise<ResumeSelect[]> {
  return db
    .select()
    .from(resumes)
    .orderBy(desc(resumes.uploadedAt));
}

/**
 * Creates a new resume record.
 * Deactivates all existing resumes first, then inserts the new one as active.
 */
export async function create(data: {
  userId: string;
  fileUrl: string;
}): Promise<ResumeSelect> {
  // Deactivate all existing resumes
  await db.update(resumes).set({ isActive: false });

  // Insert new resume as active
  const result = await db
    .insert(resumes)
    .values({
      userId: data.userId,
      fileUrl: data.fileUrl,
      isActive: true,
    })
    .returning();

  return result[0]!;
}

/**
 * Sets a specific resume as active.
 * Deactivates all resumes first, then activates the specified one.
 */
export async function setActive(id: string): Promise<ResumeSelect> {
  // Deactivate all resumes
  await db.update(resumes).set({ isActive: false });

  // Activate the specified resume
  const result = await db
    .update(resumes)
    .set({ isActive: true })
    .where(eq(resumes.id, id))
    .returning();

  return result[0]!;
}
