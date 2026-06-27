import { z } from "zod";

/**
 * Valid project categories
 */
export const projectCategories = [
  "cybersecurity",
  "cloud",
  "web",
  "other",
] as const;

/**
 * Valid project statuses
 */
export const projectStatuses = ["draft", "published"] as const;

/**
 * Schema for creating a new project.
 * - title: required, 1–255 chars
 * - slug: optional (auto-generated from title if omitted), lowercase alphanumeric + hyphens
 * - description: required, min 1 char
 * - longDescription: optional
 * - techStack: array of strings, defaults to []
 * - category: one of the project category enum values
 * - githubUrl, liveUrl, thumbnailUrl: optional nullable URLs
 * - isFeatured: boolean, defaults to false
 * - status: draft or published, defaults to 'draft'
 */
export const projectCreateSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    .optional(),
  description: z.string().min(1),
  longDescription: z.string().optional(),
  techStack: z.array(z.string()).default([]),
  category: z.enum(projectCategories),
  githubUrl: z.url().optional().nullable(),
  liveUrl: z.url().optional().nullable(),
  thumbnailUrl: z.url().optional().nullable(),
  isFeatured: z.boolean().default(false),
  status: z.enum(projectStatuses).default("draft"),
});

/**
 * Schema for updating an existing project.
 * All fields from create are optional; `id` is required.
 */
export const projectUpdateSchema = projectCreateSchema.partial().extend({
  id: z.string().min(1),
});

/**
 * Schema for reordering projects.
 * An array of { id, displayOrder } pairs.
 */
export const projectReorderSchema = z.array(
  z.object({
    id: z.string().min(1),
    displayOrder: z.number().int().min(0),
  })
);

// Inferred types for use across the codebase
export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
export type ProjectReorderInput = z.infer<typeof projectReorderSchema>;
