import { describe, it, expect } from 'vitest';
import { projectCreateSchema, projectCategories, projectStatuses } from '@/lib/validators/project';

describe('projectCreateSchema', () => {
  const validInput = {
    title: 'My Awesome Project',
    slug: 'my-awesome-project',
    description: 'A short description of the project.',
    longDescription: 'A longer description with more detail.',
    techStack: ['TypeScript', 'React'],
    category: 'web' as const,
    githubUrl: 'https://github.com/user/repo',
    liveUrl: 'https://example.com',
    thumbnailUrl: 'https://cdn.example.com/thumb.png',
    isFeatured: true,
    status: 'published' as const,
  };

  describe('valid input acceptance', () => {
    it('accepts a fully populated valid input', () => {
      const result = projectCreateSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('accepts input with only required fields', () => {
      const minimal = {
        title: 'Minimal Project',
        description: 'Just the basics.',
        category: 'other' as const,
      };
      const result = projectCreateSchema.safeParse(minimal);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.techStack).toEqual([]);
        expect(result.data.isFeatured).toBe(false);
        expect(result.data.status).toBe('draft');
      }
    });

    it('accepts input with optional fields omitted', () => {
      const input = {
        title: 'No Optional Fields',
        description: 'Description here.',
        category: 'cybersecurity' as const,
      };
      const result = projectCreateSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('accepts nullable URL fields set to null', () => {
      const input = {
        ...validInput,
        githubUrl: null,
        liveUrl: null,
        thumbnailUrl: null,
      };
      const result = projectCreateSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe('slug regex enforcement', () => {
    it('accepts a valid slug with lowercase letters, numbers, and hyphens', () => {
      const result = projectCreateSchema.safeParse({ ...validInput, slug: 'my-project-123' });
      expect(result.success).toBe(true);
    });

    it('accepts a slug with only lowercase letters', () => {
      const result = projectCreateSchema.safeParse({ ...validInput, slug: 'myproject' });
      expect(result.success).toBe(true);
    });

    it('accepts a slug with only numbers', () => {
      const result = projectCreateSchema.safeParse({ ...validInput, slug: '12345' });
      expect(result.success).toBe(true);
    });

    it('rejects a slug with uppercase letters', () => {
      const result = projectCreateSchema.safeParse({ ...validInput, slug: 'My-Project' });
      expect(result.success).toBe(false);
    });

    it('rejects a slug with spaces', () => {
      const result = projectCreateSchema.safeParse({ ...validInput, slug: 'my project' });
      expect(result.success).toBe(false);
    });

    it('rejects a slug with special characters', () => {
      const result = projectCreateSchema.safeParse({ ...validInput, slug: 'my_project!' });
      expect(result.success).toBe(false);
    });

    it('rejects a slug with underscores', () => {
      const result = projectCreateSchema.safeParse({ ...validInput, slug: 'my_project' });
      expect(result.success).toBe(false);
    });
  });

  describe('category enum constraint', () => {
    it.each(projectCategories)('accepts valid category: %s', (category) => {
      const result = projectCreateSchema.safeParse({ ...validInput, category });
      expect(result.success).toBe(true);
    });

    it('rejects an invalid category value', () => {
      const result = projectCreateSchema.safeParse({ ...validInput, category: 'invalid' });
      expect(result.success).toBe(false);
    });

    it('rejects a numeric category value', () => {
      const result = projectCreateSchema.safeParse({ ...validInput, category: 123 });
      expect(result.success).toBe(false);
    });
  });

  describe('required field rejection when missing', () => {
    it('rejects when title is missing', () => {
      const { title, ...noTitle } = validInput;
      const result = projectCreateSchema.safeParse(noTitle);
      expect(result.success).toBe(false);
    });

    it('rejects when description is missing', () => {
      const { description, ...noDescription } = validInput;
      const result = projectCreateSchema.safeParse(noDescription);
      expect(result.success).toBe(false);
    });

    it('rejects when category is missing', () => {
      const { category, ...noCategory } = validInput;
      const result = projectCreateSchema.safeParse(noCategory);
      expect(result.success).toBe(false);
    });

    it('rejects when title is empty string', () => {
      const result = projectCreateSchema.safeParse({ ...validInput, title: '' });
      expect(result.success).toBe(false);
    });

    it('rejects when description is empty string', () => {
      const result = projectCreateSchema.safeParse({ ...validInput, description: '' });
      expect(result.success).toBe(false);
    });
  });
});
