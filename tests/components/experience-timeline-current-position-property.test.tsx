import { describe, it } from 'vitest';
import fc from 'fast-check';
import { render, screen, cleanup } from '@testing-library/react';
import {
  ExperienceTimeline,
  type Experience,
} from '@/components/public/experience-timeline';

/**
 * Feature: portfolio-web-app, Property 13: Current Position Display
 *
 * FOR ALL Experience entries where end_date is null, THE Public_Site rendering
 * layer SHALL display "Present" as the end date text in the timeline view.
 *
 * **Validates: Requirements 18.7**
 */

/**
 * Generates an arbitrary valid ISO date string (YYYY-MM-DD). Days are capped at
 * 28 to avoid invalid calendar dates in shorter months.
 */
function arbIsoDateString() {
  return fc
    .record({
      year: fc.integer({ min: 1970, max: 2100 }),
      month: fc.integer({ min: 1, max: 12 }),
      day: fc.integer({ min: 1, max: 28 }),
    })
    .map(({ year, month, day }) => {
      const m = String(month).padStart(2, '0');
      const d = String(day).padStart(2, '0');
      return `${year}-${m}-${d}`;
    });
}

/**
 * Generates an arbitrary current-position Experience entry: a fully-populated
 * record whose endDate is always null (the defining condition of Property 13).
 */
function arbCurrentPositionExperience() {
  return fc.record({
    id: fc.uuid(),
    companyName: fc.string({ minLength: 1, maxLength: 60 }),
    roleTitle: fc.string({ minLength: 1, maxLength: 60 }),
    startDate: arbIsoDateString(),
    endDate: fc.constant(null),
    description: fc.option(fc.string({ maxLength: 200 }), { nil: null }),
    techStack: fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
      maxLength: 6,
    }),
    displayOrder: fc.integer({ min: 0, max: 1000 }),
    isVisible: fc.constant(true),
  }) satisfies fc.Arbitrary<Experience>;
}

describe('Property 13: Current Position Display', () => {
  it('renders "Present" for every entry whose end_date is null', () => {
    fc.assert(
      fc.property(
        // Generate a non-empty list of current-position entries with unique ids
        // so React keys stay stable across the rendered list.
        fc
          .uniqueArray(arbCurrentPositionExperience(), {
            minLength: 1,
            maxLength: 5,
            selector: (e) => e.id,
          }),
        (experiences) => {
          try {
            render(<ExperienceTimeline experiences={experiences} />);

            // Every current position must surface "Present" exactly once, so the
            // count of "Present" occurrences equals the number of entries.
            const present = screen.getAllByText(/Present/);
            return present.length === experiences.length;
          } finally {
            // Tear down between property runs to keep the DOM isolated.
            cleanup();
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
