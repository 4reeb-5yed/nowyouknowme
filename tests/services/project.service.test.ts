import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockProject, resetFactoryCounter } from '../utils/mock-factories';

// ─── Mock the database module ──────────────────────────────────────────────────

/**
 * Creates a chainable mock that simulates Drizzle's query builder pattern.
 * Each method returns `this` so calls like db.select().from().where() work.
 * The final call in the chain resolves to `resolveValue`.
 */
function createChainableMock(resolveValue: unknown = []) {
  const mock: Record<string, unknown> = {};
  const handler: ProxyHandler<Record<string, unknown>> = {
    get(_target, prop) {
      if (prop === 'then') {
        // Make the proxy thenable so `await` resolves it
        return (resolve: (v: unknown) => void) => resolve(resolveValue);
      }
      // Every property access returns a function that returns the proxy again
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

import {
  create,
  update,
  deleteProject,
  reorder,
  listPublished,
  listAll,
  getBySlug,
} from '@/server/services/project.service';

// ─── Helpers ────────────────────────────────────────────────────────────────────

function setupSelectChain(resolveValue: unknown = []) {
  const chain = createChainableMock(resolveValue);
  mockDb.select.mockReturnValue(chain);
  return chain;
}

function setupInsertChain(resolveValue: unknown = []) {
  const chain = createChainableMock(resolveValue);
  mockDb.insert.mockReturnValue(chain);
  return chain;
}

function setupUpdateChain(resolveValue: unknown = []) {
  const chain = createChainableMock(resolveValue);
  mockDb.update.mockReturnValue(chain);
  return chain;
}

function setupDeleteChain(resolveValue: unknown = undefined) {
  const chain = createChainableMock(resolveValue);
  mockDb.delete.mockReturnValue(chain);
  return chain;
}

// ─── Tests ──────────────────────────────────────────────────────────────────────

describe('project.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetFactoryCounter();
  });

  describe('create', () => {
    it('persists all fields correctly and returns the created project', async () => {
      const mockProject = createMockProject({
        title: 'New Project',
        slug: 'new-project',
        description: 'A test project',
        category: 'web',
        techStack: ['TypeScript', 'React'],
        githubUrl: 'https://github.com/user/new-project',
        liveUrl: 'https://new-project.example.com',
        thumbnailUrl: 'https://cdn.example.com/thumb.webp',
        isFeatured: true,
        status: 'draft',
        displayOrder: 0,
      });

      // First select: generateUniqueSlug checks for existing slug (none found)
      // Second select: getNextDisplayOrder gets max display_order
      let selectCallCount = 0;
      mockDb.select.mockImplementation(() => {
        selectCallCount++;
        if (selectCallCount === 1) {
          // slug check - no existing project with this slug
          return createChainableMock([]);
        }
        // getNextDisplayOrder - no existing projects
        return createChainableMock([{ maxOrder: -1 }]);
      });

      // Insert returns the created project
      setupInsertChain([mockProject]);

      const result = await create({
        title: 'New Project',
        description: 'A test project',
        category: 'web',
        techStack: ['TypeScript', 'React'],
        githubUrl: 'https://github.com/user/new-project',
        liveUrl: 'https://new-project.example.com',
        thumbnailUrl: 'https://cdn.example.com/thumb.webp',
        isFeatured: true,
        status: 'draft',
      });

      expect(result).toEqual(mockProject);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('auto-generates slug from title when slug is not provided', async () => {
      const mockProject = createMockProject({
        title: 'My Cool Project',
        slug: 'my-cool-project',
      });

      // slug check returns empty (no conflict)
      mockDb.select.mockImplementation(() => {
        return createChainableMock([]);
      });

      // Override for the second call to return maxOrder
      let selectCallCount = 0;
      mockDb.select.mockImplementation(() => {
        selectCallCount++;
        if (selectCallCount <= 1) {
          return createChainableMock([]);
        }
        return createChainableMock([{ maxOrder: 2 }]);
      });

      setupInsertChain([mockProject]);

      const result = await create({
        title: 'My Cool Project',
        description: 'A cool project',
        category: 'web',
      });

      expect(result).toEqual(mockProject);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('assigns next display order when not provided', async () => {
      const mockProject = createMockProject({ displayOrder: 5 });

      let selectCallCount = 0;
      mockDb.select.mockImplementation(() => {
        selectCallCount++;
        if (selectCallCount === 1) {
          return createChainableMock([]);
        }
        // max displayOrder is 4, so next should be 5
        return createChainableMock([{ maxOrder: 4 }]);
      });

      setupInsertChain([mockProject]);

      const result = await create({
        title: 'Another Project',
        description: 'Description',
        category: 'cloud',
      });

      expect(result.displayOrder).toBe(5);
    });

    it('enforces slug uniqueness by appending suffix when slug already exists', async () => {
      const mockProject = createMockProject({ slug: 'my-project-1' });

      let selectCallCount = 0;
      mockDb.select.mockImplementation(() => {
        selectCallCount++;
        if (selectCallCount === 1) {
          // First slug check: "my-project" exists
          return createChainableMock([{ id: 'existing-id' }]);
        }
        if (selectCallCount === 2) {
          // Second slug check: "my-project-1" does not exist
          return createChainableMock([]);
        }
        // getNextDisplayOrder
        return createChainableMock([{ maxOrder: -1 }]);
      });

      setupInsertChain([mockProject]);

      const result = await create({
        title: 'My Project',
        description: 'Duplicate slug test',
        category: 'web',
      });

      expect(result.slug).toBe('my-project-1');
    });
  });

  describe('update', () => {
    it('updates the project and sets updatedAt', async () => {
      const updatedProject = createMockProject({
        id: 'project-123',
        title: 'Updated Title',
        updatedAt: new Date(),
      });

      setupUpdateChain([updatedProject]);

      const result = await update('project-123', { title: 'Updated Title' });

      expect(result).toEqual(updatedProject);
      expect(mockDb.update).toHaveBeenCalled();
    });

    it('enforces slug uniqueness on update by excluding current project id', async () => {
      const updatedProject = createMockProject({
        id: 'project-123',
        slug: 'new-slug',
      });

      // slug check - no conflict (excluding current project)
      setupSelectChain([]);
      setupUpdateChain([updatedProject]);

      const result = await update('project-123', { slug: 'new-slug' });

      expect(result.slug).toBe('new-slug');
      expect(mockDb.select).toHaveBeenCalled();
    });

    it('appends suffix when updating slug to one that already exists', async () => {
      const updatedProject = createMockProject({
        id: 'project-123',
        slug: 'existing-slug-1',
      });

      let selectCallCount = 0;
      mockDb.select.mockImplementation(() => {
        selectCallCount++;
        if (selectCallCount === 1) {
          // "existing-slug" is taken by another project
          return createChainableMock([{ id: 'other-project-id' }]);
        }
        // "existing-slug-1" is available
        return createChainableMock([]);
      });

      setupUpdateChain([updatedProject]);

      const result = await update('project-123', { slug: 'existing-slug' });

      expect(result.slug).toBe('existing-slug-1');
    });

    it('allows status transition from draft to published', async () => {
      const publishedProject = createMockProject({
        id: 'project-123',
        status: 'published',
      });

      setupUpdateChain([publishedProject]);

      const result = await update('project-123', { status: 'published' });

      expect(result.status).toBe('published');
      expect(mockDb.update).toHaveBeenCalled();
    });

    it('allows status transition from published to draft', async () => {
      const draftProject = createMockProject({
        id: 'project-123',
        status: 'draft',
      });

      setupUpdateChain([draftProject]);

      const result = await update('project-123', { status: 'draft' });

      expect(result.status).toBe('draft');
      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe('deleteProject', () => {
    it('deletes the project by id', async () => {
      setupDeleteChain(undefined);

      await deleteProject('project-123');

      expect(mockDb.delete).toHaveBeenCalled();
    });

    it('does not throw when deleting a non-existent id', async () => {
      setupDeleteChain(undefined);

      await expect(deleteProject('non-existent-id')).resolves.toBeUndefined();
    });
  });

  describe('reorder', () => {
    it('updates display order for all items in the list', async () => {
      setupUpdateChain(undefined);

      const items = [
        { id: 'project-1', displayOrder: 0 },
        { id: 'project-2', displayOrder: 1 },
        { id: 'project-3', displayOrder: 2 },
      ];

      await reorder(items);

      // reorder calls db.update for each item via Promise.all
      expect(mockDb.update).toHaveBeenCalledTimes(3);
    });

    it('handles empty reorder list without errors', async () => {
      await reorder([]);

      expect(mockDb.update).not.toHaveBeenCalled();
    });

    it('handles single item reorder', async () => {
      setupUpdateChain(undefined);

      await reorder([{ id: 'project-1', displayOrder: 0 }]);

      expect(mockDb.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('listPublished', () => {
    it('returns only published projects', async () => {
      const publishedProjects = [
        createMockProject({ status: 'published', displayOrder: 0 }),
        createMockProject({ status: 'published', displayOrder: 1 }),
      ];

      setupSelectChain(publishedProjects);

      const result = await listPublished();

      expect(result).toEqual(publishedProjects);
      expect(mockDb.select).toHaveBeenCalled();
    });

    it('returns empty array when no published projects exist', async () => {
      setupSelectChain([]);

      const result = await listPublished();

      expect(result).toEqual([]);
    });
  });

  describe('listAll', () => {
    it('returns all projects including drafts', async () => {
      const allProjects = [
        createMockProject({ status: 'published', displayOrder: 0 }),
        createMockProject({ status: 'draft', displayOrder: 1 }),
      ];

      setupSelectChain(allProjects);

      const result = await listAll();

      expect(result).toEqual(allProjects);
      expect(mockDb.select).toHaveBeenCalled();
    });
  });

  describe('getBySlug', () => {
    it('returns a project when slug matches a published project', async () => {
      const project = createMockProject({ slug: 'my-project', status: 'published' });

      setupSelectChain([project]);

      const result = await getBySlug('my-project');

      expect(result).toEqual(project);
    });

    it('returns null when no project matches the slug', async () => {
      setupSelectChain([]);

      const result = await getBySlug('non-existent');

      expect(result).toBeNull();
    });
  });
});
