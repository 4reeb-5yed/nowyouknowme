/**
 * Integration tests for the experience tRPC router.
 *
 * Exercises the real router (including the auth middleware) through tRPC
 * callers, with the experience service layer mocked at its boundary. This
 * verifies:
 *  - listVisible is a public procedure that surfaces only visible entries
 *    in reverse-chronological order (Requirements 18.1, 18.5, 18.6)
 *  - create/update/delete are protected and reject unauthenticated calls
 *    (Requirement 18.5 — owner-only management)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { createMockExperience, resetFactoryCounter } from '../utils/mock-factories';

// Mock next-auth to avoid importing next/server in the test environment.
vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

// The router triggers ISR revalidation after mutations — stub it out.
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock the service layer so the router is tested in isolation from the DB.
vi.mock('@/server/services/experience.service', () => ({
  listVisible: vi.fn(),
  listAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  deleteExperience: vi.fn(),
  reorder: vi.fn(),
}));

import * as experienceService from '@/server/services/experience.service';
import { revalidatePath } from 'next/cache';
import {
  createAuthenticatedCaller,
  createUnauthenticatedCaller,
} from '../utils/trpc-test-helpers';

describe('Experience Router (integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetFactoryCounter();
  });

  // ─── listVisible: visibility filtering (Req 18.1, 18.5) ──────────────────

  describe('listVisible', () => {
    it('is publicly accessible without authentication', async () => {
      vi.mocked(experienceService.listVisible).mockResolvedValue([]);

      const caller = createUnauthenticatedCaller();
      await expect(caller.experience.listVisible()).resolves.toEqual([]);
      expect(experienceService.listVisible).toHaveBeenCalledOnce();
    });

    it('returns only visible entries and excludes hidden ones', async () => {
      const visibleA = createMockExperience({ isVisible: true });
      const visibleB = createMockExperience({ isVisible: true });
      // The public listVisible service only ever returns is_visible=true rows.
      vi.mocked(experienceService.listVisible).mockResolvedValue([visibleA, visibleB]);

      const caller = createUnauthenticatedCaller();
      const result = await caller.experience.listVisible();

      expect(result).toEqual([visibleA, visibleB]);
      expect(result.every((entry) => entry.isVisible === true)).toBe(true);
      expect(result.some((entry) => entry.isVisible === false)).toBe(false);
    });

    // ─── chronological sort order (Req 18.6) ───────────────────────────────

    it('returns entries in reverse-chronological order (most recent first)', async () => {
      const newest = createMockExperience({ startDate: '2024-05-01', isVisible: true });
      const middle = createMockExperience({ startDate: '2022-01-15', isVisible: true });
      const oldest = createMockExperience({ startDate: '2019-09-30', isVisible: true });

      vi.mocked(experienceService.listVisible).mockResolvedValue([newest, middle, oldest]);

      const caller = createUnauthenticatedCaller();
      const result = await caller.experience.listVisible();

      const startDates = result.map((entry) => entry.startDate);
      expect(startDates).toEqual(['2024-05-01', '2022-01-15', '2019-09-30']);

      // Assert the ordering is monotonically non-increasing by start date.
      for (let i = 1; i < result.length; i++) {
        expect(
          new Date(result[i - 1]!.startDate).getTime(),
        ).toBeGreaterThanOrEqual(new Date(result[i]!.startDate).getTime());
      }
    });
  });

  // ─── create requires authentication (Req 18.5) ───────────────────────────

  describe('create', () => {
    const validInput = {
      companyName: 'Acme Corp',
      roleTitle: 'Senior Engineer',
      startDate: '2023-01-15',
      endDate: '2024-06-30',
      description: 'Built cloud infrastructure',
      techStack: ['AWS', 'Terraform'],
      isVisible: true,
    };

    it('rejects unauthenticated calls with UNAUTHORIZED', async () => {
      const caller = createUnauthenticatedCaller();

      await expect(caller.experience.create(validInput)).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
      // The service must never run for an unauthenticated request.
      expect(experienceService.create).not.toHaveBeenCalled();
    });

    it('allows authenticated calls and delegates to the service', async () => {
      const created = createMockExperience(validInput);
      vi.mocked(experienceService.create).mockResolvedValue(created);

      const caller = createAuthenticatedCaller();
      const result = await caller.experience.create(validInput);

      expect(result).toEqual(created);
      expect(experienceService.create).toHaveBeenCalledOnce();
      // Mutations trigger ISR revalidation of affected public pages.
      expect(revalidatePath).toHaveBeenCalled();
    });
  });

  // ─── update requires authentication (Req 18.5) ───────────────────────────

  describe('update', () => {
    const validId = '11111111-1111-4111-8111-111111111111';
    const validInput = { id: validId, roleTitle: 'Lead Engineer' };

    it('rejects unauthenticated calls with UNAUTHORIZED', async () => {
      const caller = createUnauthenticatedCaller();

      await expect(caller.experience.update(validInput)).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
      expect(experienceService.update).not.toHaveBeenCalled();
    });

    it('allows authenticated calls and delegates to the service', async () => {
      const updated = createMockExperience({ id: validId, roleTitle: 'Lead Engineer' });
      vi.mocked(experienceService.update).mockResolvedValue(updated);

      const caller = createAuthenticatedCaller();
      const result = await caller.experience.update(validInput);

      expect(result).toEqual(updated);
      expect(experienceService.update).toHaveBeenCalledOnce();
      expect(revalidatePath).toHaveBeenCalled();
    });
  });

  // ─── delete requires authentication (Req 18.5) ───────────────────────────

  describe('delete', () => {
    const validId = '22222222-2222-2222-2222-222222222222';

    it('rejects unauthenticated calls with UNAUTHORIZED', async () => {
      const caller = createUnauthenticatedCaller();

      await expect(
        caller.experience.delete({ id: validId }),
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
      expect(experienceService.deleteExperience).not.toHaveBeenCalled();
    });

    it('allows authenticated calls and delegates to the service', async () => {
      vi.mocked(experienceService.deleteExperience).mockResolvedValue(undefined);

      const caller = createAuthenticatedCaller();
      await caller.experience.delete({ id: validId });

      expect(experienceService.deleteExperience).toHaveBeenCalledWith(validId);
      expect(revalidatePath).toHaveBeenCalled();
    });
  });

  // ─── auth enforcement is uniform across mutations ────────────────────────

  it('rejects unauthenticated calls to every protected mutation', async () => {
    const caller = createUnauthenticatedCaller();

    const protectedCalls: Promise<unknown>[] = [
      caller.experience.create({
        companyName: 'X',
        roleTitle: 'Y',
        startDate: '2023-01-01',
      }),
      caller.experience.update({ id: '33333333-3333-3333-3333-333333333333' }),
      caller.experience.delete({ id: 'any-id' }),
      caller.experience.reorder([]),
      caller.experience.listAll(),
    ];

    const results = await Promise.allSettled(protectedCalls);
    for (const outcome of results) {
      expect(outcome.status).toBe('rejected');
      if (outcome.status === 'rejected') {
        expect(outcome.reason).toBeInstanceOf(TRPCError);
        expect((outcome.reason as TRPCError).code).toBe('UNAUTHORIZED');
      }
    }
  });
});
