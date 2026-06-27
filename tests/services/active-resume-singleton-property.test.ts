import { describe, it, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';

/**
 * Feature: portfolio-web-app, Property 5: Active Resume Singleton
 *
 * FOR ALL states of the Resume table, at most one Resume record SHALL have
 * is_active set to true at any given time.
 *
 * **Validates: Requirements 6.2**
 *
 * Strategy: We back the real resume.service code with a faithful in-memory
 * database that mirrors Drizzle's query-builder semantics (insert/values,
 * update/set/where, select/from/where/limit). This means the test exercises the
 * service's ACTUAL logic. The service guarantees the singleton invariant by
 * deactivating every existing resume before activating/inserting a new one — if
 * that deactivation step were dropped or mis-scoped (e.g. a stray WHERE clause),
 * multiple rows would remain active and the property would fail.
 *
 * We generate arbitrary sequences of resume operations (uploads via `create` and
 * activations via `setActive`) and assert the invariant holds at EVERY
 * intermediate state, not just the final one.
 */

// ─── Shared in-memory store (hoisted so the vi.mock factory can reference it) ───

interface ResumeRow {
  id: string;
  userId: string;
  fileUrl: string;
  isActive: boolean;
  uploadedAt: Date;
  [key: string]: string | number | boolean | Date | null;
}

const h = vi.hoisted(() => {
  const state: { rows: ResumeRow[]; idCounter: number } = { rows: [], idCounter: 0 };
  return { state };
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
}));

// ─── Mock the schema so each column is an inspectable token ─────────────────────

function col(field: string): MockColumn {
  return { field };
}

vi.mock('@/server/db/schema', () => ({
  resumes: {
    __name: 'resumes',
    id: col('id'),
    userId: col('userId'),
    fileUrl: col('fileUrl'),
    isActive: col('isActive'),
    uploadedAt: col('uploadedAt'),
  },
}));

// ─── Mock the db client with a faithful query builder ───────────────────────────

vi.mock('@/server/db', () => {
  function compile(cond?: Condition): (r: ResumeRow) => boolean {
    if (!cond) return () => true;
    if (cond.kind === 'eq') {
      return (r: ResumeRow) => r[cond.field as string] === cond.val;
    }
    if (cond.kind === 'and') {
      const fns = (cond.conds ?? []).map((c) => compile(c));
      return (r: ResumeRow) => fns.every((fn) => fn(r));
    }
    return () => true;
  }

  function applySort(rows: ResumeRow[], sortDef?: SortDef): ResumeRow[] {
    if (!sortDef) return rows;
    const { field, kind } = sortDef;
    const sorted = [...rows].sort((a, b) => {
      const av = a[field] as number | string | Date;
      const bv = b[field] as number | string | Date;
      if (av < bv) return -1;
      if (av > bv) return 1;
      return 0;
    });
    return kind === 'desc' ? sorted.reverse() : sorted;
  }

  // SELECT builder: select().from().where().limit()/.orderBy()
  function makeSelectBuilder() {
    let rows: ResumeRow[] = [];
    let predicate: ((r: ResumeRow) => boolean) | null = null;

    const resolveRows = (): ResumeRow[] => rows.filter((r) => (predicate ? predicate(r) : true));

    const builder = {
      from() {
        rows = [...h.state.rows];
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

  // UPDATE builder: update(table).set(values)[.where(cond)][.returning()]
  // When awaited directly (no .returning()), the mutation still applies.
  function makeUpdateBuilder() {
    let values: Partial<ResumeRow> = {};
    let predicate: ((r: ResumeRow) => boolean) | null = null;
    let applied = false;
    let affected: ResumeRow[] = [];

    const apply = (): ResumeRow[] => {
      if (applied) return affected;
      affected = [];
      for (const r of h.state.rows) {
        if (!predicate || predicate(r)) {
          Object.assign(r, values);
          affected.push(r);
        }
      }
      applied = true;
      return affected;
    };

    const builder = {
      set(v: Partial<ResumeRow>) {
        values = v;
        return builder;
      },
      where(cond: Condition) {
        predicate = compile(cond);
        return builder;
      },
      returning() {
        return Promise.resolve(apply());
      },
      then(
        resolve: (v: ResumeRow[]) => unknown,
        reject?: (e: unknown) => unknown
      ) {
        return Promise.resolve(apply()).then(resolve, reject);
      },
    };
    return builder;
  }

  // INSERT builder: insert(table).values(vals).returning()
  function makeInsertBuilder() {
    let inserted: ResumeRow;
    const builder = {
      values(vals: Partial<ResumeRow>) {
        inserted = {
          id: `resume-${++h.state.idCounter}`,
          userId: vals.userId as string,
          fileUrl: vals.fileUrl as string,
          isActive: vals.isActive ?? true,
          uploadedAt: new Date(h.state.idCounter * 1000),
        } as ResumeRow;
        h.state.rows.push(inserted);
        return builder;
      },
      returning() {
        return Promise.resolve([inserted]);
      },
    };
    return builder;
  }

  return {
    db: {
      select: () => makeSelectBuilder(),
      update: () => makeUpdateBuilder(),
      insert: () => makeInsertBuilder(),
    },
  };
});

// ─── Import service after mocks are configured ──────────────────────────────────

import { create, setActive } from '@/server/services/resume.service';

// ─── Helpers ────────────────────────────────────────────────────────────────────

function countActive(): number {
  return h.state.rows.filter((r) => r.isActive === true).length;
}

// ─── Arbitraries ────────────────────────────────────────────────────────────────

/**
 * An operation is either uploading a new resume (`create`) or activating an
 * existing one (`setActive`). For `setActive` we carry an index that is resolved
 * against the live set of resume ids at execution time (modulo the count), so the
 * operation always targets a valid, existing record.
 */
const operationArb = fc.oneof(
  fc.record({
    type: fc.constant('create' as const),
    fileUrl: fc.webUrl(),
  }),
  fc.record({
    type: fc.constant('setActive' as const),
    index: fc.nat({ max: 1000 }),
  })
);

const operationsArb = fc.array(operationArb, { minLength: 1, maxLength: 30 });

// ─── Property Tests ──────────────────────────────────────────────────────────────

describe('Property 5: Active Resume Singleton', () => {
  beforeEach(() => {
    h.state.rows = [];
    h.state.idCounter = 0;
  });

  /**
   * **Validates: Requirements 6.2**
   *
   * For any arbitrary sequence of resume uploads and activations, at most one
   * resume is active after EVERY operation (checked at all intermediate states).
   */
  it('keeps at most one resume active at every intermediate state', async () => {
    await fc.assert(
      fc.asyncProperty(operationsArb, async (operations) => {
        h.state.rows = [];
        h.state.idCounter = 0;

        for (const op of operations) {
          if (op.type === 'create') {
            await create({ userId: 'owner-1', fileUrl: op.fileUrl });
          } else {
            // Resolve the index against the current set of resumes.
            if (h.state.rows.length === 0) {
              // Nothing to activate yet — seed one so the op is meaningful.
              await create({ userId: 'owner-1', fileUrl: 'https://cdn.example.com/seed.pdf' });
            }
            const target = h.state.rows[op.index % h.state.rows.length]!;
            await setActive(target.id);
          }

          // Invariant: at most one active resume at this intermediate state.
          expect(countActive()).toBeLessThanOrEqual(1);
        }
      }),
      { numRuns: 200 }
    );
  });

  /**
   * **Validates: Requirements 6.2**
   *
   * After every upload, exactly one resume (the newest) is active, and it is the
   * most recently inserted record.
   */
  it('makes the freshly uploaded resume the sole active one', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.webUrl(), { minLength: 1, maxLength: 20 }),
        async (fileUrls) => {
          h.state.rows = [];
          h.state.idCounter = 0;

          for (const fileUrl of fileUrls) {
            const created = await create({ userId: 'owner-1', fileUrl });

            expect(countActive()).toBe(1);
            const active = h.state.rows.find((r) => r.isActive)!;
            expect(active.id).toBe(created.id);
          }
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * **Validates: Requirements 6.2**
   *
   * Activating an existing resume deactivates all others — exactly one remains
   * active and it is the targeted record.
   */
  it('setActive leaves exactly the targeted resume active', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 15 }),
        fc.nat({ max: 1000 }),
        async (uploadCount, pickIndex) => {
          h.state.rows = [];
          h.state.idCounter = 0;

          for (let i = 0; i < uploadCount; i++) {
            await create({ userId: 'owner-1', fileUrl: `https://cdn.example.com/r${i}.pdf` });
          }

          const target = h.state.rows[pickIndex % h.state.rows.length]!;
          await setActive(target.id);

          expect(countActive()).toBe(1);
          const active = h.state.rows.find((r) => r.isActive)!;
          expect(active.id).toBe(target.id);
        }
      ),
      { numRuns: 200 }
    );
  });
});
