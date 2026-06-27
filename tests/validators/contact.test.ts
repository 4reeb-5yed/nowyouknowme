import { describe, it, expect } from 'vitest';
import { contactFormSchema } from '@/lib/validators/contact';

describe('contactFormSchema', () => {
  describe('valid submissions', () => {
    it('accepts a valid contact form submission', () => {
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello, I would like to get in touch with you about a project.',
      };

      const result = contactFormSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('accepts name at minimum length (1 character)', () => {
      const input = {
        name: 'J',
        email: 'j@example.com',
        message: 'This is a valid message with enough characters.',
      };

      const result = contactFormSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('accepts name at maximum length (100 characters)', () => {
      const input = {
        name: 'A'.repeat(100),
        email: 'user@example.com',
        message: 'This is a valid message with enough characters.',
      };

      const result = contactFormSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('accepts message at minimum length (10 characters)', () => {
      const input = {
        name: 'Jane',
        email: 'jane@example.com',
        message: 'Hi there!!',
      };

      const result = contactFormSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('accepts message at maximum length (5000 characters)', () => {
      const input = {
        name: 'Jane',
        email: 'jane@example.com',
        message: 'A'.repeat(5000),
      };

      const result = contactFormSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe('email format validation', () => {
    it('rejects an invalid email without domain', () => {
      const input = {
        name: 'John',
        email: 'john@',
        message: 'This is a valid message with enough characters.',
      };

      const result = contactFormSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects an invalid email without @ symbol', () => {
      const input = {
        name: 'John',
        email: 'john.example.com',
        message: 'This is a valid message with enough characters.',
      };

      const result = contactFormSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects an invalid email with spaces', () => {
      const input = {
        name: 'John',
        email: 'john @example.com',
        message: 'This is a valid message with enough characters.',
      };

      const result = contactFormSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('accepts a valid email with subdomain', () => {
      const input = {
        name: 'John',
        email: 'john@mail.example.com',
        message: 'This is a valid message with enough characters.',
      };

      const result = contactFormSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe('required fields rejection when missing', () => {
    it('rejects when name is missing', () => {
      const input = {
        email: 'john@example.com',
        message: 'This is a valid message with enough characters.',
      };

      const result = contactFormSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects when name is an empty string', () => {
      const input = {
        name: '',
        email: 'john@example.com',
        message: 'This is a valid message with enough characters.',
      };

      const result = contactFormSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects when email is missing', () => {
      const input = {
        name: 'John',
        message: 'This is a valid message with enough characters.',
      };

      const result = contactFormSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects when email is an empty string', () => {
      const input = {
        name: 'John',
        email: '',
        message: 'This is a valid message with enough characters.',
      };

      const result = contactFormSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects when message is missing', () => {
      const input = {
        name: 'John',
        email: 'john@example.com',
      };

      const result = contactFormSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects when message is too short (under 10 characters)', () => {
      const input = {
        name: 'John',
        email: 'john@example.com',
        message: 'Hi',
      };

      const result = contactFormSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects when name exceeds maximum length', () => {
      const input = {
        name: 'A'.repeat(101),
        email: 'john@example.com',
        message: 'This is a valid message with enough characters.',
      };

      const result = contactFormSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects when message exceeds maximum length', () => {
      const input = {
        name: 'John',
        email: 'john@example.com',
        message: 'A'.repeat(5001),
      };

      const result = contactFormSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });
});
