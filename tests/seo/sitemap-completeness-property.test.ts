import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { createMockProject, type MockProject } from '../utils/mock-factories';

/**
 * Property 10: Sitemap Completeness
 *
 * FOR ALL published Projects, THE sitemap.xml generator SHALL include a
 * corresponding URL entry, and FOR ALL draft Projects, THE generator SHALL
 * exclude them.
 *
 * **Validates: Requirements 9.3, 9.4**
 *
 * The sitemap sources its dynamic project URLs from `listPublished`, which by
 * contract returns only published projects. These tests model that contract by
 * feeding the mocked `listPublished` exactly the published subset of an
 * arbitrary mixed dataset, then asserting the generated sitemap contains a URL
 * for every published project (completeness), none for drafts (exclusion), and
 * all static pages.
 */

// ─── Mock the project service (source of published projects) ──────────────────

const mockListPublished = vi.hoisted(() => vi.fn());

vi.mock('@/server/services/project.service', () => ({
  listPublished: mockListPublished,
}));

// ─── Import after mocks are set up ────────────────────────────────────────────

import sitemap from '@/app/sitemap';

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const STATIC_PATHS = [
  '', // homepage
  '/about',
  '/projects',
  '/experience',
  '/certifications',
  '/contact',
];

function staticUrl(path: string): string {
  return path === '' ? BASE_URL : `${BASE_URL}${path}`;
}

function projectUrl(slug: string): string {
  return `${BASE_URL}/projects/${slug}`;
}

// ─── Generators ───────────────────────────────────────────────────────────────

// URL-safe slug fragment matching the project slug regex (a-z, 0-9, hyphens).
const slugArb = fc
  .array(
    fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789'.split('')),
    { minLength: 1, maxLength: 12 }
  )
  .map((chars) => chars.join(''));

// An arbitrary project carrying a unique slug and an explicit status.
const projectArb = (status: MockProject['status']) =>
  slugArb.map((slug) => createMockProject({ slug, status }));

// A mixed dataset of projects with unique slugs across both statuses.
const mixedProjectsArb = fc
  .uniqueArray(
    fc.record({
      slug: slugArb,
      status: fc.constantFrom<MockProject['status']>('published', 'draft'),
    }),
    { selector: (p) => p.slug, maxLength: 40 }
  )
  .map((specs) => specs.map(({ slug, status }) => createMockProject({ slug, status })));

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('Property 10: Sitemap Completeness', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('includes exactly the published set of projects and excludes drafts', async () => {
    await fc.assert(
      fc.asyncProperty(mixedProjectsArb, async (allProjects) => {
        // listPublished returns only published projects, per its contract.
        const published = allProjects.filter((p) => p.status === 'published');
        const drafts = allProjects.filter((p) => p.status === 'draft');
        mockListPublished.mockResolvedValue(published);

        const entries = await sitemap();
        const urls = entries.map((e) => e.url);
        const projectUrls = urls.filter((u) =>
          u.startsWith(`${BASE_URL}/projects/`)
        );

        // Completeness: every published project has a corresponding URL.
        for (const project of published) {
          expect(urls).toContain(projectUrl(project.slug));
        }

        // Exclusion: no draft project URL appears.
        for (const draft of drafts) {
          expect(projectUrls).not.toContain(projectUrl(draft.slug));
        }

        // Exactness: the project detail URLs are precisely the published set.
        expect(projectUrls.sort()).toEqual(
          published.map((p) => projectUrl(p.slug)).sort()
        );
      })
    );
  });

  it('always includes every static page alongside the published projects', async () => {
    await fc.assert(
      fc.asyncProperty(mixedProjectsArb, async (allProjects) => {
        const published = allProjects.filter((p) => p.status === 'published');
        mockListPublished.mockResolvedValue(published);

        const entries = await sitemap();
        const urls = entries.map((e) => e.url);

        // All static pages are present regardless of the project dataset.
        for (const path of STATIC_PATHS) {
          expect(urls).toContain(staticUrl(path));
        }

        // Total entry count is exactly static pages + published projects.
        expect(entries).toHaveLength(STATIC_PATHS.length + published.length);
      })
    );
  });
});
