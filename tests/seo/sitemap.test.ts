import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockProject, resetFactoryCounter } from '../utils/mock-factories';

// ─── Mock the project service (source of published projects) ──────────────────

const mockListPublished = vi.hoisted(() => vi.fn());

vi.mock('@/server/services/project.service', () => ({
  listPublished: mockListPublished,
}));

// ─── Import after mocks are set up ────────────────────────────────────────────

import sitemap from '@/app/sitemap';

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('sitemap generation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetFactoryCounter();
  });

  describe('static pages', () => {
    it('includes all static pages', async () => {
      mockListPublished.mockResolvedValue([]);

      const entries = await sitemap();
      const urls = entries.map((e) => e.url);

      for (const path of STATIC_PATHS) {
        expect(urls).toContain(staticUrl(path));
      }
    });

    it('includes the homepage with the highest priority', async () => {
      mockListPublished.mockResolvedValue([]);

      const entries = await sitemap();
      const home = entries.find((e) => e.url === BASE_URL);

      expect(home).toBeDefined();
      expect(home?.priority).toBe(1);
    });

    it('renders all static pages even when there are no published projects', async () => {
      mockListPublished.mockResolvedValue([]);

      const entries = await sitemap();

      expect(entries).toHaveLength(STATIC_PATHS.length);
    });

    it('assigns a valid changeFrequency to every static page', async () => {
      mockListPublished.mockResolvedValue([]);

      const validFrequencies = [
        'always',
        'hourly',
        'daily',
        'weekly',
        'monthly',
        'yearly',
        'never',
      ];

      const entries = await sitemap();

      for (const entry of entries) {
        expect(validFrequencies).toContain(entry.changeFrequency);
      }
    });
  });

  describe('published projects', () => {
    it('includes a URL for every published project', async () => {
      const published = [
        createMockProject({ slug: 'alpha', status: 'published' }),
        createMockProject({ slug: 'beta', status: 'published' }),
        createMockProject({ slug: 'gamma', status: 'published' }),
      ];
      mockListPublished.mockResolvedValue(published);

      const entries = await sitemap();
      const urls = entries.map((e) => e.url);

      for (const project of published) {
        expect(urls).toContain(`${BASE_URL}/projects/${project.slug}`);
      }
    });

    it('uses the project updatedAt as lastModified', async () => {
      const updatedAt = new Date('2024-05-20T10:00:00Z');
      const project = createMockProject({ slug: 'alpha', updatedAt });
      mockListPublished.mockResolvedValue([project]);

      const entries = await sitemap();
      const entry = entries.find(
        (e) => e.url === `${BASE_URL}/projects/alpha`
      );

      expect(entry?.lastModified).toEqual(updatedAt);
    });

    it('produces one entry per published project in addition to static pages', async () => {
      const published = [
        createMockProject({ slug: 'alpha' }),
        createMockProject({ slug: 'beta' }),
      ];
      mockListPublished.mockResolvedValue(published);

      const entries = await sitemap();

      expect(entries).toHaveLength(STATIC_PATHS.length + published.length);
    });
  });

  describe('draft projects', () => {
    it('excludes projects that are not returned by listPublished', async () => {
      // listPublished only returns published projects; drafts never appear here.
      const published = createMockProject({ slug: 'published-one', status: 'published' });
      mockListPublished.mockResolvedValue([published]);

      // A draft project that the service would have filtered out.
      const draft = createMockProject({ slug: 'secret-draft', status: 'draft' });

      const entries = await sitemap();
      const urls = entries.map((e) => e.url);

      expect(urls).toContain(`${BASE_URL}/projects/published-one`);
      expect(urls).not.toContain(`${BASE_URL}/projects/${draft.slug}`);
    });

    it('sources project URLs exclusively from the published list', async () => {
      mockListPublished.mockResolvedValue([]);

      const entries = await sitemap();
      const projectDetailUrls = entries
        .map((e) => e.url)
        .filter((url) => url.startsWith(`${BASE_URL}/projects/`));

      // With no published projects, no project detail URLs should exist.
      expect(projectDetailUrls).toEqual([]);
      expect(mockListPublished).toHaveBeenCalledTimes(1);
    });
  });
});
