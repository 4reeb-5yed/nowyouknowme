import { describe, it, expect } from 'vitest';
import { certificationCreateSchema } from '@/lib/validators/certification';

describe('certificationCreateSchema', () => {
  const validInput = {
    certificationName: 'AWS Solutions Architect',
    issuingOrganization: 'Amazon Web Services',
    issueDate: '2023-06-15',
    expiryDate: '2026-06-15',
    credentialId: 'CERT-123-ABC',
    credentialUrl: 'https://www.credly.com/badges/abc-123',
    isVisible: true,
  };

  describe('valid certification creation', () => {
    it('accepts a fully populated valid input', () => {
      const result = certificationCreateSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('accepts input with only required fields', () => {
      const result = certificationCreateSchema.safeParse({
        certificationName: 'CompTIA Security+',
        issuingOrganization: 'CompTIA',
        issueDate: '2024-01-10',
      });
      expect(result.success).toBe(true);
    });

    it('defaults isVisible to true when not provided', () => {
      const result = certificationCreateSchema.safeParse({
        certificationName: 'CompTIA Security+',
        issuingOrganization: 'CompTIA',
        issueDate: '2024-01-10',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isVisible).toBe(true);
      }
    });
  });

  describe('expiry_date must be after issue_date', () => {
    it('rejects expiryDate that is before issueDate', () => {
      const result = certificationCreateSchema.safeParse({
        ...validInput,
        issueDate: '2024-06-15',
        expiryDate: '2023-01-01',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const expiryError = result.error.issues.find(
          (issue) => issue.path.includes('expiryDate')
        );
        expect(expiryError).toBeDefined();
        expect(expiryError!.message).toContain('Expiry date must be after issue date');
      }
    });

    it('rejects expiryDate that is the same as issueDate', () => {
      const result = certificationCreateSchema.safeParse({
        ...validInput,
        issueDate: '2024-06-15',
        expiryDate: '2024-06-15',
      });
      expect(result.success).toBe(false);
    });

    it('accepts expiryDate that is after issueDate', () => {
      const result = certificationCreateSchema.safeParse({
        ...validInput,
        issueDate: '2023-01-01',
        expiryDate: '2025-12-31',
      });
      expect(result.success).toBe(true);
    });

    it('accepts when expiryDate is null (no expiry)', () => {
      const result = certificationCreateSchema.safeParse({
        ...validInput,
        expiryDate: null,
      });
      expect(result.success).toBe(true);
    });

    it('accepts when expiryDate is not provided', () => {
      const { expiryDate, ...withoutExpiry } = validInput;
      const result = certificationCreateSchema.safeParse(withoutExpiry);
      expect(result.success).toBe(true);
    });
  });

  describe('credential_url format validation', () => {
    it('accepts a valid HTTPS URL', () => {
      const result = certificationCreateSchema.safeParse({
        ...validInput,
        credentialUrl: 'https://www.credly.com/badges/some-badge',
      });
      expect(result.success).toBe(true);
    });

    it('accepts a valid HTTP URL', () => {
      const result = certificationCreateSchema.safeParse({
        ...validInput,
        credentialUrl: 'http://example.com/verify/123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects an invalid URL format', () => {
      const result = certificationCreateSchema.safeParse({
        ...validInput,
        credentialUrl: 'not-a-url',
      });
      expect(result.success).toBe(false);
    });

    it('rejects a URL missing protocol', () => {
      const result = certificationCreateSchema.safeParse({
        ...validInput,
        credentialUrl: 'www.credly.com/badges/abc',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('nullable fields (credential_id, credential_url, expiry_date)', () => {
    it('accepts null credentialId', () => {
      const result = certificationCreateSchema.safeParse({
        ...validInput,
        credentialId: null,
      });
      expect(result.success).toBe(true);
    });

    it('accepts null credentialUrl', () => {
      const result = certificationCreateSchema.safeParse({
        ...validInput,
        credentialUrl: null,
      });
      expect(result.success).toBe(true);
    });

    it('accepts null expiryDate', () => {
      const result = certificationCreateSchema.safeParse({
        ...validInput,
        expiryDate: null,
      });
      expect(result.success).toBe(true);
    });

    it('accepts all nullable fields as null simultaneously', () => {
      const result = certificationCreateSchema.safeParse({
        ...validInput,
        credentialId: null,
        credentialUrl: null,
        expiryDate: null,
      });
      expect(result.success).toBe(true);
    });

    it('accepts all nullable fields omitted', () => {
      const result = certificationCreateSchema.safeParse({
        certificationName: 'CISSP',
        issuingOrganization: 'ISC2',
        issueDate: '2023-03-20',
        isVisible: false,
      });
      expect(result.success).toBe(true);
    });
  });
});
