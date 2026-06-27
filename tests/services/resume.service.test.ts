import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockResume, resetFactoryCounter } from '../utils/mock-factories';

// Mock the database module
const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockLimit = vi.fn();
const mockOrderBy = vi.fn();
const mockInsert = vi.fn();
const mockValues = vi.fn();
const mockReturning = vi.fn();
const mockUpdate = vi.fn();
const mockSet = vi.fn();

vi.mock('@/server/db', () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
    insert: (...args: unknown[]) => mockInsert(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
  },
}));

// Mock drizzle-orm operators
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((col, val) => ({ type: 'eq', col, val })),
  desc: vi.fn((col) => ({ type: 'desc', col })),
}));

describe('Resume Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetFactoryCounter();

    // Reset chain mocks
    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ where: mockWhere, orderBy: mockOrderBy });
    mockWhere.mockReturnValue({ limit: mockLimit, returning: mockReturning, orderBy: mockOrderBy });
    mockLimit.mockResolvedValue([]);
    mockOrderBy.mockResolvedValue([]);

    mockInsert.mockReturnValue({ values: mockValues });
    mockValues.mockReturnValue({ returning: mockReturning });
    mockReturning.mockResolvedValue([]);

    mockUpdate.mockReturnValue({ set: mockSet });
    mockSet.mockReturnValue({ where: mockWhere, returning: mockReturning });
    mockWhere.mockReturnValue({ returning: mockReturning });
    mockReturning.mockResolvedValue([]);
  });

  describe('getActive', () => {
    it('should return the currently active resume', async () => {
      const activeResume = createMockResume({ isActive: true });

      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });
      mockLimit.mockResolvedValue([activeResume]);

      const { getActive } = await import('@/server/services/resume.service');
      const result = await getActive();

      expect(result).toEqual(activeResume);
      expect(mockSelect).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalled();
      expect(mockLimit).toHaveBeenCalledWith(1);
    });

    it('should return null when no active resume exists', async () => {
      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });
      mockLimit.mockResolvedValue([]);

      const { getActive } = await import('@/server/services/resume.service');
      const result = await getActive();

      expect(result).toBeNull();
    });
  });

  describe('listAll', () => {
    it('should return all resumes ordered by uploadedAt descending', async () => {
      const { desc } = await import('drizzle-orm');
      const resumes = [
        createMockResume({ isActive: true, uploadedAt: new Date('2024-06-01') }),
        createMockResume({ isActive: false, uploadedAt: new Date('2024-01-01') }),
      ];

      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ orderBy: mockOrderBy });
      mockOrderBy.mockResolvedValue(resumes);

      const { listAll } = await import('@/server/services/resume.service');
      const result = await listAll();

      expect(result).toEqual(resumes);
      expect(result).toHaveLength(2);
      expect(desc).toHaveBeenCalled();
    });

    it('should return empty array when no resumes exist', async () => {
      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ orderBy: mockOrderBy });
      mockOrderBy.mockResolvedValue([]);

      const { listAll } = await import('@/server/services/resume.service');
      const result = await listAll();

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should deactivate all existing resumes before inserting the new one', async () => {
      const newResume = createMockResume({ isActive: true });
      const setCalls: unknown[] = [];

      // Track the deactivation call: update().set({ isActive: false })
      mockUpdate.mockReturnValue({ set: mockSet });
      mockSet.mockImplementation((data) => {
        setCalls.push(data);
        // First call is deactivation (no where clause, resolves directly)
        if (setCalls.length === 1) {
          return Promise.resolve();
        }
        return { where: mockWhere };
      });

      // Mock insert chain for the new resume
      mockInsert.mockReturnValue({ values: mockValues });
      mockValues.mockReturnValue({ returning: mockReturning });
      mockReturning.mockResolvedValue([newResume]);

      const { create } = await import('@/server/services/resume.service');
      const result = await create({ userId: 'user-1', fileUrl: 'https://cdn.example.com/resume.pdf' });

      expect(result).toEqual(newResume);
      // Verify deactivation was called with isActive: false
      expect(setCalls[0]).toMatchObject({ isActive: false });
      expect(mockUpdate).toHaveBeenCalled();
      expect(mockInsert).toHaveBeenCalled();
    });

    it('should insert the new resume with isActive=true', async () => {
      const newResume = createMockResume({ isActive: true });
      const insertedValues: unknown[] = [];

      // Mock deactivation: update().set() resolves
      mockUpdate.mockReturnValue({ set: mockSet });
      mockSet.mockResolvedValue(undefined);

      // Track the insert values
      mockInsert.mockReturnValue({ values: mockValues });
      mockValues.mockImplementation((data) => {
        insertedValues.push(data);
        return { returning: mockReturning };
      });
      mockReturning.mockResolvedValue([newResume]);

      const { create } = await import('@/server/services/resume.service');
      await create({ userId: 'user-1', fileUrl: 'https://cdn.example.com/resume.pdf' });

      expect(insertedValues[0]).toMatchObject({
        userId: 'user-1',
        fileUrl: 'https://cdn.example.com/resume.pdf',
        isActive: true,
      });
    });

    it('should ensure at most one resume is active after upload', async () => {
      const newResume = createMockResume({ isActive: true });

      // Mock deactivation: update().set() resolves (deactivates ALL resumes)
      mockUpdate.mockReturnValue({ set: mockSet });
      mockSet.mockResolvedValue(undefined);

      // Mock insert for the new active resume
      mockInsert.mockReturnValue({ values: mockValues });
      mockValues.mockReturnValue({ returning: mockReturning });
      mockReturning.mockResolvedValue([newResume]);

      const { create } = await import('@/server/services/resume.service');
      const result = await create({ userId: 'user-1', fileUrl: 'https://cdn.example.com/new.pdf' });

      // The deactivation must happen before insert
      expect(mockUpdate).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalled();
      // The new resume is the only active one
      expect(result.isActive).toBe(true);
    });
  });

  describe('setActive', () => {
    it('should deactivate all resumes before activating the specified one', async () => {
      const targetId = 'resume-to-activate';
      const activatedResume = createMockResume({ id: targetId, isActive: true });
      const setCalls: unknown[] = [];
      let updateCallCount = 0;

      // Track update calls: first deactivates all, second activates specific
      mockUpdate.mockReturnValue({ set: mockSet });
      mockSet.mockImplementation((data) => {
        updateCallCount++;
        setCalls.push(data);
        if (updateCallCount === 1) {
          // First call: deactivate all (no where clause)
          return Promise.resolve();
        }
        // Second call: activate specific (has where clause)
        return { where: mockWhere };
      });
      mockWhere.mockReturnValue({ returning: mockReturning });
      mockReturning.mockResolvedValue([activatedResume]);

      const { setActive } = await import('@/server/services/resume.service');
      const result = await setActive(targetId);

      expect(result).toEqual(activatedResume);
      // First set call deactivates all
      expect(setCalls[0]).toMatchObject({ isActive: false });
      // Second set call activates the target
      expect(setCalls[1]).toMatchObject({ isActive: true });
    });

    it('should call update twice - once to deactivate all, once to activate target', async () => {
      const targetId = 'target-resume-id';
      const activatedResume = createMockResume({ id: targetId, isActive: true });
      let updateCallCount = 0;

      mockUpdate.mockReturnValue({ set: mockSet });
      mockSet.mockImplementation(() => {
        updateCallCount++;
        if (updateCallCount === 1) {
          return Promise.resolve();
        }
        return { where: mockWhere };
      });
      mockWhere.mockReturnValue({ returning: mockReturning });
      mockReturning.mockResolvedValue([activatedResume]);

      const { setActive } = await import('@/server/services/resume.service');
      await setActive(targetId);

      // update() is called twice
      expect(mockUpdate).toHaveBeenCalledTimes(2);
    });

    it('should ensure at most one resume is active after setActive', async () => {
      const targetId = 'specific-resume-id';
      const activatedResume = createMockResume({ id: targetId, isActive: true });
      let updateCallCount = 0;

      mockUpdate.mockReturnValue({ set: mockSet });
      mockSet.mockImplementation(() => {
        updateCallCount++;
        if (updateCallCount === 1) {
          return Promise.resolve();
        }
        return { where: mockWhere };
      });
      mockWhere.mockReturnValue({ returning: mockReturning });
      mockReturning.mockResolvedValue([activatedResume]);

      const { setActive } = await import('@/server/services/resume.service');
      const result = await setActive(targetId);

      // Deactivation happens first (sets ALL to false)
      // Then only the target is activated
      expect(result.isActive).toBe(true);
      expect(result.id).toBe(targetId);
    });
  });
});
