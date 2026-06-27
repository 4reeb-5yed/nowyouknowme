import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the env config so the sitemap URL is deterministic and we don't depend on
// real environment variables being present during the test run.
vi.mock('@/config/env', () => ({
  clientEnv: {
    NEXT_PUBLIC_APP_URL: 'https://portfolio.example.com',
  },
}));

describe('robots.txt generation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows crawling of public pages from the site root', async () => {
    const { default: robots } = await import('@/app/robots');
    const result = robots();

    // rules is a single object (not an array) in this implementation
    expect(Array.isArray(result.rules)).toBe(false);
    const rules = result.rules as Exclude<typeof result.rules, unknown[]>;

    expect(rules.allow).toBe('/');
  });

  it('disallows the /admin/ CMS routes', async () => {
    const { default: robots } = await import('@/app/robots');
    const result = robots();

    const rules = result.rules as Exclude<typeof result.rules, unknown[]>;

    expect(rules.disallow).toBe('/admin/');
  });

  it('applies the rules to all crawlers via a wildcard user agent', async () => {
    const { default: robots } = await import('@/app/robots');
    const result = robots();

    const rules = result.rules as Exclude<typeof result.rules, unknown[]>;

    expect(rules.userAgent).toBe('*');
  });

  it('references the sitemap using the configured app URL', async () => {
    const { default: robots } = await import('@/app/robots');
    const result = robots();

    expect(result.sitemap).toBe('https://portfolio.example.com/sitemap.xml');
  });

  it('returns a valid Robots object with both rules and a sitemap', async () => {
    const { default: robots } = await import('@/app/robots');
    const result = robots();

    expect(result).toHaveProperty('rules');
    expect(result).toHaveProperty('sitemap');
    expect(result.rules).toBeDefined();
  });

  it('does not allow indexing of admin routes while still allowing public pages', async () => {
    const { default: robots } = await import('@/app/robots');
    const result = robots();

    const rules = result.rules as Exclude<typeof result.rules, unknown[]>;

    // Public pages allowed, admin disallowed — the two must not be the same path
    expect(rules.allow).toBe('/');
    expect(rules.disallow).toBe('/admin/');
    expect(rules.allow).not.toBe(rules.disallow);
  });
});
