import { describe, it, expect, vi } from 'vitest';

// Mock next-auth to avoid importing next/server in test environment
vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

import {
  createTestContext,
  createAuthenticatedContext,
  createUnauthenticatedContext,
  createAuthenticatedCaller,
  createUnauthenticatedCaller,
  createCallerWithContext,
} from './trpc-test-helpers';

describe('tRPC Test Helpers', () => {
  describe('createTestContext', () => {
    it('creates an unauthenticated context by default', () => {
      const ctx = createTestContext();
      expect(ctx.session).toBeNull();
      expect(ctx.headers).toBeInstanceOf(Headers);
    });

    it('accepts a session override', () => {
      const ctx = createTestContext({
        session: {
          user: { id: 'test-id', email: 'test@example.com' },
          expires: '2025-01-01T00:00:00Z',
        },
      });
      expect(ctx.session?.user.id).toBe('test-id');
      expect(ctx.session?.user.email).toBe('test@example.com');
    });
  });

  describe('createAuthenticatedContext', () => {
    it('creates a context with a valid session', () => {
      const ctx = createAuthenticatedContext();
      expect(ctx.session).not.toBeNull();
      expect(ctx.session?.user.id).toBeDefined();
      expect(ctx.session?.user.email).toContain('@example.com');
    });

    it('allows overriding user fields', () => {
      const ctx = createAuthenticatedContext({ email: 'admin@test.com' });
      expect(ctx.session?.user.email).toBe('admin@test.com');
    });
  });

  describe('createUnauthenticatedContext', () => {
    it('creates a context with null session', () => {
      const ctx = createUnauthenticatedContext();
      expect(ctx.session).toBeNull();
    });
  });

  describe('caller factories', () => {
    it('creates an authenticated caller without throwing', () => {
      const caller = createAuthenticatedCaller();
      expect(caller).toBeDefined();
      expect(caller.projects).toBeDefined();
      expect(caller.experience).toBeDefined();
      expect(caller.certifications).toBeDefined();
    });

    it('creates an unauthenticated caller without throwing', () => {
      const caller = createUnauthenticatedCaller();
      expect(caller).toBeDefined();
      expect(caller.projects).toBeDefined();
    });

    it('creates a caller with custom context', () => {
      const ctx = createTestContext({
        session: {
          user: { id: 'custom-id', email: 'custom@test.com' },
          expires: '2025-12-31T00:00:00Z',
        },
      });
      const caller = createCallerWithContext(ctx);
      expect(caller).toBeDefined();
      expect(caller.siteConfig).toBeDefined();
    });
  });
});
