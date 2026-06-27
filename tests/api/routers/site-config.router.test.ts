/**
 * Integration tests for the site-config tRPC router.
 *
 * Verifies router-level behavior (auth enforcement + service delegation)
 * without requiring a real database connection:
 *  - `siteConfig.get` is publicly accessible and returns the current config
 *  - `siteConfig.update` requires authentication (UNAUTHORIZED otherwise)
 *
 * Requirements: 7.1, 7.2
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';

// Mock next-auth so the tRPC root router can be imported in jsdom
// (next-auth pulls in `next/server`, which isn't available here).
vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

// Mock `next/cache` since the update mutation calls revalidatePath,
// which requires a Next.js request context that doesn't exist in tests.
const mockRevalidatePath = vi.fn();
vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

// Mock the service layer so the router can be tested in isolation
// without touching the real database.
const mockGetConfig = vi.fn();
const mockUpdateConfig = vi.fn();
vi.mock('@/server/services/site-config.service', () => ({
  getConfig: (...args: unknown[]) => mockGetConfig(...args),
  updateConfig: (...args: unknown[]) => mockUpdateConfig(...args),
}));

import {
  createUnauthenticatedCaller,
  createAuthenticatedCaller,
} from '../../utils/trpc-test-helpers';
import { createMockSiteConfig } from '../../utils/mock-factories';

describe('siteConfig router (integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('get (public access)', () => {
    it('returns the current config for unauthenticated callers', async () => {
      const config = createMockSiteConfig();
      mockGetConfig.mockResolvedValue(config);

      const caller = createUnauthenticatedCaller();
      const result = await caller.siteConfig.get();

      expect(result).toEqual(config);
      expect(mockGetConfig).toHaveBeenCalledTimes(1);
    });

    it('returns null when no config row exists', async () => {
      mockGetConfig.mockResolvedValue(null);

      const caller = createUnauthenticatedCaller();
      const result = await caller.siteConfig.get();

      expect(result).toBeNull();
    });

    it('also returns the current config for authenticated callers', async () => {
      const config = createMockSiteConfig({ accentColor: '#ff0000' });
      mockGetConfig.mockResolvedValue(config);

      const caller = createAuthenticatedCaller();
      const result = await caller.siteConfig.get();

      expect(result).toEqual(config);
    });
  });

  describe('update (requires authentication)', () => {
    it('rejects unauthenticated callers with UNAUTHORIZED', async () => {
      const caller = createUnauthenticatedCaller();

      await expect(
        caller.siteConfig.update({ accentColor: '#123456' }),
      ).rejects.toThrow(TRPCError);

      await expect(
        caller.siteConfig.update({ accentColor: '#123456' }),
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('does not invoke the service when unauthenticated', async () => {
      const caller = createUnauthenticatedCaller();

      await expect(
        caller.siteConfig.update({ heroTagline: 'Hello' }),
      ).rejects.toThrow(TRPCError);

      expect(mockUpdateConfig).not.toHaveBeenCalled();
      expect(mockRevalidatePath).not.toHaveBeenCalled();
    });

    it('allows authenticated callers and delegates to the service', async () => {
      const updated = createMockSiteConfig({ accentColor: '#123456' });
      mockUpdateConfig.mockResolvedValue(updated);

      const caller = createAuthenticatedCaller();
      const result = await caller.siteConfig.update({ accentColor: '#123456' });

      expect(result).toEqual(updated);
      expect(mockUpdateConfig).toHaveBeenCalledWith({ accentColor: '#123456' });
      // Public pages are revalidated after a successful update.
      expect(mockRevalidatePath).toHaveBeenCalledWith('/', 'layout');
    });
  });
});
