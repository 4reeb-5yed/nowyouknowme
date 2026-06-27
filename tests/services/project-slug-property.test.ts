import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';

/**
 * Feature: portfolio-web-app, Property 1: Project Slug Uniqueness
 *
 * FOR ALL Project creation and update operations, THE ORM SHALL enforce that
 * no two Projects share the same slug value, returning a constraint violation
 * error on conflict.
 *
 * **Validates: Requirements 15.2**
 *
 * Since the service layer guards against slug collisions before they reach the
 * database (the unique constraint is the last line of defense), the observable
 * behavior of the property is: for ANY slug that already exists in the DB, the
 * `create` function produces a DIFFERENT slug (with a numeric suffix) for the
 * new project, so the unique constraint is never violated.
 */

// ─── Mock the database module ──────────────────────────────────────────────────

/**
 * Creates a chainable mock that simulates Drizzle's query builder pattern.
 * Each method returns the proxy so calls like db.select().from().where() work,
 * and the proxy is thenable so `await` resolves to `resolveValue`.
 */
function createChainableMock(resolveValue: unknown = []) {
  const mock: Record<string, unknown> = {};
  const handler: ProxyHandler<Record<string, unknown>> = {
    get(_target, prop) {
      if (prop === 'then') {
        return (resolve: (v: unknown) => void) => resolve(resolveValue);
      }
      if (!mock[prop as string]) {
        mock[prop as string] = vi.fn(() => new Proxy(mock, handler));
      }
      return mock[prop as string];
    },
  };
  return new Proxy(mock, handler);
}

const mockDb = vi.hoisted(() => ({
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('@/server/db', () => ({
  db: mockDb,
}));

vi.mock('@/lib/utils', () => ({
  slugify: (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, ''),
}));

// ─── Import service after mocks are set up ─────────────────────────────────────

import { create } from '@/server/services/project.service';

// ─── Arbitrary for valid slugs ──────────────────────────────────────────────────

const slugCharArb = fc.mapToConstant(
  { num: 26, build: (v) => String.fromCharCode(97 + v) }, // a-z
  { num: 10, build: (v) => String.fromCharCode(48 + v) }, // 0-9
  { num: 1, build: () => '-' }
);

const validSlugArb = fc
  .array(slugCharArb, { minLength: 1, maxLength: 30 })
  .map((chars) => chars.join(''))
  .filter((s) => /^[a-z0-9]/.test(s) && /[a-z0-9]$/.test(s));

// ─── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Builds an insert mock that captures the slug passed to `.values()` and
 * resolves `.returning()` to a project record carrying that slug.
 */
function buildInsertMock(): { proxy: unknown; getInsertedSlug: () => string | undefined } {
  let insertedSlug: string | undefined;
  const insertChain: Record<string, unknown> = {};
  const insertHandler: ProxyHandler<Record<string, unknown>> = {
    get(_target, prop) {
      if (prop === 'then') {
        return (resolve: (v: unknown) => void) =>
          resolve([
            {
              id: 'new-project-id',
              title: 'Test',
              slug: insertedSlug,
              description: 'desc',
              category: 'web',
              techStack: [],
              githubUrl: null,
              liveUrl: null,
              thumbnailUrl: null,
              isFeatured: false,
              displayOrder: 0,
              status: 'draft',
              longDescription: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]);
      }
      if (prop === 'values') {
        return (vals: Record<string, unknown>) => {
          insertedSlug = vals.slug as string;
          return new Proxy(insertChain, insertHandler);
        };
      }
      if (!insertChain[prop as string]) {
        insertChain[prop as string] = vi.fn(() => new Proxy(insertChain, insertHandler));
      }
      return insertChain[prop as string];
    },
  };
  return {
    proxy: new Proxy(insertChain, insertHandler),
    getInsertedSlug: () => insertedSlug,
  };
}

// ─── Tests ──────────────────────────────────────────────────────────────────────

describe('Property 1: Project Slug Uniqueness', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('for any existing slug, create produces a different (suffixed) slug', async () => {
    await fc.assert(
      fc.asyncProperty(validSlugArb, async (existingSlug) => {
        vi.clearAllMocks();

        // Simulate: base slug already exists, the "-1" suffixed slug is free.
        let selectCallCount = 0;
        mockDb.select.mockImplementation(() => {
          selectCallCount++;
          if (selectCallCount === 1) {
            // First check: the base slug already exists in DB
            return createChainableMock([{ id: 'existing-project-id' }]);
          }
          if (selectCallCount === 2) {
            // Second check: the suffixed slug (e.g., "slug-1") is available
            return createChainableMock([]);
          }
          // getNextDisplayOrder
          return createChainableMock([{ maxOrder: -1 }]);
        });

        const insertMock = buildInsertMock();
        mockDb.insert.mockReturnValue(insertMock.proxy);

        const result = await create({
          title: 'Test',
          slug: existingSlug,
          description: 'desc',
          category: 'web',
        });

        // The key property: when a slug already exists, the created project
        // must have a DIFFERENT slug (with a numeric suffix appended).
        expect(result.slug).not.toBe(existingSlug);
        expect(result.slug).toBe(`${existingSlug}-1`);
        // The value handed to the DB insert is also the de-conflicted slug.
        expect(insertMock.getInsertedSlug()).toBe(`${existingSlug}-1`);
      }),
      { numRuns: 100 }
    );
  });

  it('for a unique slug, create preserves the slug unchanged', async () => {
    await fc.assert(
      fc.asyncProperty(validSlugArb, async (freshSlug) => {
        vi.clearAllMocks();

        // Simulate: no project currently uses this slug.
        let selectCallCount = 0;
        mockDb.select.mockImplementation(() => {
          selectCallCount++;
          if (selectCallCount === 1) {
            // slug check - no existing project with this slug
            return createChainableMock([]);
          }
          // getNextDisplayOrder
          return createChainableMock([{ maxOrder: -1 }]);
        });

        const insertMock = buildInsertMock();
        mockDb.insert.mockReturnValue(insertMock.proxy);

        const result = await create({
          title: 'Test',
          slug: freshSlug,
          description: 'desc',
          category: 'web',
        });

        // When the slug is free, it is used as-is (no suffix).
        expect(result.slug).toBe(freshSlug);
        expect(insertMock.getInsertedSlug()).toBe(freshSlug);
      }),
      { numRuns: 100 }
    );
  });
});
