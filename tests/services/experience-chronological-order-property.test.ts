import { describe, it, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';

/**
 * Property 12: Experience Chronological Display Order
 *
 * FOR ALL public queries of visible Experience entries, THE API_Layer SHALL
 * return entries sorted in reverse chronological order by start_date (most
 * recent first), regardless of display_order values.
 *
 * **Validates: Requirements 18.6**
 *
 * Strategy: We back the real experience service with a faithful in-memory
 * database that applies whatever WHERE/ORDER BY conditions the service
 * constructs. This exercises the service's actual query-building logic — if
 * listVisible sorted by the wrong column (e.g. displayOrder), used ascending
 * order, or omitted the sort entirely, the ordering assertions below would
 * fail. We deliberately scramble displayOrder values that are uncorrelated
 * with startDate to prove the ordering depends only on startDate.
 */

// ─── Shared in-memory store (hoisted so the vi.mock factory can reference it) ───

type Row = Record<string, string | number | boolean | null>;

const h = vi.hoisted(() => {
  const store: Record<string, Row[]> = {
    experiences: [],
  };
  return { store };
});

// ─── Mock drizzle-orm operators to produce inspectable condition descriptors ────

interface Condition {
  kind: 'eq' | 'and';
  field?: string;
  val?: unknown;
  conds?: Condition[];
}

interface SortDef {
  kind: 'asc' | 'desc';
  field: string;
}

interface MockColumn {
  field: string;
}

vi.mock('drizzle-orm', () => ({
  eq: (col: MockColumn, val: unknown): Condition => ({ kind: 'eq', field: col.field, val }),
  and: (...conds: Condition[]): Condition => ({ kind: 'and', conds }),
  asc: (col: MockColumn): SortDef => ({ kind: 'asc', field: col.field }),
  desc: (col: MockColumn): SortDef => ({ kind: 'desc', field: col.field }),
  sql: Object.assign(vi.fn(), { raw: vi.fn() }),
}));

// ─── Mock the schema so each column is an inspectable token ─────────────────────

function col(field: string): MockColumn {
  return { field };
}

vi.mock('@/server/db/schema', () => ({
  experiences: {
    __name: 'experiences',
    id: col('id'),
    isVisible: col('isVisible'),
    startDate: col('startDate'),
    displayOrder: col('displayOrder'),
  },
}));

// ─── Mock the db client with a faithful query builder ───────────────────────────

vi.mock('@/server/db', () => {
  function compile(cond?: Condition): (r: Row) => boolean {
    if (!cond) return () => true;
    if (cond.kind === 'eq') {
      return (r: Row) => r[cond.field as string] === cond.val;
    }
    if (cond.kind === 'and') {
      const fns = (cond.conds ?? []).map((c) => compile(c));
      return (r: Row) => fns.every((fn) => fn(r));
    }
    return () => true;
  }

  function applySort(rows: Row[], sortDef?: SortDef): Row[] {
    if (!sortDef) return rows;
    const { field, kind } = sortDef;
    const sorted = [...rows].sort((a, b) => {
      const av = a[field] as number | string;
      const bv = b[field] as number | string;
      if (av < bv) return -1;
      if (av > bv) return 1;
      return 0;
    });
    return kind === 'desc' ? sorted.reverse() : sorted;
  }

  interface TableRef {
    __name: string;
  }

  function makeBuilder() {
    let rows: Row[] = [];
    let predicate: ((r: Row) => boolean) | null = null;

    const resolveRows = (): Row[] => rows.filter((r) => (predicate ? predicate(r) : true));

    const builder = {
      from(table: TableRef) {
        rows = h.store[table.__name] ? [...h.store[table.__name]] : [];
        return builder;
      },
      where(cond: Condition) {
        predicate = compile(cond);
        return builder;
      },
      orderBy(sortDef: SortDef) {
        return Promise.resolve(applySort(resolveRows(), sortDef));
      },
      limit(n: number) {
        return Promise.resolve(resolveRows().slice(0, n));
      },
    };
    return builder;
  }

  return {
    db: {
      select: () => makeBuilder(),
    },
  };
});

// ─── Import the service after mocks are configured ──────────────────────────────

import { listVisible } from '@/server/services/experience.service';

// ─── Arbitraries ────────────────────────────────────────────────────────────────

const dateStringArb = fc
  .date({ min: new Date('2000-01-01'), max: new Date('2030-12-31'), noInvalidDate: true })
  .map((d) => d.toISOString().slice(0, 10));

// Visible experience rows with varied start dates and scrambled display orders.
const visibleExperienceArb = fc.record({
  id: fc.uuid(),
  isVisible: fc.constant(true),
  startDate: dateStringArb,
  displayOrder: fc.integer({ min: 0, max: 1000 }),
});

// ─── Property Tests ──────────────────────────────────────────────────────────────

describe('Property 12: Experience Chronological Display Order', () => {
  beforeEach(() => {
    h.store.experiences = [];
  });

  /**
   * **Validates: Requirements 18.6**
   *
   * For any set of visible experiences with arbitrary start dates, listVisible
   * returns them in reverse chronological order (most recent start_date first).
   */
  it('returns visible experiences in reverse chronological order by start_date', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(visibleExperienceArb, { maxLength: 40 }),
        async (experiencesData) => {
          h.store.experiences = experiencesData;

          const result = await listVisible();

          // Ordering is monotonically non-increasing by start_date.
          for (let i = 1; i < result.length; i++) {
            expect(
              new Date(result[i - 1]!.startDate).getTime(),
            ).toBeGreaterThanOrEqual(new Date(result[i]!.startDate).getTime());
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * **Validates: Requirements 18.6**
   *
   * The chronological ordering must be independent of display_order. We assign
   * display_order values that run counter to the chronological ordering and
   * confirm the result is still sorted by start_date, never by display_order.
   */
  it('orders by start_date regardless of display_order values', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uniqueArray(visibleExperienceArb, {
          selector: (e) => e.startDate,
          maxLength: 30,
        }),
        async (experiencesData) => {
          // Assign display_order inversely to chronological position so that a
          // (buggy) sort by display_order would produce a different sequence.
          const chronological = [...experiencesData].sort((a, b) =>
            a.startDate < b.startDate ? 1 : a.startDate > b.startDate ? -1 : 0,
          );
          chronological.forEach((row, idx) => {
            row.displayOrder = idx; // oldest-first index == opposite of desired output
          });
          h.store.experiences = experiencesData;

          const result = await listVisible();

          const resultDates = result.map((e) => e.startDate);
          const expectedDates = chronological.map((e) => e.startDate);
          expect(resultDates).toEqual(expectedDates);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * **Validates: Requirements 18.6**
   *
   * listVisible preserves the full visible set — sorting reorders but never
   * drops or duplicates entries.
   */
  it('preserves all visible entries without loss or duplication', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uniqueArray(visibleExperienceArb, { selector: (e) => e.id, maxLength: 40 }),
        async (experiencesData) => {
          h.store.experiences = experiencesData;

          const result = await listVisible();

          expect(result).toHaveLength(experiencesData.length);
          expect(new Set(result.map((e) => e.id))).toEqual(
            new Set(experiencesData.map((e) => e.id)),
          );
        },
      ),
      { numRuns: 100 },
    );
  });
});
