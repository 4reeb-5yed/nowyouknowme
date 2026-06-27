/**
 * Component tests for CertificationCard rendering.
 *
 * Covers:
 * - credential_url renders as a verifiable link with target="_blank"
 *   and rel="noopener noreferrer" (Requirement 19.7)
 * - entries without credential_url do not render a link (Requirement 19.7)
 * - expiry information displays correctly (Requirement 19.6)
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { CertificationCard } from '@/components/public/certification-card';
import { formatDate } from '@/lib/utils';
import { createMockCertification } from '../utils/mock-factories';

describe('CertificationCard', () => {
  describe('core fields', () => {
    it('renders the certification name, issuing organization, and issue date', () => {
      const certification = createMockCertification({
        certificationName: 'Certified Kubernetes Administrator',
        issuingOrganization: 'CNCF',
        issueDate: '2023-06-15',
      });

      render(<CertificationCard certification={certification} />);

      expect(
        screen.getByRole('heading', { name: 'Certified Kubernetes Administrator' })
      ).toBeInTheDocument();
      expect(screen.getByText('CNCF')).toBeInTheDocument();
      expect(
        screen.getByText(`Issued: ${formatDate('2023-06-15')}`)
      ).toBeInTheDocument();
    });
  });

  describe('credential URL link', () => {
    it('renders the credential_url as a verifiable link opening in a new tab', () => {
      const credentialUrl = 'https://www.credly.com/badges/example-badge';
      const certification = createMockCertification({ credentialUrl });

      render(<CertificationCard certification={certification} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', credentialUrl);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('includes accessible text indicating the link opens in a new tab', () => {
      const certification = createMockCertification({
        credentialUrl: 'https://www.credly.com/badges/example-badge',
      });

      render(<CertificationCard certification={certification} />);

      const link = screen.getByRole('link');
      expect(link).toHaveTextContent(/verify credential/i);
      expect(link).toHaveTextContent(/opens in new tab/i);
    });

    it('does not render a link when credential_url is null', () => {
      const certification = createMockCertification({ credentialUrl: null });

      render(<CertificationCard certification={certification} />);

      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
  });

  describe('expiry information', () => {
    it('displays "No Expiry" when expiry_date is null', () => {
      const certification = createMockCertification({ expiryDate: null });

      render(<CertificationCard certification={certification} />);

      expect(screen.getByText('No Expiry')).toBeInTheDocument();
    });

    it('displays "Expired" when expiry_date is in the past', () => {
      const certification = createMockCertification({ expiryDate: '2000-01-01' });

      render(<CertificationCard certification={certification} />);

      expect(screen.getByText('Expired')).toBeInTheDocument();
    });

    it('displays "Valid until <date>" when expiry_date is in the future', () => {
      const futureDate = '2999-12-31';
      const certification = createMockCertification({ expiryDate: futureDate });

      render(<CertificationCard certification={certification} />);

      expect(
        screen.getByText(`Valid until ${formatDate(futureDate)}`)
      ).toBeInTheDocument();
    });
  });
});
