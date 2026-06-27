import { eq, desc, asc, and, sql } from "drizzle-orm";

import { db } from "@/server/db";
import { projects } from "@/server/db/schema";
import { slugify } from "@/lib/utils";

type ProjectInsert = typeof projects.$inferInsert;
type ProjectSelect = typeof projects.$inferSelect;

type ProjectCreateInput = Omit<
  ProjectInsert,
  "id" | "slug" | "displayOrder" | "createdAt" | "updatedAt"
> & {
  slug?: string;
  displayOrder?: number;
};

type ProjectUpdateInput = Partial<
  Omit<ProjectInsert, "id" | "createdAt" | "updatedAt">
>;

/**
 * Generates a unique slug for a project.
 * If the base slug already exists, appends a numeric suffix (-1, -2, etc.)
 */
async function generateUniqueSlug(
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  let slug = baseSlug;
  let suffix = 0;

  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;

    const existing = await db
      .select({ id: projects.id })
      .from(projects)
      .where(
        excludeId
          ? and(eq(projects.slug, candidate), sql`${projects.id} != ${excludeId}`)
          : eq(projects.slug, candidate)
      )
      .limit(1);

    if (existing.length === 0) {
      return candidate;
    }

    suffix++;
  }
}

/**
 * Returns the next display order value (max + 1).
 */
async function getNextDisplayOrder(): Promise<number> {
  const result = await db
    .select({ maxOrder: sql<number>`COALESCE(MAX(${projects.displayOrder}), -1)` })
    .from(projects);

  return (result[0]?.maxOrder ?? -1) + 1;
}

/**
 * Returns all projects with status 'published', ordered by displayOrder ascending.
 */
export async function listPublished(): Promise<ProjectSelect[]> {
  return db
    .select()
    .from(projects)
    .where(eq(projects.status, "published"))
    .orderBy(asc(projects.displayOrder));
}

/**
 * Returns all projects (including drafts), ordered by displayOrder ascending.
 * Used for admin views.
 */
export async function listAll(): Promise<ProjectSelect[]> {
  return db
    .select()
    .from(projects)
    .orderBy(asc(projects.displayOrder));
}

/**
 * Returns a single published project by slug, or null if not found.
 */
export async function getBySlug(slug: string): Promise<ProjectSelect | null> {
  const result = await db
    .select()
    .from(projects)
    .where(and(eq(projects.slug, slug), eq(projects.status, "published")))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Creates a new project.
 * - Auto-generates slug from title if not provided
 * - Ensures slug uniqueness by appending numeric suffix if needed
 * - Sets displayOrder to max + 1
 */
export async function create(data: ProjectCreateInput): Promise<ProjectSelect> {
  const baseSlug = data.slug ?? slugify(data.title);
  const uniqueSlug = await generateUniqueSlug(baseSlug);
  const displayOrder = data.displayOrder ?? (await getNextDisplayOrder());

  const result = await db
    .insert(projects)
    .values({
      ...data,
      slug: uniqueSlug,
      displayOrder,
    })
    .returning();

  return result[0]!;
}

/**
 * Updates an existing project by ID. Sets updatedAt to now.
 * If slug is being updated, ensures uniqueness.
 */
export async function update(
  id: string,
  data: ProjectUpdateInput
): Promise<ProjectSelect> {
  let updateData = { ...data, updatedAt: new Date() };

  if (data.slug) {
    const uniqueSlug = await generateUniqueSlug(data.slug, id);
    updateData = { ...updateData, slug: uniqueSlug };
  }

  const result = await db
    .update(projects)
    .set(updateData)
    .where(eq(projects.id, id))
    .returning();

  return result[0]!;
}

/**
 * Deletes a project by ID.
 */
export async function deleteProject(id: string): Promise<void> {
  await db.delete(projects).where(eq(projects.id, id));
}

/**
 * Updates displayOrder for multiple projects in a batch.
 * Each item contains an id and the new displayOrder value.
 */
export async function reorder(
  items: { id: string; displayOrder: number }[]
): Promise<void> {
  // Execute all updates - Neon HTTP driver doesn't support traditional transactions,
  // but batch updates achieve the same result for reordering
  await Promise.all(
    items.map((item) =>
      db
        .update(projects)
        .set({ displayOrder: item.displayOrder, updatedAt: new Date() })
        .where(eq(projects.id, item.id))
    )
  );
}
