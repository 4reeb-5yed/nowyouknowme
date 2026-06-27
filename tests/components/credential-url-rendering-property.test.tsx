/**
 * Property-based test for credential URL rendering.
 *
 * Property 14: Credential URL Rendering
 * FOR ALL visible Certification entries that have a non-null credential_url,
 * THE Public_Site rendering layer SHALL output an anchor element containing
 * that URL with target="_blank" and rel="noopener noreferrer" attributes.
 *
 * **Validates: Requirements 19.7**
 */
import { describe, it } from 'vitest';
import fc from 'fast-check';
import { render, screen, cleanup } from '@testing-library/react';

import {
  CertificationCard,
  type Certification,
} from '@/components/public/certification-card';
import { createMockCertification } from '../utils/mock-factories';

/**
 * Builds a Certification prop from a MockCertification, applying overrides.
 * The component prop shape matches the mock factory exactly.
 */
function toCertificationProp(overrides: Partial<Certification> = {}): Certification {
  const mock = createMockCertification();
  return { ...mock, ...overrides };
}

// ─── Arbitraries ────────────────────────────────────────────────────────────

/** ISO date string (YYYY-MM-DD) within a plausible range. */
const isoDateArb = fc
  .date({ min: new Date('2000-01-01'), max: new Date('2035-12-31') })
  .map((d) => d.toISOString().slice(0, 10));

/** Arbitrary non-null credential URL. */
const credentialUrlArb = fc.webUrl();

/** Arbitrary certification with a guaranteed non-null credential_url. */
const certificationWithUrlArb: fc.Arbitrary<Certification> = fc
  .record({
    certificationName: fc.string({ minLength: 1, maxLength: 80 }),
    issuingOrganization: fc.string({ minLength: 1, maxLength: 80 }),
    issueDate: isoDateArb,
    expiryDate: fc.oneof(fc.constant(null), isoDateArb),
    credentialId: fc.oneof(fc.constant(null), fc.string({ maxLength: 40 })),
    credentialUrl: credentialUrlArb,
    displayOrder: fc.integer({ min: 0, max: 1000 }),
  })
  .map((fields) => toCertificationProp(fields));

/** Arbitrary certification with a guaranteed null credential_url. */
const certificationWithoutUrlArb: fc.Arbitrary<Certification> = fc
  .record({
    certificationName: fc.string({ minLength: 1, maxLength: 80 }),
    issuingOrganization: fc.string({ minLength: 1, maxLength: 80 }),
    issueDate: isoDateArb,
    expiryDate: fc.oneof(fc.constant(null), isoDateArb),
    credentialId: fc.oneof(fc.constant(null), fc.string({ maxLength: 40 })),
    displayOrder: fc.integer({ min: 0, max: 1000 }),
  })
  .map((fields) => toCertificationProp({ ...fields, credentialUrl: null }));

// ─── Property 14 ─────────────────────────────────────────────────────────────

describe('Property 14: Credential URL Rendering', () => {
  /**
   * For any certification with a non-null credential_url, the rendered output
   * contains exactly one anchor whose href is that URL, opening in a new tab
   * with the secure rel attribute. (Requirement 19.7)
   */
  it('renders a secure new-tab anchor for any non-null credential_url', () => {
    fc.assert(
      fc.property(certificationWithUrlArb, (certification) => {
        try {
          render(<CertificationCard certification={certification} />);

          const link = screen.getByRole('link');
          return (
            link.getAttribute('href') === certification.credentialUrl &&
            link.getAttribute('target') === '_blank' &&
            link.getAttribute('rel') === 'noopener noreferrer'
          );
        } finally {
          cleanup();
        }
      }),
    );
  });

  /**
   * For any certification with a null credential_url, no anchor is rendered.
   * (Requirement 19.7)
   */
  it('renders no anchor when credential_url is null', () => {
    fc.assert(
      fc.property(certificationWithoutUrlArb, (certification) => {
        try {
          render(<CertificationCard certification={certification} />);
          return screen.queryByRole('link') === null;
        } finally {
          cleanup();
        }
      }),
    );
  });
});
