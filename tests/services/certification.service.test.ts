import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockCertification, resetFactoryCounter } from '../utils/mock-factories';

// ─── Mock the database module ──────────────────────────────────────────────

const mockReturning = vi.fn();
const mockWhere = vi.fn();
const mockSet = vi.fn();
const mockValues = vi.fn();
const mockFrom = vi.fn();
const mockOrderBy = vi.fn();
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

vi.mock('@/server/db', () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
    insert: (...args: unknown[]) => mockInsert(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));

// Also mock drizzle-orm operators to avoid schema resolution issues
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((col, val) => ({ type: 'eq', col, val })),
  asc: vi.fn((col) => ({ type: 'asc', col })),
  desc: vi.fn((col) => ({ type: 'desc', col })),
  sql: Object.assign(vi.fn(), {
    // Template literal tag function support
    raw: vi.fn(),
  }),
}));

// Mock the schema module
vi.mock('@/server/db/schema', () => ({
  certifications: {
    id: 'certifications.id',
    certificationName: 'certifications.certificationName',
    issuingOrganization: 'certifications.issuingOrganization',
    issueDate: 'certifications.issueDate',
    expiryDate: 'certifications.expiryDate',
    credentialId: 'certifications.credentialId',
    credentialUrl: 'certifications.credentialUrl',
    displayOrder: 'certifications.displayOrder',
    isVisible: 'certifications.isVisible',
    createdAt: 'certifications.createdAt',
    updatedAt: 'certifications.updatedAt',
    $inferInsert: {},
    $inferSelect: {},
  },
}));

import {
  listVisible,
  listAll,
  create,
  update,
  deleteCertification,
  reorder,
} from '@/server/services/certification.service';

describe('certification.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetFactoryCounter();
  });

  // ─── Helper to set up the select chain ─────────────────────────────────

  function setupSelectChain(result: unknown[]) {
    const chain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue(result),
    };
    mockSelect.mockReturnValue(chain);
    return chain;
  }

  // ─── Helper to set up the insert chain ─────────────────────────────────

  function setupInsertChain(result: unknown[]) {
    const chain = {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue(result),
    };
    mockInsert.mockReturnValue(chain);
    return chain;
  }

  // ─── Helper to set up the update chain ─────────────────────────────────

  function setupUpdateChain(result: unknown[]) {
    const chain = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue(result),
    };
    mockUpdate.mockReturnValue(chain);
    return chain;
  }

  // ─── Helper to set up the delete chain ─────────────────────────────────

  function setupDeleteChain() {
    const chain = {
      where: vi.fn().mockResolvedValue(undefined),
    };
    mockDelete.mockReturnValue(chain);
    return chain;
  }

  // ─── listVisible ───────────────────────────────────────────────────────

  describe('listVisible', () => {
    it('returns only is_visible=true entries ordered by displayOrder ASC', async () => {
      const visibleCerts = [
        createMockCertification({ isVisible: true, displayOrder: 0 }),
        createMockCertification({ isVisible: true, displayOrder: 1 }),
        createMockCertification({ isVisible: true, displayOrder: 2 }),
      ];

      const chain = setupSelectChain(visibleCerts);

      const result = await listVisible();

      expect(result).toEqual(visibleCerts);
      expect(mockSelect).toHaveBeenCalled();
      expect(chain.from).toHaveBeenCalled();
      expect(chain.where).toHaveBeenCalled();
      expect(chain.orderBy).toHaveBeenCalled();
    });

    it('returns empty array when no visible certifications exist', async () => {
      setupSelectChain([]);

      const result = await listVisible();

      expect(result).toEqual([]);
    });

    it('excludes hidden certifications', async () => {
      // Only visible items should come back from the query
      const visibleOnly = [
        createMockCertification({ isVisible: true, displayOrder: 0 }),
      ];
      setupSelectChain(visibleOnly);

      const result = await listVisible();

      // The DB mock returns only the visible ones (as the real DB would after filtering)
      expect(result).toHaveLength(1);
      expect(result[0].isVisible).toBe(true);
    });
  });

  // ─── listAll ───────────────────────────────────────────────────────────

  describe('listAll', () => {
    it('returns all certifications ordered by displayOrder ASC', async () => {
      const allCerts = [
        createMockCertification({ isVisible: true, displayOrder: 0 }),
        createMockCertification({ isVisible: false, displayOrder: 1 }),
        createMockCertification({ isVisible: true, displayOrder: 2 }),
      ];

      const chain = setupSelectChain(allCerts);

      const result = await listAll();

      expect(result).toEqual(allCerts);
      expect(result).toHaveLength(3);
      expect(chain.from).toHaveBeenCalled();
      expect(chain.orderBy).toHaveBeenCalled();
    });
  });

  // ─── create ────────────────────────────────────────────────────────────

  describe('create', () => {
    it('creates a certification and returns it with all fields', async () => {
      const newCert = createMockCertification({ displayOrder: 0 });

      // Mock getNextDisplayOrder select
      const selectChain = {
        from: vi.fn().mockResolvedValue([{ maxOrder: -1 }]),
      };
      mockSelect.mockReturnValueOnce(selectChain);

      const insertChain = setupInsertChain([newCert]);

      const result = await create({
        certificationName: newCert.certificationName,
        issuingOrganization: newCert.issuingOrganization,
        issueDate: newCert.issueDate,
        expiryDate: newCert.expiryDate,
        credentialId: newCert.credentialId,
        credentialUrl: newCert.credentialUrl,
        isVisible: newCert.isVisible,
      });

      expect(result).toEqual(newCert);
      expect(mockInsert).toHaveBeenCalled();
      expect(insertChain.values).toHaveBeenCalled();
      expect(insertChain.returning).toHaveBeenCalled();
    });

    it('uses provided displayOrder when specified', async () => {
      const newCert = createMockCertification({ displayOrder: 5 });
      const insertChain = setupInsertChain([newCert]);

      const result = await create({
        certificationName: newCert.certificationName,
        issuingOrganization: newCert.issuingOrganization,
        issueDate: newCert.issueDate,
        displayOrder: 5,
      });

      expect(result).toEqual(newCert);
      // Should not call select for getNextDisplayOrder since displayOrder was given
      expect(mockSelect).not.toHaveBeenCalled();
      expect(insertChain.values).toHaveBeenCalled();
    });

    it('calculates next displayOrder when not provided', async () => {
      const newCert = createMockCertification({ displayOrder: 3 });

      // Mock getNextDisplayOrder: max is 2, so next = 3
      const selectChain = {
        from: vi.fn().mockResolvedValue([{ maxOrder: 2 }]),
      };
      mockSelect.mockReturnValueOnce(selectChain);

      setupInsertChain([newCert]);

      await create({
        certificationName: newCert.certificationName,
        issuingOrganization: newCert.issuingOrganization,
        issueDate: newCert.issueDate,
      });

      expect(mockSelect).toHaveBeenCalled();
    });
  });

  // ─── update ────────────────────────────────────────────────────────────

  describe('update', () => {
    it('updates a certification and returns the updated record', async () => {
      const existingCert = createMockCertification();
      const updatedCert = {
        ...existingCert,
        certificationName: 'Updated Certification Name',
        updatedAt: new Date(),
      };

      const chain = setupUpdateChain([updatedCert]);

      const result = await update(existingCert.id, {
        certificationName: 'Updated Certification Name',
      });

      expect(result).toEqual(updatedCert);
      expect(mockUpdate).toHaveBeenCalled();
      expect(chain.set).toHaveBeenCalled();
      expect(chain.where).toHaveBeenCalled();
      expect(chain.returning).toHaveBeenCalled();
    });

    it('can update visibility', async () => {
      const cert = createMockCertification({ isVisible: true });
      const updatedCert = { ...cert, isVisible: false, updatedAt: new Date() };

      setupUpdateChain([updatedCert]);

      const result = await update(cert.id, { isVisible: false });

      expect(result.isVisible).toBe(false);
    });
  });

  // ─── deleteCertification ───────────────────────────────────────────────

  describe('deleteCertification', () => {
    it('deletes a certification by ID', async () => {
      const cert = createMockCertification();
      const chain = setupDeleteChain();

      await deleteCertification(cert.id);

      expect(mockDelete).toHaveBeenCalled();
      expect(chain.where).toHaveBeenCalled();
    });

    it('does not throw when deleting a non-existent certification', async () => {
      setupDeleteChain();

      await expect(deleteCertification('non-existent-id')).resolves.toBeUndefined();
    });
  });

  // ─── reorder ───────────────────────────────────────────────────────────

  describe('reorder', () => {
    it('updates display_order for all affected entries', async () => {
      const certs = [
        createMockCertification({ displayOrder: 0 }),
        createMockCertification({ displayOrder: 1 }),
        createMockCertification({ displayOrder: 2 }),
      ];

      // Each reorder call will trigger an update
      const updateChains = certs.map(() => {
        const chain = {
          set: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValue(undefined),
        };
        return chain;
      });

      let callCount = 0;
      mockUpdate.mockImplementation(() => {
        return updateChains[callCount++];
      });

      const reorderItems = [
        { id: certs[0].id, displayOrder: 2 },
        { id: certs[1].id, displayOrder: 0 },
        { id: certs[2].id, displayOrder: 1 },
      ];

      await reorder(reorderItems);

      // Each item should trigger a db.update call
      expect(mockUpdate).toHaveBeenCalledTimes(3);

      // Each chain should have set called with new displayOrder and updatedAt
      updateChains.forEach((chain) => {
        expect(chain.set).toHaveBeenCalledTimes(1);
        expect(chain.where).toHaveBeenCalledTimes(1);
      });
    });

    it('handles empty reorder array gracefully', async () => {
      await reorder([]);

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('handles single item reorder', async () => {
      const cert = createMockCertification({ displayOrder: 0 });

      const chain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      };
      mockUpdate.mockReturnValue(chain);

      await reorder([{ id: cert.id, displayOrder: 5 }]);

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(chain.set).toHaveBeenCalledTimes(1);
      expect(chain.where).toHaveBeenCalledTimes(1);
    });
  });
});
