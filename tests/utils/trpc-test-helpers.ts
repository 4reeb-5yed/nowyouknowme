/**
 * tRPC test helpers for creating test callers with mocked context.
 *
 * Provides helpers to create authenticated and unauthenticated tRPC callers
 * without requiring a real database connection or auth session.
 *
 * IMPORTANT: Tests using these helpers must mock `@/lib/auth` to prevent
 * next-auth from importing `next/server` (which isn't available in jsdom):
 *
 * ```ts
 * vi.mock('@/lib/auth', () => ({
 *   auth: vi.fn().mockResolvedValue(null),
 * }));
 * ```
 */
import { appRouter } from '@/server/api/root';
import { createCallerFactory } from '@/server/api/trpc';
import type { TRPCContext } from '@/server/api/trpc';
import { createMockUser } from './mock-factories';

// ─── Types ─────────────────────────────────────────────────────────────────

interface MockSession {
  user: {
    id: string;
    email: string;
  };
  expires: string;
}

interface CreateTestContextOptions {
  /** Provide a session to simulate an authenticated user. Pass null for unauthenticated. */
  session?: MockSession | null;
  /** Override the db instance in context (defaults to an empty object placeholder). */
  db?: TRPCContext['db'];
}

// ─── Context Factory ───────────────────────────────────────────────────────

/**
 * Creates a mock tRPC context for testing.
 *
 * By default, creates an unauthenticated context with a stub database.
 * Pass a session to simulate authenticated access.
 */
export function createTestContext(options: CreateTestContextOptions = {}): TRPCContext {
  const { session = null, db } = options;

  return {
    session,
    db: db ?? ({} as TRPCContext['db']),
    headers: new Headers(),
  };
}

/**
 * Creates an authenticated mock context with a default test user.
 */
export function createAuthenticatedContext(
  overrides: Partial<MockSession['user']> & { db?: TRPCContext['db'] } = {},
): TRPCContext {
  const { db, ...userOverrides } = overrides;
  const mockUser = createMockUser();

  const session: MockSession = {
    user: {
      id: userOverrides.id ?? mockUser.id,
      email: userOverrides.email ?? mockUser.email,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };

  return createTestContext({ session, db });
}

/**
 * Creates an unauthenticated mock context (no session).
 */
export function createUnauthenticatedContext(
  options: { db?: TRPCContext['db'] } = {},
): TRPCContext {
  return createTestContext({ session: null, db: options.db });
}

// ─── Caller Factory ────────────────────────────────────────────────────────

const callerFactory = createCallerFactory(appRouter);

/**
 * Creates a tRPC caller with an authenticated context.
 * Use this to test protected procedures.
 */
export function createAuthenticatedCaller(
  options: Partial<MockSession['user']> & { db?: TRPCContext['db'] } = {},
) {
  const ctx = createAuthenticatedContext(options);
  return callerFactory(ctx);
}

/**
 * Creates a tRPC caller with an unauthenticated context.
 * Use this to test public procedures and auth enforcement.
 */
export function createUnauthenticatedCaller(
  options: { db?: TRPCContext['db'] } = {},
) {
  const ctx = createUnauthenticatedContext(options);
  return callerFactory(ctx);
}

/**
 * Creates a tRPC caller with a custom context.
 * Use this when you need full control over the context.
 */
export function createCallerWithContext(ctx: TRPCContext) {
  return callerFactory(ctx);
}
