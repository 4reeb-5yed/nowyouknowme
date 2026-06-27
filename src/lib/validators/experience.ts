import { z } from "zod";

/**
 * ISO date string format validation (YYYY-MM-DD).
 */
const isoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be a valid ISO date (YYYY-MM-DD)");

/**
 * Schema for creating a new experience entry.
 * Validates: Requirements 18.8, 18.9
 */
export const experienceCreateSchema = z
  .object({
    companyName: z.string().min(1, "Company name is required").max(255),
    roleTitle: z.string().min(1, "Role title is required").max(255),
    startDate: isoDateString,
    endDate: isoDateString.nullable().optional(),
    description: z.string().nullable().optional(),
    techStack: z.array(z.string()).default([]),
    isVisible: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.endDate) {
        return new Date(data.endDate) > new Date(data.startDate);
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

/**
 * Schema for updating an existing experience entry.
 * All fields are optional except the required `id`.
 */
export const experienceUpdateSchema = z
  .object({
    id: z.string().uuid("Invalid experience ID"),
    companyName: z.string().min(1, "Company name is required").max(255).optional(),
    roleTitle: z.string().min(1, "Role title is required").max(255).optional(),
    startDate: isoDateString.optional(),
    endDate: isoDateString.nullable().optional(),
    description: z.string().nullable().optional(),
    techStack: z.array(z.string()).optional(),
    isVisible: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.endDate && data.startDate) {
        return new Date(data.endDate) > new Date(data.startDate);
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

/**
 * Schema for reordering experience entries.
 * Accepts an array of { id, displayOrder } pairs.
 */
export const experienceReorderSchema = z.array(
  z.object({
    id: z.string().uuid("Invalid experience ID"),
    displayOrder: z.number().int("Display order must be an integer"),
  })
);

// Inferred types
export type ExperienceCreateInput = z.infer<typeof experienceCreateSchema>;
export type ExperienceUpdateInput = z.infer<typeof experienceUpdateSchema>;
export type ExperienceReorderInput = z.infer<typeof experienceReorderSchema>;
