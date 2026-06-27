import { describe, it } from 'vitest';
import fc from 'fast-check';
import { projectCreateSchema, projectCategories, projectStatuses } from '@/lib/validators/project';
import { experienceCreateSchema } from '@/lib/validators/experience';
import { certificationCreateSchema } from '@/lib/validators/certification';
import { contactFormSchema } from '@/lib/validators/contact';

/**
 * Property 6: Input Validation Round-Trip
 *
 * FOR ALL valid inputs accepted by client-side Zod schemas, THE server-side validation
 * using the same schema SHALL also accept the input (consistency between client and server validation).
 *
 * Since schemas are shared between client and server, we verify that any generated valid input
 * always passes parsing successfully — the round-trip property.
 *
 * Validates: Requirements 2.7, 8.4, 18.8, 19.8
 */

// --- Arbitraries ---

/** Generate a valid slug: lowercase letters, numbers, and hyphens, at least 1 char */
const slugArb = fc.stringMatching(/^[a-z0-9][a-z0-9-]{0,49}$/);

/** Generate a valid URL string */
const urlArb = fc.webUrl({ validSchemes: ['https'] });

/** Generate a non-empty string (1-100 chars) that isn't all whitespace */
const nonEmptyStringArb = fc.stringMatching(/^[A-Za-z0-9 ._-]{1,100}$/).filter((s) => s.trim().length > 0);

/** Generate a valid project category */
const categoryArb = fc.constantFrom(...projectCategories);

/** Generate a valid project status */
const statusArb = fc.constantFrom(...projectStatuses);

/**
 * Generate a valid email address that conforms to Zod's .email() validator.
 * Uses simple alphanumeric local part + common domain format.
 */
const zodEmailArb = fc
  .tuple(
    fc.stringMatching(/^[a-z][a-z0-9]{0,15}$/),
    fc.stringMatching(/^[a-z][a-z0-9]{1,10}$/),
    fc.constantFrom('com', 'org', 'net', 'io', 'dev')
  )
  .map(([local, domain, tld]) => `${local}@${domain}.${tld}`);

/** Generate valid project creation input */
const projectCreateArb = fc.record({
  title: nonEmptyStringArb,
  slug: fc.option(slugArb, { nil: undefined }),
  description: nonEmptyStringArb,
  longDescription: fc.option(fc.string({ minLength: 0, maxLength: 200 }), { nil: undefined }),
  techStack: fc.array(fc.stringMatching(/^[A-Za-z0-9.# +]{1,30}$/), { maxLength: 10 }),
  category: categoryArb,
  githubUrl: fc.option(fc.oneof(urlArb, fc.constant(null)), { nil: undefined }),
  liveUrl: fc.option(fc.oneof(urlArb, fc.constant(null)), { nil: undefined }),
  thumbnailUrl: fc.option(fc.oneof(urlArb, fc.constant(null)), { nil: undefined }),
  isFeatured: fc.boolean(),
  status: statusArb,
});

/**
 * Generate a pair of ISO date strings where end > start.
 * Uses integer-based year/month/day generation for reliability.
 */
const datePairArb = fc
  .tuple(
    fc.integer({ min: 1980, max: 2080 }),
    fc.integer({ min: 1, max: 12 }),
    fc.integer({ min: 1, max: 28 }),
    fc.integer({ min: 1, max: 3650 }) // days offset for end date
  )
  .map(([year, month, day, offsetDays]) => {
    const startDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const endMs = new Date(startDate).getTime() + offsetDays * 86400000;
    const endD = new Date(endMs);
    const endDate = `${endD.getFullYear()}-${String(endD.getMonth() + 1).padStart(2, '0')}-${String(endD.getDate()).padStart(2, '0')}`;
    return { startDate, endDate };
  });

/** Generate valid experience creation input (with valid date ordering) */
const experienceCreateArb = fc
  .tuple(
    nonEmptyStringArb,
    nonEmptyStringArb,
    datePairArb,
    fc.boolean(), // hasEndDate
    fc.option(fc.oneof(fc.string({ minLength: 0, maxLength: 200 }), fc.constant(null)), { nil: undefined }),
    fc.array(fc.stringMatching(/^[A-Za-z0-9.# +]{1,30}$/), { maxLength: 10 }),
    fc.boolean(),
  )
  .map(([companyName, roleTitle, dates, hasEndDate, description, techStack, isVisible]) => ({
    companyName,
    roleTitle,
    startDate: dates.startDate,
    endDate: hasEndDate ? dates.endDate : null,
    description,
    techStack,
    isVisible,
  }));

/** Generate valid certification creation input (with valid date ordering) */
const certificationCreateArb = fc
  .tuple(
    nonEmptyStringArb,
    nonEmptyStringArb,
    datePairArb,
    fc.boolean(), // hasExpiryDate
    fc.option(
      fc.oneof(fc.stringMatching(/^[A-Za-z0-9-]{1,50}$/), fc.constant(null)),
      { nil: undefined }
    ),
    fc.option(
      fc.oneof(urlArb, fc.constant(null)),
      { nil: undefined }
    ),
    fc.boolean(),
  )
  .map(([certificationName, issuingOrganization, dates, hasExpiryDate, credentialId, credentialUrl, isVisible]) => ({
    certificationName,
    issuingOrganization,
    issueDate: dates.startDate,
    expiryDate: hasExpiryDate ? dates.endDate : null,
    credentialId,
    credentialUrl,
    isVisible,
  }));

/** Generate valid contact form input */
const contactFormArb = fc.record({
  name: nonEmptyStringArb,
  email: zodEmailArb,
  message: fc.stringMatching(/^[A-Za-z0-9 .,!?;:'"()-]{10,200}$/),
});

// --- Property Tests ---

describe('Property 6: Input Validation Round-Trip', () => {
  /**
   * **Validates: Requirements 2.7**
   * Any valid project input conforming to schema constraints should always pass validation.
   */
  it('project schema always accepts valid generated inputs', () => {
    fc.assert(
      fc.property(projectCreateArb, (input) => {
        const result = projectCreateSchema.safeParse(input);
        return result.success === true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 18.8**
   * Any valid experience input conforming to schema constraints should always pass validation.
   */
  it('experience schema always accepts valid generated inputs', () => {
    fc.assert(
      fc.property(experienceCreateArb, (input) => {
        const result = experienceCreateSchema.safeParse(input);
        return result.success === true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 19.8**
   * Any valid certification input conforming to schema constraints should always pass validation.
   */
  it('certification schema always accepts valid generated inputs', () => {
    fc.assert(
      fc.property(certificationCreateArb, (input) => {
        const result = certificationCreateSchema.safeParse(input);
        return result.success === true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 8.4**
   * Any valid contact form input conforming to schema constraints should always pass validation.
   */
  it('contact form schema always accepts valid generated inputs', () => {
    fc.assert(
      fc.property(contactFormArb, (input) => {
        const result = contactFormSchema.safeParse(input);
        return result.success === true;
      }),
      { numRuns: 100 }
    );
  });
});
