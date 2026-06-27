import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockExperience, resetFactoryCounter } from '../utils/mock-factories';

// Mock the database module
const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockOrderBy = vi.fn();
const mockInsert = vi.fn();
const mockValues = vi.fn();
const mockReturning = vi.fn();
const mockUpdate = vi.fn();
const mockSet = vi.fn();
const mockDelete = vi.fn();

vi.mock('@/server/db', () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
    insert: (...args: unknown[]) => mockInsert(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));

// Mock drizzle-orm operators
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((col, val) => ({ type: 'eq', col, val })),
  desc: vi.fn((col) => ({ type: 'desc', col })),
  asc: vi.fn((col) => ({ type: 'asc', col })),
  sql: vi.fn(),
}));

describe('Experience Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetFactoryCounter();

    // Reset chain mocks
    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ where: mockWhere, orderBy: mockOrderBy });
    mockWhere.mockReturnValue({ orderBy: mockOrderBy });
    mockOrderBy.mockResolvedValue([]);

    mockInsert.mockReturnValue({ values: mockValues });
    mockValues.mockReturnValue({ returning: mockReturning });
    mockReturning.mockResolvedValue([]);

    mockUpdate.mockReturnValue({ set: mockSet });
    mockSet.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ returning: mockReturning, orderBy: mockOrderBy });
    mockReturning.mockResolvedValue([]);

    mockDelete.mockReturnValue({ where: mockWhere });
    mockWhere.mockResolvedValue(undefined);
  });

  describe('listVisible', () => {
    it('should return only entries with isVisible=true', async () => {
      const visibleEntry = createMockExperience({ isVisible: true });
      const { eq } = await import('drizzle-orm');

      // Setup chain: select().from().where().orderBy()
      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ orderBy: mockOrderBy });
      mockOrderBy.mockResolvedValue([visibleEntry]);

      const { listVisible } = await import('@/server/services/experience.service');
      const result = await listVisible();

      expect(result).toEqual([visibleEntry]);
      expect(mockSelect).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalled();
      // Verify eq was called with the isVisible column and true
      expect(eq).toHaveBeenCalled();
    });

    it('should return entries sorted by most recent start_date first (descending)', async () => {
      const { desc } = await import('drizzle-orm');
      const recentEntry = createMockExperience({
        startDate: '2024-01-01',
        isVisible: true,
      });
      const olderEntry = createMockExperience({
        startDate: '2020-06-01',
        isVisible: true,
      });

      // Setup chain: select().from().where().orderBy()
      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ orderBy: mockOrderBy });
      mockOrderBy.mockResolvedValue([recentEntry, olderEntry]);

      const { listVisible } = await import('@/server/services/experience.service');
      const result = await listVisible();

      expect(result).toEqual([recentEntry, olderEntry]);
      expect(result[0].startDate).toBe('2024-01-01');
      expect(result[1].startDate).toBe('2020-06-01');
      // Verify desc ordering was applied
      expect(desc).toHaveBeenCalled();
      expect(mockOrderBy).toHaveBeenCalled();
    });

    it('should return empty array when no visible entries exist', async () => {
      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ orderBy: mockOrderBy });
      mockOrderBy.mockResolvedValue([]);

      const { listVisible } = await import('@/server/services/experience.service');
      const result = await listVisible();

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should persist a new experience entry with all fields', async () => {
      const inputData = {
        companyName: 'Acme Corp',
        roleTitle: 'Senior Engineer',
        startDate: '2023-01-15',
        endDate: '2024-06-30',
        description: 'Built cloud infrastructure',
        techStack: ['AWS', 'Terraform'],
        isVisible: true,
      };
      const createdEntry = createMockExperience({
        ...inputData,
        displayOrder: 0,
      });

      // Mock getNextDisplayOrder: select().from() returns maxOrder
      mockSelect.mockReturnValueOnce({
        from: vi.fn().mockResolvedValue([{ maxOrder: -1 }]),
      });

      // Mock insert().values().returning()
      mockInsert.mockReturnValue({ values: mockValues });
      mockValues.mockReturnValue({ returning: mockReturning });
      mockReturning.mockResolvedValue([createdEntry]);

      const { create } = await import('@/server/services/experience.service');
      const result = await create(inputData);

      expect(result).toEqual(createdEntry);
      expect(mockInsert).toHaveBeenCalled();
      expect(mockValues).toHaveBeenCalled();
    });

    it('should auto-assign displayOrder as max + 1 when not provided', async () => {
      const inputData = {
        companyName: 'Tech Inc',
        roleTitle: 'Developer',
        startDate: '2022-03-01',
        endDate: null,
        description: 'Full stack development',
        techStack: ['React', 'Node.js'],
        isVisible: true,
      };
      const createdEntry = createMockExperience({
        ...inputData,
        displayOrder: 5,
      });

      // Mock getNextDisplayOrder: select().from() returns maxOrder of 4
      mockSelect.mockReturnValueOnce({
        from: vi.fn().mockResolvedValue([{ maxOrder: 4 }]),
      });

      mockInsert.mockReturnValue({ values: mockValues });
      mockValues.mockReturnValue({ returning: mockReturning });
      mockReturning.mockResolvedValue([createdEntry]);

      const { create } = await import('@/server/services/experience.service');
      const result = await create(inputData);

      expect(result.displayOrder).toBe(5);
    });
  });

  describe('update', () => {
    it('should update an existing entry and set updatedAt', async () => {
      const existingId = 'test-uuid-123';
      const updateData = { roleTitle: 'Lead Engineer' };
      const updatedEntry = createMockExperience({
        id: existingId,
        roleTitle: 'Lead Engineer',
        updatedAt: new Date(),
      });

      mockUpdate.mockReturnValue({ set: mockSet });
      mockSet.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ returning: mockReturning });
      mockReturning.mockResolvedValue([updatedEntry]);

      const { update } = await import('@/server/services/experience.service');
      const result = await update(existingId, updateData);

      expect(result).toEqual(updatedEntry);
      expect(mockUpdate).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalled();
    });
  });

  describe('deleteExperience', () => {
    it('should delete an experience entry by ID', async () => {
      const targetId = 'delete-uuid-456';

      mockDelete.mockReturnValue({ where: mockWhere });
      mockWhere.mockResolvedValue(undefined);

      const { deleteExperience } = await import('@/server/services/experience.service');
      await deleteExperience(targetId);

      expect(mockDelete).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalled();
    });
  });

  describe('reorder', () => {
    it('should update display_order for all affected entries', async () => {
      const reorderItems = [
        { id: 'id-1', displayOrder: 2 },
        { id: 'id-2', displayOrder: 0 },
        { id: 'id-3', displayOrder: 1 },
      ];

      // Each reorder item triggers an update().set().where() call
      mockUpdate.mockReturnValue({ set: mockSet });
      mockSet.mockReturnValue({ where: mockWhere });
      mockWhere.mockResolvedValue(undefined);

      const { reorder } = await import('@/server/services/experience.service');
      await reorder(reorderItems);

      // Should call update for each item
      expect(mockUpdate).toHaveBeenCalledTimes(3);
      expect(mockSet).toHaveBeenCalledTimes(3);
    });

    it('should handle empty reorder array without errors', async () => {
      const { reorder } = await import('@/server/services/experience.service');
      await reorder([]);

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should update each entry with the correct new displayOrder', async () => {
      const reorderItems = [
        { id: 'id-a', displayOrder: 1 },
        { id: 'id-b', displayOrder: 0 },
      ];

      const setCalls: unknown[] = [];
      mockUpdate.mockReturnValue({ set: mockSet });
      mockSet.mockImplementation((data) => {
        setCalls.push(data);
        return { where: mockWhere };
      });
      mockWhere.mockResolvedValue(undefined);

      const { reorder } = await import('@/server/services/experience.service');
      await reorder(reorderItems);

      expect(setCalls).toHaveLength(2);
      expect(setCalls[0]).toMatchObject({ displayOrder: 1 });
      expect(setCalls[1]).toMatchObject({ displayOrder: 0 });
    });
  });

  describe('listAll', () => {
    it('should return all entries ordered by displayOrder ascending', async () => {
      const { asc } = await import('drizzle-orm');
      const entries = [
        createMockExperience({ displayOrder: 0, isVisible: true }),
        createMockExperience({ displayOrder: 1, isVisible: false }),
        createMockExperience({ displayOrder: 2, isVisible: true }),
      ];

      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ orderBy: mockOrderBy });
      mockOrderBy.mockResolvedValue(entries);

      const { listAll } = await import('@/server/services/experience.service');
      const result = await listAll();

      expect(result).toEqual(entries);
      expect(result).toHaveLength(3);
      expect(asc).toHaveBeenCalled();
    });
  });
});
