import { z } from "zod";

/**
 * Schema for creating a new certification entry.
 * Validates all required and optional fields with appropriate constraints.
 */
export const certificationCreateSchema = z
  .object({
    certificationName: z.string().min(1).max(255),
    issuingOrganization: z.string().min(1).max(255),
    issueDate: z.iso.date(),
    expiryDate: z.iso.date().nullable().optional(),
    credentialId: z.string().max(255).nullable().optional(),
    credentialUrl: z.url().max(500).nullable().optional(),
    isVisible: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.expiryDate && data.issueDate) {
        return new Date(data.expiryDate) > new Date(data.issueDate);
      }
      return true;
    },
    {
      message: "Expiry date must be after issue date",
      path: ["expiryDate"],
    }
  );

/**
 * Schema for updating an existing certification entry.
 * All fields are optional except `id` which is required for identification.
 */
export const certificationUpdateSchema = z
  .object({
    id: z.uuid(),
    certificationName: z.string().min(1).max(255).optional(),
    issuingOrganization: z.string().min(1).max(255).optional(),
    issueDate: z.iso.date().optional(),
    expiryDate: z.iso.date().nullable().optional(),
    credentialId: z.string().max(255).nullable().optional(),
    credentialUrl: z.url().max(500).nullable().optional(),
    isVisible: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.expiryDate && data.issueDate) {
        return new Date(data.expiryDate) > new Date(data.issueDate);
      }
      return true;
    },
    {
      message: "Expiry date must be after issue date",
      path: ["expiryDate"],
    }
  );

/**
 * Schema for reordering certifications.
 * Accepts an array of objects with `id` and `displayOrder`.
 */
export const certificationReorderSchema = z.array(
  z.object({
    id: z.uuid(),
    displayOrder: z.number().int().min(0),
  })
);

/** Inferred type for certification creation input. */
export type CertificationCreateInput = z.infer<typeof certificationCreateSchema>;

/** Inferred type for certification update input. */
export type CertificationUpdateInput = z.infer<typeof certificationUpdateSchema>;

/** Inferred type for certification reorder input. */
export type CertificationReorderInput = z.infer<typeof certificationReorderSchema>;
