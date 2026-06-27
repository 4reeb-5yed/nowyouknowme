/**
 * Feature: portfolio-web-app, Property 3: Authentication Gate Invariant
 *
 * FOR ALL HTTP requests to /admin/* routes, THE Auth_System SHALL either have a
 * valid session present (allowing access) or redirect to login — no CMS route is
 * accessible without authentication.
 *
 * At the API layer this manifests as: every protected tRPC procedure (the
 * back-end of the CMS routes) MUST reject an unauthenticated caller with an
 * UNAUTHORIZED error before any business logic runs. This property generates
 * arbitrary procedure names drawn from the protected routers and verifies that
 * each one rejects an unauthenticated call.
 *
 * **Validates: Requirements 1.5**
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import fc from 'fast-check';

// ─── Mocks ───────────────────────────────────────────────────────────────────

// Mock next-auth to avoid importing next/server in the jsdom environment and to
// guarantee the caller is unauthenticated (auth() resolves to null).
vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

// The routers trigger ISR revalidation after mutations — stub it out so it is a
// no-op if a procedure ever proceeded past the auth gate (it must not).
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// ─── Import helpers after mocks are set up ─────────────────────────────────────

import { createUnauthenticatedCaller } from '../utils/trpc-test-helpers';

type Caller = ReturnType<typeof createUnauthenticatedCaller>;

// ─── Protected procedure registry ──────────────────────────────────────────────

/**
 * Every protected (auth-required) procedure across all routers, keyed by its
 * fully-qualified procedure name. Each invoker calls the procedure on the given
 * caller. Inputs are syntactically valid but irrelevant: the auth middleware on
 * `protectedProcedure` runs before input parsing and the resolver, so an
 * unauthenticated call must fail with UNAUTHORIZED regardless of the input.
 */
const UUID = '00000000-0000-0000-0000-000000000000';

const protectedProcedures: Record<string, (caller: Caller) => Promise<unknown>> = {
  // certifications router
  'certifications.listAll': (c) => c.certifications.listAll(),
  'certifications.create': (c) =>
    c.certifications.create({
      certificationName: 'Cert',
      issuingOrganization: 'Org',
      issueDate: '2020-01-01',
    }),
  'certifications.update': (c) => c.certifications.update({ id: UUID }),
  'certifications.delete': (c) => c.certifications.delete({ id: UUID }),
  'certifications.reorder': (c) => c.certifications.reorder([]),

  // content router
  'content.updateSection': (c) =>
    c.content.updateSection({ key: 'about', content: 'hello' }),

  // experience router
  'experience.listAll': (c) => c.experience.listAll(),
  'experience.create': (c) =>
    c.experience.create({
      companyName: 'Company',
      roleTitle: 'Engineer',
      startDate: '2020-01-01',
    }),
  'experience.update': (c) => c.experience.update({ id: UUID }),
  'experience.delete': (c) => c.experience.delete({ id: UUID }),
  'experience.reorder': (c) => c.experience.reorder([]),

  // projects router
  'projects.listAll': (c) => c.projects.listAll(),
  'projects.create': (c) =>
    c.projects.create({ title: 'Title', description: 'Desc', category: 'web' }),
  'projects.update': (c) => c.projects.update({ id: UUID }),
  'projects.delete': (c) => c.projects.delete({ id: UUID }),
  'projects.reorder': (c) => c.projects.reorder([]),

  // resume router
  'resume.listAll': (c) => c.resume.listAll(),
  'resume.setActive': (c) => c.resume.setActive({ id: UUID }),

  // siteConfig router
  'siteConfig.update': (c) => c.siteConfig.update({}),

  // socialLinks router
  'socialLinks.listAll': (c) => c.socialLinks.listAll(),
  'socialLinks.create': (c) =>
    c.socialLinks.create({ platform: 'GitHub', url: 'https://example.com' }),
  'socialLinks.update': (c) => c.socialLinks.update({ id: UUID }),
  'socialLinks.delete': (c) => c.socialLinks.delete({ id: UUID }),
  'socialLinks.reorder': (c) => c.socialLinks.reorder([]),
};

const protectedProcedureNames = Object.keys(protectedProcedures);

// ─── Tests ──────────────────────────────────────────────────────────────────────

describe('Property 3: Authentication Gate Invariant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects unauthenticated calls for every arbitrary protected procedure name', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...protectedProcedureNames),
        async (procedureName) => {
          const caller = createUnauthenticatedCaller();

          // The invariant: calling any protected procedure without a session
          // must reject with an UNAUTHORIZED TRPCError.
          let thrown: unknown;
          try {
            await protectedProcedures[procedureName](caller);
          } catch (error) {
            thrown = error;
          }

          expect(thrown, `${procedureName} did not reject`).toBeInstanceOf(TRPCError);
          expect((thrown as TRPCError).code).toBe('UNAUTHORIZED');
        },
      ),
      { numRuns: 100 },
    );
  });

  it('exhaustively rejects every protected procedure with UNAUTHORIZED', async () => {
    for (const procedureName of protectedProcedureNames) {
      const caller = createUnauthenticatedCaller();

      await expect(
        protectedProcedures[procedureName](caller),
        `${procedureName} should reject unauthenticated callers`,
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    }
  });
});
