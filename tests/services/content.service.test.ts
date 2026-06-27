import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockSection, resetFactoryCounter } from '../utils/mock-factories';

// Mock the database module
const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockLimit = vi.fn();
const mockUpdate = vi.fn();
const mockSet = vi.fn();
const mockReturning = vi.fn();

vi.mock('@/server/db', () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
  },
}));

// Mock drizzle-orm operators
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((col, val) => ({ type: 'eq', col, val })),
}));

describe('Content Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetFactoryCounter();

    // Reset chain mocks
    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ limit: mockLimit, returning: mockReturning });
    mockLimit.mockResolvedValue([]);
    mockReturning.mockResolvedValue([]);

    mockUpdate.mockReturnValue({ set: mockSet });
    mockSet.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ returning: mockReturning });
    mockReturning.mockResolvedValue([]);
  });

  describe('getSection', () => {
    it('should return a section by key', async () => {
      const section = createMockSection({ key: 'about', content: '<p>About me</p>' });

      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });
      mockLimit.mockResolvedValue([section]);

      const { getSection } = await import('@/server/services/content.service');
      const result = await getSection('about');

      expect(result).toEqual(section);
      expect(mockSelect).toHaveBeenCalled();
    });

    it('should return null when section key does not exist', async () => {
      mockSelect.mockReturnValue({ from: mockFrom });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });
      mockLimit.mockResolvedValue([]);

      const { getSection } = await import('@/server/services/content.service');
      const result = await getSection('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('updateSection - sanitization', () => {
    it('should strip script tags from saved content', async () => {
      const updatedSection = createMockSection({
        key: 'about',
        content: '<p>Hello</p>',
      });

      mockUpdate.mockReturnValue({ set: mockSet });
      mockSet.mockImplementation((data: { content: string }) => {
        // Verify the content passed to DB does not contain script tags
        expect(data.content).not.toContain('<script');
        expect(data.content).not.toContain('</script>');
        expect(data.content).toContain('<p>');
        expect(data.content).toContain('Hello');
        return { where: mockWhere };
      });
      mockWhere.mockReturnValue({ returning: mockReturning });
      mockReturning.mockResolvedValue([updatedSection]);

      const { updateSection } = await import('@/server/services/content.service');
      const result = await updateSection(
        'about',
        '<p>Hello</p><script>alert("xss")</script>'
      );

      expect(result).toEqual(updatedSection);
    });

    it('should remove event handler attributes (onclick, onerror) from saved content', async () => {
      const updatedSection = createMockSection({
        key: 'about',
        content: '<p>Click me</p>',
      });

      mockUpdate.mockReturnValue({ set: mockSet });
      mockSet.mockImplementation((data: { content: string }) => {
        // Verify on* attributes are removed
        expect(data.content).not.toMatch(/onclick/i);
        expect(data.content).not.toMatch(/onerror/i);
        expect(data.content).toContain('Click me');
        return { where: mockWhere };
      });
      mockWhere.mockReturnValue({ returning: mockReturning });
      mockReturning.mockResolvedValue([updatedSection]);

      const { updateSection } = await import('@/server/services/content.service');
      await updateSection(
        'about',
        '<p onclick="alert(1)">Click me</p><img onerror="steal()" src="x">'
      );

      expect(mockSet).toHaveBeenCalled();
    });

    it('should preserve safe HTML tags (p, strong, em, a)', async () => {
      const safeHtml = '<p>This is <strong>bold</strong> and <em>italic</em> with a <a href="https://example.com">link</a></p>';
      const updatedSection = createMockSection({
        key: 'about',
        content: safeHtml,
      });

      mockUpdate.mockReturnValue({ set: mockSet });
      mockSet.mockImplementation((data: { content: string }) => {
        // Verify safe tags are preserved
        expect(data.content).toContain('<p>');
        expect(data.content).toContain('</p>');
        expect(data.content).toContain('<strong>');
        expect(data.content).toContain('</strong>');
        expect(data.content).toContain('<em>');
        expect(data.content).toContain('</em>');
        expect(data.content).toContain('<a');
        expect(data.content).toContain('</a>');
        expect(data.content).toContain('href="https://example.com"');
        return { where: mockWhere };
      });
      mockWhere.mockReturnValue({ returning: mockReturning });
      mockReturning.mockResolvedValue([updatedSection]);

      const { updateSection } = await import('@/server/services/content.service');
      await updateSection('about', safeHtml);

      expect(mockSet).toHaveBeenCalled();
    });

    it('should return null when the section key does not exist', async () => {
      mockUpdate.mockReturnValue({ set: mockSet });
      mockSet.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ returning: mockReturning });
      mockReturning.mockResolvedValue([]);

      const { updateSection } = await import('@/server/services/content.service');
      const result = await updateSection('nonexistent', '<p>content</p>');

      expect(result).toBeNull();
    });
  });
});

describe('sanitizeHtml (direct)', () => {
  let sanitizeHtml: (html: string) => string;

  beforeEach(async () => {
    const mod = await import('@/lib/sanitize');
    sanitizeHtml = mod.sanitizeHtml;
  });

  describe('dangerous tag removal', () => {
    it('should strip script tags and their contents', () => {
      const input = '<p>Hello</p><script>alert("xss")</script><p>World</p>';
      const result = sanitizeHtml(input);

      expect(result).not.toContain('<script');
      expect(result).not.toContain('</script>');
      expect(result).not.toContain('alert');
      expect(result).toContain('<p>');
      expect(result).toContain('Hello');
      expect(result).toContain('World');
    });

    it('should strip script tags with attributes', () => {
      const input = '<script type="text/javascript" src="evil.js"></script><p>Safe</p>';
      const result = sanitizeHtml(input);

      expect(result).not.toContain('<script');
      expect(result).not.toContain('evil.js');
      expect(result).toContain('<p>');
      expect(result).toContain('Safe');
    });

    it('should strip iframe tags', () => {
      const input = '<p>Before</p><iframe src="https://evil.com"></iframe><p>After</p>';
      const result = sanitizeHtml(input);

      expect(result).not.toContain('<iframe');
      expect(result).not.toContain('evil.com');
      expect(result).toContain('Before');
      expect(result).toContain('After');
    });
  });

  describe('event handler attribute removal', () => {
    it('should remove onclick attributes', () => {
      const input = '<p onclick="alert(1)">Click me</p>';
      const result = sanitizeHtml(input);

      expect(result).not.toMatch(/onclick/i);
      expect(result).toContain('Click me');
      expect(result).toContain('<p>');
    });

    it('should remove onerror attributes', () => {
      const input = '<p>Text</p><img onerror="steal()" src="x">';
      const result = sanitizeHtml(input);

      expect(result).not.toMatch(/onerror/i);
      expect(result).not.toMatch(/steal/);
    });

    it('should remove onload attributes', () => {
      const input = '<p onload="malicious()">Content</p>';
      const result = sanitizeHtml(input);

      expect(result).not.toMatch(/onload/i);
      expect(result).toContain('Content');
    });

    it('should remove onmouseover attributes', () => {
      const input = '<p onmouseover="hack()">Hover me</p>';
      const result = sanitizeHtml(input);

      expect(result).not.toMatch(/onmouseover/i);
      expect(result).toContain('Hover me');
    });
  });

  describe('safe HTML preservation', () => {
    it('should preserve p tags', () => {
      const input = '<p>Paragraph content</p>';
      const result = sanitizeHtml(input);

      expect(result).toContain('<p>');
      expect(result).toContain('</p>');
      expect(result).toContain('Paragraph content');
    });

    it('should preserve strong tags', () => {
      const input = '<p><strong>Bold text</strong></p>';
      const result = sanitizeHtml(input);

      expect(result).toContain('<strong>');
      expect(result).toContain('</strong>');
      expect(result).toContain('Bold text');
    });

    it('should preserve em tags', () => {
      const input = '<p><em>Italic text</em></p>';
      const result = sanitizeHtml(input);

      expect(result).toContain('<em>');
      expect(result).toContain('</em>');
      expect(result).toContain('Italic text');
    });

    it('should preserve a tags with safe href', () => {
      const input = '<a href="https://example.com" title="Example">Link</a>';
      const result = sanitizeHtml(input);

      expect(result).toContain('<a');
      expect(result).toContain('</a>');
      expect(result).toContain('href="https://example.com"');
      expect(result).toContain('Link');
    });

    it('should preserve combined safe HTML', () => {
      const input = '<p>This is <strong>bold</strong> and <em>italic</em> with a <a href="https://example.com">link</a></p>';
      const result = sanitizeHtml(input);

      expect(result).toContain('<p>');
      expect(result).toContain('<strong>');
      expect(result).toContain('<em>');
      expect(result).toContain('<a');
      expect(result).toContain('href="https://example.com"');
    });

    it('should strip javascript: URLs from a tags', () => {
      const input = '<a href="javascript:alert(1)">Malicious link</a>';
      const result = sanitizeHtml(input);

      expect(result).not.toContain('javascript:');
      expect(result).toContain('Malicious link');
    });
  });

  describe('edge cases', () => {
    it('should return empty string for empty input', () => {
      expect(sanitizeHtml('')).toBe('');
    });

    it('should handle null-like empty input', () => {
      expect(sanitizeHtml(undefined as unknown as string)).toBe('');
    });

    it('should strip disallowed tags but preserve their text content', () => {
      const input = '<div>Text in a div</div>';
      const result = sanitizeHtml(input);

      expect(result).not.toContain('<div');
      expect(result).toContain('Text in a div');
    });
  });
});
