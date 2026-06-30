"use client";

import { formatDate } from "@/lib/utils";

export interface Certification {
  id: string;
  certificationName: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate: string | null;
  credentialId: string | null;
  credentialUrl: string | null;
  displayOrder: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CertificationCardProps {
  certification: Certification;
}

function getExpiryInfo(expiryDate: string | null): {
  text: string;
  className: string;
} {
  if (!expiryDate) {
    return { text: "No Expiry", className: "certification-card__expiry--valid" };
  }

  const expiry = new Date(expiryDate);
  const now = new Date();

  if (expiry < now) {
    return { text: "Expired", className: "certification-card__expiry--expired" };
  }

  return {
    text: `Valid until ${formatDate(expiryDate)}`,
    className: "certification-card__expiry",
  };
}

export function CertificationCard({ certification }: CertificationCardProps) {
  const expiryInfo = getExpiryInfo(certification.expiryDate);

  return (
    <article className="certification-card">
      <div className="certification-card__header">
        <h3 className="certification-card__title">
          {certification.certificationName}
        </h3>
        <p className="certification-card__org">
          {certification.issuingOrganization}
        </p>
      </div>

      <div className="certification-card__meta">
        <p className="certification-card__date">
          Issued {formatDate(certification.issueDate)}
        </p>
        <p className={`certification-card__expiry ${expiryInfo.className}`}>
          {expiryInfo.text}
        </p>
      </div>

      {certification.credentialUrl && (
        <a
          href={certification.credentialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="certification-card__link"
        >
          Verify Credential
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>
      )}
    </article>
  );
}
