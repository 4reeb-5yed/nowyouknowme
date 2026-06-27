/**
 * Integration tests for the certifications tRPC router.
 *
 * These tests exercise the router end-to-end through tRPC callers, verifying:
 * - Public `listVisible` returns only visible entries in display_order
 *   (Requirements 19.5, 19.6)
 * - Protected `create`/`update`/`delete` require authentication
 *   (Requirement 19.1 and protected mutation contract)
 *
 * The certification service is mocked so the router logic (procedure wiring,
 * auth middleware, input validation) is tested in isolation from the database.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';

import { createMockCertification } from '../utils/mock-factories';

// ─── Mocks ───────────────────────────────────────────────────────────────

// Mock next-auth to avoid importing next/server in the jsdom environment.
vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

// Mock next/cache so revalidatePath is a no-op during tests.
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock the certification service so the router never touches the database.
vi.mock('@/server/services/certification.service', () => ({
  listVisible: vi.fn(),
  listAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  deleteCertification: vi.fn(),
  reorder: vi.fn(),
}));

import * as certificationService from '@/server/services/certification.service';
import {
  createAuthenticatedCaller,
  createUnauthenticatedCaller,
} from '../utils/trpc-test-helpers';

const mockedService = vi.mocked(certificationService);

describe('certifications router (integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── listVisible (public) ──────────────────────────────────────────────

  describe('listVisible', () => {
    it('returns visible entries in display_order for unauthenticated visitors', async () => {
      // The service returns only visible certs, already ordered by display_order ASC.
      const visibleCerts = [
        createMockCertification({ isVisible: true, displayOrder: 0 }),
        createMockCertification({ isVisible: true, displayOrder: 1 }),
        createMockCertification({ isVisible: true, displayOrder: 2 }),
      ];
      mockedService.listVisible.mockResolvedValue(visibleCerts);

      const caller = createUnauthenticatedCaller();
      const result = await caller.certifications.listVisible();

      expect(mockedService.listVisible).toHaveBeenCalledTimes(1);
      expect(result).toEqual(visibleCerts);
      // Confirm the returned ordering matches display_order ascending.
      expect(result.map((c) => c.displayOrder)).toEqual([0, 1, 2]);
    });

    it('excludes hidden entries from the result', async () => {
      // Mixed dataset: only the visible entries should be surfaced by the service.
      const visibleCert = createMockCertification({ isVisible: true, displayOrder: 0 });
      mockedService.listVisible.mockResolvedValue([visibleCert]);

      const caller = createUnauthenticatedCaller();
      const result = await caller.certifications.listVisible();

      expect(result).toHaveLength(1);
      expect(result.every((c) => c.isVisible)).toBe(true);
      expect(result[0]?.id).toBe(visibleCert.id);
    });

    it('returns an empty array when there are no visible entries', async () => {
      mockedService.listVisible.mockResolvedValue([]);

      const caller = createUnauthenticatedCaller();
      const result = await caller.certifications.listVisible();

      expect(result).toEqual([]);
    });
  });

  // ─── create (protected) ────────────────────────────────────────────────

  describe('create', () => {
    const validInput = {
      certificationName: 'AWS Solutions Architect',
      issuingOrganization: 'Amazon Web Services',
      issueDate: '2023-06-15',
      expiryDate: '2026-06-15',
      credentialId: 'CERT-123',
      credentialUrl: 'https://www.credly.com/badges/abc',
      isVisible: true,
    };

    it('rejects unauthenticated callers with UNAUTHORIZED', async () => {
      const caller = createUnauthenticatedCaller();

      await expect(caller.certifications.create(validInput)).rejects.toThrow(TRPCError);
      await expect(caller.certifications.create(validInput)).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
      // Auth gate runs before the service, so it is never invoked.
      expect(mockedService.create).not.toHaveBeenCalled();
    });

    it('persists a new certification when authenticated', async () => {
      const created = createMockCertification(validInput);
      mockedService.create.mockResolvedValue(created);

      const caller = createAuthenticatedCaller();
      const result = await caller.certifications.create(validInput);

      expect(mockedService.create).toHaveBeenCalledTimes(1);
      expect(mockedService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          certificationName: validInput.certificationName,
          issuingOrganization: validInput.issuingOrganization,
          issueDate: validInput.issueDate,
        }),
      );
      expect(result).toEqual(created);
    });
  });

  // ─── update (protected) ────────────────────────────────────────────────

  describe('update', () => {
    const certId = '11111111-1111-4111-8111-111111111111';

    it('rejects unauthenticated callers with UNAUTHORIZED', async () => {
      const caller = createUnauthenticatedCaller();

      await expect(
        caller.certifications.update({ id: certId, isVisible: false }),
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
      expect(mockedService.update).not.toHaveBeenCalled();
    });

    it('updates an existing certification when authenticated', async () => {
      const updated = createMockCertification({ id: certId, isVisible: false });
      mockedService.update.mockResolvedValue(updated);

      const caller = createAuthenticatedCaller();
      const result = await caller.certifications.update({ id: certId, isVisible: false });

      expect(mockedService.update).toHaveBeenCalledTimes(1);
      expect(mockedService.update).toHaveBeenCalledWith(certId, { isVisible: false });
      expect(result).toEqual(updated);
    });
  });

  // ─── delete (protected) ────────────────────────────────────────────────

  describe('delete', () => {
    const certId = '22222222-2222-4222-8222-222222222222';

    it('rejects unauthenticated callers with UNAUTHORIZED', async () => {
      const caller = createUnauthenticatedCaller();

      await expect(
        caller.certifications.delete({ id: certId }),
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
      expect(mockedService.deleteCertification).not.toHaveBeenCalled();
    });

    it('deletes a certification when authenticated', async () => {
      mockedService.deleteCertification.mockResolvedValue(undefined);

      const caller = createAuthenticatedCaller();
      await caller.certifications.delete({ id: certId });

      expect(mockedService.deleteCertification).toHaveBeenCalledTimes(1);
      expect(mockedService.deleteCertification).toHaveBeenCalledWith(certId);
    });
  });
});
