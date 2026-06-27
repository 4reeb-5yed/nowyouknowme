import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { experienceCreateSchema } from '@/lib/validators/experience';
import { certificationCreateSchema } from '@/lib/validators/certification';

/**
 * Feature: portfolio-web-app, Property 11: Date Range Invariant
 *
 * FOR ALL Experience entries where end_date is provided, THE Validation_Layer SHALL
 * reject the entry if start_date is after end_date. FOR ALL Certification entries
 * where expiry_date is provided, THE Validation_Layer SHALL reject the entry if
 * expiry_date is before issue_date.
 *
 * **Validates: Requirements 18.9, 19.9**
 */

/**
 * Generate an arbitrary ISO date string (YYYY-MM-DD) within a reasonable range.
 * We generate year, month, day separately to ensure valid calendar dates
 * and avoid timezone issues from fc.date().
 */
function arbIsoDateString() {
  return fc
    .record({
      year: fc.integer({ min: 1970, max: 2100 }),
      month: fc.integer({ min: 1, max: 12 }),
      day: fc.integer({ min: 1, max: 28 }), // Use 28 to avoid invalid days in short months
    })
    .map(({ year, month, day }) => {
      const m = String(month).padStart(2, '0');
      const d = String(day).padStart(2, '0');
      return `${year}-${m}-${d}`;
    });
}

/**
 * Generate a pair of ISO date strings where the first is strictly before the second.
 * Returns [earlierDate, laterDate].
 */
function arbOrderedDatePair() {
  return fc
    .record({
      year1: fc.integer({ min: 1970, max: 2099 }),
      month1: fc.integer({ min: 1, max: 12 }),
      day1: fc.integer({ min: 1, max: 28 }),
      // Add at least 1 day offset
      dayOffset: fc.integer({ min: 1, max: 365 }),
    })
    .map(({ year1, month1, day1, dayOffset }) => {
      const earlier = new Date(year1, month1 - 1, day1);
      const later = new Date(earlier.getTime() + dayOffset * 24 * 60 * 60 * 1000);

      const formatDate = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${dd}`;
      };

      return { earlier: formatDate(earlier), later: formatDate(later) };
    });
}

describe('Property 11: Date Range Invariant', () => {
  describe('Experience: startDate > endDate is always rejected', () => {
    it('rejects any experience where startDate is strictly after endDate', () => {
      fc.assert(
        fc.property(arbOrderedDatePair(), ({ earlier, later }) => {
          // Use later as startDate and earlier as endDate (invalid)
          const input = {
            companyName: 'Test Company',
            roleTitle: 'Test Role',
            startDate: later,
            endDate: earlier,
            techStack: [],
            isVisible: true,
          };

          const result = experienceCreateSchema.safeParse(input);
          expect(result.success).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('accepts any experience where startDate is strictly before endDate', () => {
      fc.assert(
        fc.property(arbOrderedDatePair(), ({ earlier, later }) => {
          // Use earlier as startDate and later as endDate (valid)
          const input = {
            companyName: 'Test Company',
            roleTitle: 'Test Role',
            startDate: earlier,
            endDate: later,
            techStack: [],
            isVisible: true,
          };

          const result = experienceCreateSchema.safeParse(input);
          expect(result.success).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Certification: expiryDate < issueDate is always rejected', () => {
    it('rejects any certification where expiryDate is strictly before issueDate', () => {
      fc.assert(
        fc.property(arbOrderedDatePair(), ({ earlier, later }) => {
          // Use later as issueDate and earlier as expiryDate (invalid)
          const input = {
            certificationName: 'Test Certification',
            issuingOrganization: 'Test Organization',
            issueDate: later,
            expiryDate: earlier,
            isVisible: true,
          };

          const result = certificationCreateSchema.safeParse(input);
          expect(result.success).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('accepts any certification where expiryDate is strictly after issueDate', () => {
      fc.assert(
        fc.property(arbOrderedDatePair(), ({ earlier, later }) => {
          // Use earlier as issueDate and later as expiryDate (valid)
          const input = {
            certificationName: 'Test Certification',
            issuingOrganization: 'Test Organization',
            issueDate: earlier,
            expiryDate: later,
            isVisible: true,
          };

          const result = certificationCreateSchema.safeParse(input);
          expect(result.success).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });
});
