import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';

/**
 * Property 2: Display Order Consistency
 *
 * FOR ALL reorder operations on Projects, Social_Links, Experiences, or Certifications,
 * THE service layer SHALL produce a valid permutation where each item has a unique
 * display_order value with no gaps, and the total count of items remains unchanged
 * after reordering.
 *
 * Validates: Requirements 2.6, 5.3, 18.4, 19.4
 *
 * Modeling approach
 * -----------------
 * A reorder begins with an arbitrary set of items (each holding an arbitrary initial
 * display_order, possibly with duplicates or gaps) and a new visual ordering chosen by
 * the Owner via drag-and-drop. The canonical reorder reindexes the new ordering to
 * sequential display_order values (0, 1, 2, ...) and persists them through the service's
 * `reorder` batch update. We exercise the real service `reorder` functions against an
 * in-memory store that captures the persisted updates, then assert the resulting state
 * satisfies the property: unique display_order values, no gaps, unchanged item count.
 */

// ─── In-memory store shared with the mocked db.update chain ─────────────────

interface StoreEntry {
  displayOrder: number;
}

let store: Map<string, StoreEntry> = new Map();

const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockDelete = vi.fn();
const mockUpdate = vi.fn();

vi.mock('@/server/db', () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
    insert: (...args: unknown[]) => mockInsert(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));

// Mock drizzle-orm operators. `eq(col, val)` exposes `val` so the update chain can
// resolve which record (by id) is being written.
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((col, val) => ({ type: 'eq', col, val })),
  asc: vi.fn((col) => ({ type: 'asc', col })),
  desc: vi.fn((col) => ({ type: 'desc', col })),
  and: vi.fn((...args) => ({ type: 'and', args })),
  sql: Object.assign(vi.fn(), { raw: vi.fn() }),
}));

// Mock the schema module — only the `.id` column is needed for reorder.
vi.mock('@/server/db/schema', () => ({
  projects: { id: 'projects.id', displayOrder: 'projects.displayOrder' },
  socialLinks: { id: 'socialLinks.id', displayOrder: 'socialLinks.displayOrder' },
  experiences: { id: 'experiences.id', displayOrder: 'experiences.displayOrder' },
  certifications: { id: 'certifications.id', displayOrder: 'certifications.displayOrder' },
}));

import { reorder as reorderProjects } from '@/server/services/project.service';
import { reorder as reorderSocialLinks } from '@/server/services/social-link.service';
import { reorder as reorderExperiences } from '@/server/services/experience.service';
import { reorder as reorderCertifications } from '@/server/services/certification.service';

type ReorderFn = (items: { id: string; displayOrder: number }[]) => Promise<void>;

const reorderServices: Record<string, ReorderFn> = {
  projects: reorderProjects,
  socialLinks: reorderSocialLinks,
  experiences: reorderExperiences,
  certifications: reorderCertifications,
};

beforeEach(() => {
  vi.clearAllMocks();
  store = new Map();

  // db.update(table).set({ displayOrder, ... }).where(eq(table.id, id))
  // The `where` clause carries the target id via the mocked `eq` operator's `val`.
  mockUpdate.mockImplementation(() => ({
    set: (values: { displayOrder: number }) => ({
      where: (condition: { val: string }) => {
        const entry = store.get(condition.val);
        if (entry) {
          entry.displayOrder = values.displayOrder;
        }
        return Promise.resolve();
      },
    }),
  }));
});

// ─── Arbitraries ─────────────────────────────────────────────────────────

/**
 * Generates a reorder scenario:
 * - `ids`: N unique item ids
 * - `initialOrders`: arbitrary starting display_order per id (may contain dups/gaps)
 * - `permKeys`: sort keys used to derive an arbitrary new visual ordering of the ids
 */
const scenarioArb = fc.integer({ min: 1, max: 25 }).chain((n) =>
  fc.record({
    ids: fc.constant(Array.from({ length: n }, (_, i) => `item-${i}`)),
    initialOrders: fc.array(fc.integer({ min: -100, max: 100 }), {
      minLength: n,
      maxLength: n,
    }),
    permKeys: fc.array(fc.double({ min: 0, max: 1, noNaN: true }), {
      minLength: n,
      maxLength: n,
    }),
  })
);

/** Derive an arbitrary permutation of ids by sorting on the generated keys. */
function newOrdering(ids: string[], permKeys: number[]): string[] {
  return ids
    .map((id, i) => ({ id, key: permKeys[i]!, i }))
    .sort((a, b) => (a.key === b.key ? a.i - b.i : a.key - b.key))
    .map((o) => o.id);
}

describe('Property 2: Display Order Consistency', () => {
  for (const [entity, reorderFn] of Object.entries(reorderServices)) {
    /**
     * **Validates: Requirements 2.6, 5.3, 18.4, 19.4**
     */
    it(`${entity}.reorder yields unique, gapless display_order with unchanged count`, async () => {
      await fc.assert(
        fc.asyncProperty(scenarioArb, async ({ ids, initialOrders, permKeys }) => {
          // Seed the store with the arbitrary initial state.
          store = new Map(ids.map((id, i) => [id, { displayOrder: initialOrders[i]! }]));
          const countBefore = store.size;

          // Canonical reorder: reindex the new visual ordering to 0..N-1.
          const ordering = newOrdering(ids, permKeys);
          const reorderItems = ordering.map((id, index) => ({
            id,
            displayOrder: index,
          }));

          await reorderFn(reorderItems);

          const finalOrders = [...store.values()].map((e) => e.displayOrder);

          // 1. Item count is unchanged.
          expect(store.size).toBe(countBefore);

          // 2. display_order values are unique.
          expect(new Set(finalOrders).size).toBe(finalOrders.length);

          // 3. No gaps: the values form a contiguous 0..N-1 range.
          const sorted = [...finalOrders].sort((a, b) => a - b);
          sorted.forEach((value, index) => {
            expect(value).toBe(index);
          });
        }),
        { numRuns: 100 }
      );
    });
  }
});
