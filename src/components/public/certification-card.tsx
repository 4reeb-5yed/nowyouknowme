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

/**
 * Determines the expiry status text and styling for a certification.
 */
function getExpiryInfo(expiryDate: string | null): {
  text: string;
  className: string;
} {
  if (!expiryDate) {
    return { text: "No Expiry", className: "text-green-600 dark:text-green-400" };
  }

  const expiry = new Date(expiryDate);
  const now = new Date();

  if (expiry < now) {
    return { text: "Expired", className: "text-red-600 dark:text-red-400" };
  }

  return {
    text: `Valid until ${formatDate(expiryDate)}`,
    className: "text-muted-foreground",
  };
}

/**
 * CertificationCard displays a single certification in a card format.
 * Shows certification name, issuing organization, issue date, expiry info,
 * and an optional credential verification link.
 */
export function CertificationCard({ certification }: CertificationCardProps) {
  const expiryInfo = getExpiryInfo(certification.expiryDate);

  return (
    <article className="flex flex-col gap-3 rounded-lg border bg-card p-5 text-card-foreground shadow-sm transition-all motion-safe:hover:scale-[1.02] hover:shadow-md">
      {/* Certification name */}
      <h3 className="text-lg font-semibold leading-tight">
        {certification.certificationName}
      </h3>

      {/* Issuing organization */}
      <p className="text-sm text-muted-foreground">
        {certification.issuingOrganization}
      </p>

      {/* Issue date */}
      <p className="text-sm text-muted-foreground">
        Issued: {formatDate(certification.issueDate)}
      </p>

      {/* Expiry info */}
      <p className={`text-sm font-medium ${expiryInfo.className}`}>
        {expiryInfo.text}
      </p>

      {/* Credential verification link */}
      {certification.credentialUrl && (
        <a
          href={certification.credentialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Verify Credential
          <span aria-hidden="true" className="text-xs">
            ↗
          </span>
          <span className="sr-only">(opens in new tab)</span>
        </a>
      )}
    </article>
  );
}
