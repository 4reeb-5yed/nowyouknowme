"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { certificationCreateSchema } from "@/lib/validators/certification";
import { Button } from "@/components/ui/button";
import type { CertificationTableItem } from "@/components/admin/certification-table";

/** Shape of the data emitted by the certification form on submit. */
export interface CertFormData {
  certificationName: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate: string | null;
  credentialId: string | null;
  credentialUrl: string | null;
  isVisible: boolean;
}

interface FormErrors {
  certificationName?: string;
  issuingOrganization?: string;
  issueDate?: string;
  expiryDate?: string;
  credentialUrl?: string;
}

export interface CertificationFormProps {
  /** The certification being edited, or null when creating a new one. */
  certification: CertificationTableItem | null;
  /** Whether a create/update mutation is in flight. */
  isLoading: boolean;
  /** Called with validated form data when the form is submitted. */
  onSubmit: (data: CertFormData) => void;
  /** Called when the form is dismissed without saving. */
  onCancel: () => void;
}

/**
 * Presentational modal form for creating or editing a certification.
 * Fully controlled — performs client-side validation and delegates all
 * persistence to the parent via the `onSubmit` callback.
 */
export function CertificationForm({
  certification,
  isLoading,
  onSubmit,
  onCancel,
}: CertificationFormProps) {
  const [certificationName, setCertificationName] = useState(
    certification?.certificationName ?? ""
  );
  const [issuingOrganization, setIssuingOrganization] = useState(
    certification?.issuingOrganization ?? ""
  );
  const [issueDate, setIssueDate] = useState(certification?.issueDate ?? "");
  const [expiryDate, setExpiryDate] = useState(certification?.expiryDate ?? "");
  const [credentialId, setCredentialId] = useState(certification?.credentialId ?? "");
  const [credentialUrl, setCredentialUrl] = useState(certification?.credentialUrl ?? "");
  const [isVisible, setIsVisible] = useState(certification?.isVisible ?? true);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData: CertFormData = {
      certificationName: certificationName.trim(),
      issuingOrganization: issuingOrganization.trim(),
      issueDate,
      expiryDate: expiryDate || null,
      credentialId: credentialId.trim() || null,
      credentialUrl: credentialUrl.trim() || null,
      isVisible,
    };

    // Client-side validation using certificationCreateSchema
    const result = certificationCreateSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FormErrors;
        if (field) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-[10vh]">
      <div
        className="relative w-full max-w-lg rounded-xl border border-border bg-background shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cert-form-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2
            id="cert-form-title"
            className="text-lg font-semibold text-foreground"
          >
            {certification ? "Edit Certification" : "Add Certification"}
          </h2>
          <button
            onClick={onCancel}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <svg
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Certification Name */}
          <div>
            <label
              htmlFor="certificationName"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Certification Name *
            </label>
            <input
              id="certificationName"
              type="text"
              value={certificationName}
              onChange={(e) => setCertificationName(e.target.value)}
              placeholder="e.g. AWS Solutions Architect"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={255}
              aria-required="true"
              aria-invalid={errors.certificationName ? true : undefined}
              aria-describedby={errors.certificationName ? "certificationName-error" : undefined}
            />
            {errors.certificationName && (
              <p id="certificationName-error" role="alert" className="mt-1 text-xs text-destructive">{errors.certificationName}</p>
            )}
          </div>

          {/* Issuing Organization */}
          <div>
            <label
              htmlFor="issuingOrganization"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Issuing Organization *
            </label>
            <input
              id="issuingOrganization"
              type="text"
              value={issuingOrganization}
              onChange={(e) => setIssuingOrganization(e.target.value)}
              placeholder="e.g. Amazon Web Services"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={255}
              aria-required="true"
              aria-invalid={errors.issuingOrganization ? true : undefined}
              aria-describedby={errors.issuingOrganization ? "issuingOrganization-error" : undefined}
            />
            {errors.issuingOrganization && (
              <p id="issuingOrganization-error" role="alert" className="mt-1 text-xs text-destructive">{errors.issuingOrganization}</p>
            )}
          </div>

          {/* Dates row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="issueDate"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Issue Date *
              </label>
              <input
                id="issueDate"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                aria-required="true"
                aria-invalid={errors.issueDate ? true : undefined}
                aria-describedby={errors.issueDate ? "issueDate-error" : undefined}
              />
              {errors.issueDate && (
                <p id="issueDate-error" role="alert" className="mt-1 text-xs text-destructive">{errors.issueDate}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="expiryDate"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Expiry Date
              </label>
              <input
                id="expiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                aria-invalid={errors.expiryDate ? true : undefined}
                aria-describedby={errors.expiryDate ? "expiryDate-error" : undefined}
              />
              {errors.expiryDate && (
                <p id="expiryDate-error" role="alert" className="mt-1 text-xs text-destructive">{errors.expiryDate}</p>
              )}
            </div>
          </div>

          {/* Credential ID */}
          <div>
            <label
              htmlFor="credentialId"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Credential ID
            </label>
            <input
              id="credentialId"
              type="text"
              value={credentialId}
              onChange={(e) => setCredentialId(e.target.value)}
              placeholder="e.g. ABC123XYZ"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={255}
            />
          </div>

          {/* Credential URL */}
          <div>
            <label
              htmlFor="credentialUrl"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Credential URL
            </label>
            <input
              id="credentialUrl"
              type="url"
              value={credentialUrl}
              onChange={(e) => setCredentialUrl(e.target.value)}
              placeholder="https://www.credly.com/badges/..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={500}
              aria-invalid={errors.credentialUrl ? true : undefined}
              aria-describedby={errors.credentialUrl ? "credentialUrl-error" : undefined}
            />
            {errors.credentialUrl && (
              <p id="credentialUrl-error" role="alert" className="mt-1 text-xs text-destructive">{errors.credentialUrl}</p>
            )}
          </div>

          {/* Visibility checkbox */}
          <div className="flex items-center gap-2">
            <input
              id="isVisible"
              type="checkbox"
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
              className="size-4 rounded border-input text-primary focus:ring-ring"
            />
            <label htmlFor="isVisible" className="text-sm text-foreground">
              Visible on public site
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                  <span className="ml-1">Saving...</span>
                </>
              ) : certification ? (
                "Update"
              ) : (
                "Add"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
