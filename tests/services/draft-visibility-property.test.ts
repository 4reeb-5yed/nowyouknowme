import { describe, it, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';

/**
 * Property 4: Draft Visibility Invariant
 *
 * FOR ALL public queries, THE API_Layer SHALL return only Projects with status
 * 'published' and only Experience and Certification entries with is_visible set to
 * true — no draft Project or hidden entry is ever visible on the Public_Site.
 *
 * **Validates: Requirements 2.4, 2.5, 3.4, 18.5, 19.5**
 *
 * Strategy: We back the real service code with a faithful in-memory database that
 * applies whatever WHERE/ORDER BY conditions the service constructs. This means the
 * test exercises the service's actual query-building logic: if a service omitted its
 * status/visibility filter (or filtered on the wrong field/value), drafts or hidden
 * entries would leak through and the property would fail.
 */

// ─── Shared in-memory store (hoisted so the vi.mock factory can reference it) ───

type Row = Record<string, string | number | boolean | null>;

const h = vi.hoisted(() => {
  const store: Record<string, Row[]> = {
    projects: [],
    experiences: [],
    certifications: [],
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
  projects: {
    __name: 'projects',
    id: col('id'),
    slug: col('slug'),
    status: col('status'),
    displayOrder: col('displayOrder'),
  },
  experiences: {
    __name: 'experiences',
    id: col('id'),
    isVisible: col('isVisible'),
    startDate: col('startDate'),
    displayOrder: col('displayOrder'),
  },
  certifications: {
    __name: 'certifications',
    id: col('id'),
    isVisible: col('isVisible'),
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

// ─── Import services after mocks are configured ─────────────────────────────────

import { listPublished, getBySlug } from '@/server/services/project.service';
import { listVisible as listVisibleExperiences } from '@/server/services/experience.service';
import { listVisible as listVisibleCertifications } from '@/server/services/certification.service';

// ─── Arbitraries ────────────────────────────────────────────────────────────────

const dateStringArb = fc
  .date({ min: new Date('2000-01-01'), max: new Date('2030-12-31') })
  .map((d) => d.toISOString().slice(0, 10));

const projectArb = fc.record({
  id: fc.uuid(),
  slug: fc.uuid(),
  status: fc.constantFrom('draft', 'published'),
  displayOrder: fc.integer({ min: 0, max: 1000 }),
});

const experienceArb = fc.record({
  id: fc.uuid(),
  isVisible: fc.boolean(),
  startDate: dateStringArb,
  displayOrder: fc.integer({ min: 0, max: 1000 }),
});

const certificationArb = fc.record({
  id: fc.uuid(),
  isVisible: fc.boolean(),
  displayOrder: fc.integer({ min: 0, max: 1000 }),
});

// ─── Property Tests ──────────────────────────────────────────────────────────────

describe('Property 4: Draft Visibility Invariant', () => {
  beforeEach(() => {
    h.store.projects = [];
    h.store.experiences = [];
    h.store.certifications = [];
  });

  /**
   * **Validates: Requirements 2.4, 2.5, 3.4**
   *
   * For any mixed set of published/draft projects, listPublished returns exactly
   * the published projects and never a draft.
   */
  it('project listPublished never returns draft projects', async () => {
    await fc.assert(
      fc.asyncProperty(fc.array(projectArb, { maxLength: 40 }), async (projectsData) => {
        h.store.projects = projectsData;

        const result = await listPublished();

        // No returned project is a draft.
        expect(result.every((p) => p.status === 'published')).toBe(true);
        // The result count equals the number of published projects in the set.
        const expectedCount = projectsData.filter((p) => p.status === 'published').length;
        expect(result).toHaveLength(expectedCount);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 3.4**
   *
   * For any project, getBySlug returns the project only when it is published;
   * a draft slug always resolves to null (which the Public_Site renders as 404).
   */
  it('project getBySlug returns null for draft projects and the record for published', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uniqueArray(projectArb, { selector: (p) => p.slug, maxLength: 40 }),
        async (projectsData) => {
          h.store.projects = projectsData;

          for (const project of projectsData) {
            const result = await getBySlug(project.slug);
            if (project.status === 'published') {
              expect(result).not.toBeNull();
              expect(result?.slug).toBe(project.slug);
            } else {
              expect(result).toBeNull();
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 18.5**
   *
   * For any mixed set of visible/hidden experiences, listVisible returns exactly
   * the visible entries and never a hidden one.
   */
  it('experience listVisible never returns hidden entries', async () => {
    await fc.assert(
      fc.asyncProperty(fc.array(experienceArb, { maxLength: 40 }), async (experiencesData) => {
        h.store.experiences = experiencesData;

        const result = await listVisibleExperiences();

        expect(result.every((e) => e.isVisible === true)).toBe(true);
        const expectedCount = experiencesData.filter((e) => e.isVisible).length;
        expect(result).toHaveLength(expectedCount);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 19.5**
   *
   * For any mixed set of visible/hidden certifications, listVisible returns exactly
   * the visible entries and never a hidden one.
   */
  it('certification listVisible never returns hidden entries', async () => {
    await fc.assert(
      fc.asyncProperty(fc.array(certificationArb, { maxLength: 40 }), async (certificationsData) => {
        h.store.certifications = certificationsData;

        const result = await listVisibleCertifications();

        expect(result.every((c) => c.isVisible === true)).toBe(true);
        const expectedCount = certificationsData.filter((c) => c.isVisible).length;
        expect(result).toHaveLength(expectedCount);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 2.4, 2.5, 18.5, 19.5**
   *
   * Combined invariant: across all three public list queries run against a mixed
   * dataset simultaneously, no draft project or hidden entry ever surfaces.
   */
  it('no public list query ever surfaces a hidden item across mixed datasets', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(projectArb, { maxLength: 30 }),
        fc.array(experienceArb, { maxLength: 30 }),
        fc.array(certificationArb, { maxLength: 30 }),
        async (projectsData, experiencesData, certificationsData) => {
          h.store.projects = projectsData;
          h.store.experiences = experiencesData;
          h.store.certifications = certificationsData;

          const [pubProjects, visExp, visCert] = await Promise.all([
            listPublished(),
            listVisibleExperiences(),
            listVisibleCertifications(),
          ]);

          expect(pubProjects.some((p) => p.status === 'draft')).toBe(false);
          expect(visExp.some((e) => e.isVisible === false)).toBe(false);
          expect(visCert.some((c) => c.isVisible === false)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
