import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { createMockProject, resetFactoryCounter } from '../utils/mock-factories';

// ─── Mocks ───────────────────────────────────────────────────────────────────

// Mock next-auth to avoid importing next/server in the test environment.
vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

// Mock next/cache so router revalidation calls are no-ops during tests.
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock the project service so the router is tested in isolation (no DB access).
const projectServiceMock = vi.hoisted(() => ({
  listPublished: vi.fn(),
  getBySlug: vi.fn(),
  listAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  deleteProject: vi.fn(),
  reorder: vi.fn(),
}));

vi.mock('@/server/services/project.service', () => projectServiceMock);

// ─── Import helpers after mocks are set up ─────────────────────────────────────

import {
  createAuthenticatedCaller,
  createUnauthenticatedCaller,
} from '../utils/trpc-test-helpers';

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * A minimally valid project creation input matching projectCreateSchema.
 */
function validCreateInput() {
  return {
    title: 'My Project',
    slug: 'my-project',
    description: 'A valid project description',
    category: 'web' as const,
  };
}

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('projects router (integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetFactoryCounter();
  });

  // ── Auth enforcement on protected procedures ────────────────────────────────

  describe('auth enforcement', () => {
    it('listAll rejects unauthenticated callers with UNAUTHORIZED', async () => {
      const caller = createUnauthenticatedCaller();

      await expect(caller.projects.listAll()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
      // Service must never be reached when auth fails.
      expect(projectServiceMock.listAll).not.toHaveBeenCalled();
    });

    it('create rejects unauthenticated callers with UNAUTHORIZED', async () => {
      const caller = createUnauthenticatedCaller();

      await expect(
        caller.projects.create(validCreateInput()),
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
      expect(projectServiceMock.create).not.toHaveBeenCalled();
    });

    it('update rejects unauthenticated callers with UNAUTHORIZED', async () => {
      const caller = createUnauthenticatedCaller();

      await expect(
        caller.projects.update({ id: 'project-1', title: 'Updated' }),
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
      expect(projectServiceMock.update).not.toHaveBeenCalled();
    });

    it('delete rejects unauthenticated callers with UNAUTHORIZED', async () => {
      const caller = createUnauthenticatedCaller();

      await expect(
        caller.projects.delete({ id: 'project-1' }),
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
      expect(projectServiceMock.deleteProject).not.toHaveBeenCalled();
    });

    it('reorder rejects unauthenticated callers with UNAUTHORIZED', async () => {
      const caller = createUnauthenticatedCaller();

      await expect(
        caller.projects.reorder([{ id: 'project-1', displayOrder: 0 }]),
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
      expect(projectServiceMock.reorder).not.toHaveBeenCalled();
    });

    it('throws a TRPCError instance for unauthenticated protected calls', async () => {
      const caller = createUnauthenticatedCaller();

      await expect(caller.projects.listAll()).rejects.toBeInstanceOf(TRPCError);
    });

    it('allows authenticated callers to reach protected procedures', async () => {
      const allProjects = [createMockProject(), createMockProject({ status: 'draft' })];
      projectServiceMock.listAll.mockResolvedValue(allProjects);

      const caller = createAuthenticatedCaller();
      const result = await caller.projects.listAll();

      expect(result).toEqual(allProjects);
      expect(projectServiceMock.listAll).toHaveBeenCalledOnce();
    });

    it('authenticated create delegates to the service with the validated input', async () => {
      const created = createMockProject({ title: 'My Project', slug: 'my-project' });
      projectServiceMock.create.mockResolvedValue(created);

      const caller = createAuthenticatedCaller();
      const result = await caller.projects.create(validCreateInput());

      expect(result).toEqual(created);
      expect(projectServiceMock.create).toHaveBeenCalledOnce();
    });
  });

  // ── Public procedures work without auth ──────────────────────────────────────

  describe('public procedures', () => {
    it('list returns published projects without authentication', async () => {
      const published = [
        createMockProject({ status: 'published' }),
        createMockProject({ status: 'published' }),
      ];
      projectServiceMock.listPublished.mockResolvedValue(published);

      const caller = createUnauthenticatedCaller();
      const result = await caller.projects.list();

      expect(result).toEqual(published);
      expect(projectServiceMock.listPublished).toHaveBeenCalledOnce();
    });

    it('getBySlug returns a project without authentication', async () => {
      const project = createMockProject({ slug: 'my-project', status: 'published' });
      projectServiceMock.getBySlug.mockResolvedValue(project);

      const caller = createUnauthenticatedCaller();
      const result = await caller.projects.getBySlug({ slug: 'my-project' });

      expect(result).toEqual(project);
      expect(projectServiceMock.getBySlug).toHaveBeenCalledWith('my-project');
    });

    it('getBySlug returns null when no matching project exists', async () => {
      projectServiceMock.getBySlug.mockResolvedValue(null);

      const caller = createUnauthenticatedCaller();
      const result = await caller.projects.getBySlug({ slug: 'missing' });

      expect(result).toBeNull();
    });
  });

  // ── Input validation ─────────────────────────────────────────────────────────

  describe('input validation', () => {
    it('create rejects missing required title with a BAD_REQUEST validation error', async () => {
      const caller = createAuthenticatedCaller();

      await expect(
        // @ts-expect-error - intentionally omitting required `title`
        caller.projects.create({ description: 'No title', category: 'web' }),
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
      expect(projectServiceMock.create).not.toHaveBeenCalled();
    });

    it('create rejects an invalid slug format with a validation error', async () => {
      const caller = createAuthenticatedCaller();

      await expect(
        caller.projects.create({
          title: 'My Project',
          slug: 'Invalid Slug!',
          description: 'A valid description',
          category: 'web',
        }),
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
      expect(projectServiceMock.create).not.toHaveBeenCalled();
    });

    it('create rejects an out-of-enum category with a validation error', async () => {
      const caller = createAuthenticatedCaller();

      await expect(
        caller.projects.create({
          title: 'My Project',
          description: 'A valid description',
          // @ts-expect-error - intentionally invalid category
          category: 'nonsense',
        }),
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
      expect(projectServiceMock.create).not.toHaveBeenCalled();
    });

    it('update rejects when required id is missing', async () => {
      const caller = createAuthenticatedCaller();

      await expect(
        // @ts-expect-error - intentionally omitting required `id`
        caller.projects.update({ title: 'Updated' }),
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
      expect(projectServiceMock.update).not.toHaveBeenCalled();
    });

    it('getBySlug rejects when slug is not a string', async () => {
      const caller = createUnauthenticatedCaller();

      await expect(
        // @ts-expect-error - intentionally passing wrong type
        caller.projects.getBySlug({ slug: 123 }),
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
      expect(projectServiceMock.getBySlug).not.toHaveBeenCalled();
    });

    it('throws a TRPCError instance for invalid input', async () => {
      const caller = createAuthenticatedCaller();

      try {
        await caller.projects.create({
          title: 'My Project',
          slug: 'Invalid Slug!',
          description: 'A valid description',
          category: 'web',
        });
        expect.unreachable('Expected validation to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect((error as TRPCError).code).toBe('BAD_REQUEST');
      }
    });
  });
});
