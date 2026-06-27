"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import { SortableList, DragHandle, type DragHandleProps } from "@/components/admin/sortable-list";
import { Button } from "@/components/ui/button";
import { certificationCreateSchema } from "@/lib/validators/certification";
import {
  Plus,
  Loader2,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  ShieldMinus,
} from "lucide-react";

interface Certification {
  id: string;
  certificationName: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate: string | null;
  credentialId: string | null;
  credentialUrl: string | null;
  isVisible: boolean;
  displayOrder: number;
}

function getExpiryStatus(expiryDate: string | null): "expired" | "valid" | "no-expiry" {
  if (!expiryDate) return "no-expiry";
  return new Date(expiryDate) < new Date() ? "expired" : "valid";
}

export default function CertificationsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const utils = trpc.useUtils();

  // Query
  const { data: certifications, isLoading, isError, error } = trpc.certifications.listAll.useQuery();

  // Mutations
  const createMutation = trpc.certifications.create.useMutation({
    onSuccess: () => {
      utils.certifications.listAll.invalidate();
      setFormOpen(false);
      toast.success("Certification added successfully");
    },
    onError: (err) => {
      toast.error("Failed to add certification", { description: err.message });
    },
  });

  const updateMutation = trpc.certifications.update.useMutation({
    onSuccess: () => {
      utils.certifications.listAll.invalidate();
      setEditingCert(null);
      setFormOpen(false);
      toast.success("Certification updated successfully");
    },
    onError: (err) => {
      toast.error("Failed to update certification", { description: err.message });
    },
  });

  const deleteMutation = trpc.certifications.delete.useMutation({
    onSuccess: () => {
      utils.certifications.listAll.invalidate();
      setDeleteConfirmId(null);
      toast.success("Certification deleted");
    },
    onError: (err) => {
      toast.error("Failed to delete certification", { description: err.message });
    },
  });

  const reorderMutation = trpc.certifications.reorder.useMutation({
    onSuccess: () => {
      utils.certifications.listAll.invalidate();
    },
    onError: (err) => {
      toast.error("Failed to reorder certifications", { description: err.message });
    },
  });

  // Handlers
  const handleAdd = useCallback(() => {
    setEditingCert(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((cert: Certification) => {
    setEditingCert(cert);
    setFormOpen(true);
  }, []);

  const handleToggleVisibility = useCallback(
    (cert: Certification) => {
      updateMutation.mutate({ id: cert.id, isVisible: !cert.isVisible });
    },
    [updateMutation]
  );

  const handleDelete = useCallback((id: string) => {
    setDeleteConfirmId(id);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deleteConfirmId) {
      deleteMutation.mutate({ id: deleteConfirmId });
    }
  }, [deleteConfirmId, deleteMutation]);

  const handleReorder = useCallback(
    (items: { id: string; displayOrder: number }[]) => {
      reorderMutation.mutate(items);
    },
    [reorderMutation]
  );

  const handleFormSubmit = useCallback(
    (data: {
      certificationName: string;
      issuingOrganization: string;
      issueDate: string;
      expiryDate: string | null;
      credentialId: string | null;
      credentialUrl: string | null;
      isVisible: boolean;
    }) => {
      if (editingCert) {
        updateMutation.mutate({ id: editingCert.id, ...data });
      } else {
        createMutation.mutate(data);
      }
    },
    [editingCert, createMutation, updateMutation]
  );

  const handleFormCancel = useCallback(() => {
    setFormOpen(false);
    setEditingCert(null);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden="true" />
        <p className="mt-3 text-sm text-muted-foreground">Loading certifications...</p>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-sm font-medium text-destructive">
          Failed to load certifications
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {error?.message ?? "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  const certList: Certification[] = (certifications ?? []).map((c) => ({
    id: c.id,
    certificationName: c.certificationName,
    issuingOrganization: c.issuingOrganization,
    issueDate: c.issueDate,
    expiryDate: c.expiryDate ?? null,
    credentialId: c.credentialId ?? null,
    credentialUrl: c.credentialUrl ?? null,
    isVisible: c.isVisible,
    displayOrder: c.displayOrder,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Certifications
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your professional certifications. Add credentials, issuing
            organizations, and verification links.
          </p>
        </div>
        <Button onClick={handleAdd} size="sm">
          <Plus className="size-4" aria-hidden="true" />
          <span className="ml-1">Add Certification</span>
        </Button>
      </div>

      {/* Reorder hint */}
      {certList.length > 1 && (
        <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
          Drag and drop certifications to reorder them. Changes are saved automatically.
          {reorderMutation.isPending && (
            <span className="ml-2 inline-flex items-center gap-1">
              <Loader2 className="size-3 animate-spin" aria-hidden="true" />
              Saving...
            </span>
          )}
        </div>
      )}

      {/* Empty state */}
      {certList.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No certifications yet. Click &quot;Add Certification&quot; to create your first one.
          </p>
        </div>
      )}

      {/* Sortable list */}
      {certList.length > 0 && (
        <SortableList
          items={certList}
          onReorder={handleReorder}
          renderItem={(item, dragHandleProps) => (
            <SortableCertItem
              item={item}
              dragHandleProps={dragHandleProps}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleVisibility={handleToggleVisibility}
              isToggling={updateMutation.isPending}
            />
          )}
        />
      )}

      {/* Add/Edit Form Modal */}
      {formOpen && (
        <CertificationFormModal
          certification={editingCert}
          isLoading={createMutation.isPending || updateMutation.isPending}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <ConfirmDialog
          title="Delete Certification"
          message="Are you sure you want to delete this certification? This action cannot be undone."
          confirmLabel="Delete"
          isLoading={deleteMutation.isPending}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}
    </div>
  );
}


// --- Sortable Certification Item ---

function ExpiryBadge({ expiryDate }: { expiryDate: string | null }) {
  const status = getExpiryStatus(expiryDate);

  if (status === "no-expiry") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
        <ShieldMinus className="size-3" aria-hidden="true" />
        No Expiry
      </span>
    );
  }

  if (status === "expired") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
        <ShieldAlert className="size-3" aria-hidden="true" />
        Expired
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
      <ShieldCheck className="size-3" aria-hidden="true" />
      Valid
    </span>
  );
}

function SortableCertItem({
  item,
  dragHandleProps,
  onEdit,
  onDelete,
  onToggleVisibility,
  isToggling,
}: {
  item: Certification;
  dragHandleProps: DragHandleProps;
  onEdit: (cert: Certification) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (cert: Certification) => void;
  isToggling: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <DragHandle dragHandleProps={dragHandleProps} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-foreground truncate">
            {item.certificationName}
          </span>
          <ExpiryBadge expiryDate={item.expiryDate} />
          {!item.isVisible && (
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              Hidden
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="truncate">{item.issuingOrganization}</span>
          <span className="text-border">•</span>
          <span>Issued {new Date(item.issueDate).toLocaleDateString()}</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {/* Visibility toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleVisibility(item)}
          disabled={isToggling}
          aria-label={item.isVisible ? "Hide certification" : "Show certification"}
          title={item.isVisible ? "Hide certification" : "Show certification"}
        >
          {item.isVisible ? (
            <Eye className="size-4 text-green-600" aria-hidden="true" />
          ) : (
            <EyeOff className="size-4 text-muted-foreground" aria-hidden="true" />
          )}
        </Button>
        {/* Edit button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(item)}
          aria-label="Edit certification"
        >
          <Pencil className="size-4" aria-hidden="true" />
        </Button>
        {/* Delete button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(item.id)}
          aria-label="Delete certification"
        >
          <Trash2 className="size-4 text-destructive" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

// --- Certification Form Modal ---

interface CertFormData {
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

function CertificationFormModal({
  certification,
  isLoading,
  onSubmit,
  onCancel,
}: {
  certification: Certification | null;
  isLoading: boolean;
  onSubmit: (data: CertFormData) => void;
  onCancel: () => void;
}) {
  const [certificationName, setCertificationName] = useState(certification?.certificationName ?? "");
  const [issuingOrganization, setIssuingOrganization] = useState(certification?.issuingOrganization ?? "");
  const [issueDate, setIssueDate] = useState(certification?.issueDate ?? "");
  const [expiryDate, setExpiryDate] = useState(certification?.expiryDate ?? "");
  const [credentialId, setCredentialId] = useState(certification?.credentialId ?? "");
  const [credentialUrl, setCredentialUrl] = useState(certification?.credentialUrl ?? "");
  const [isVisible, setIsVisible] = useState(certification?.isVisible ?? true);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = {
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
            />
            {errors.certificationName && (
              <p className="mt-1 text-xs text-destructive">{errors.certificationName}</p>
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
            />
            {errors.issuingOrganization && (
              <p className="mt-1 text-xs text-destructive">{errors.issuingOrganization}</p>
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
              />
              {errors.issueDate && (
                <p className="mt-1 text-xs text-destructive">{errors.issueDate}</p>
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
              />
              {errors.expiryDate && (
                <p className="mt-1 text-xs text-destructive">{errors.expiryDate}</p>
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
            />
            {errors.credentialUrl && (
              <p className="mt-1 text-xs text-destructive">{errors.credentialUrl}</p>
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

// --- Confirm Dialog ---

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  isLoading,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="w-full max-w-sm rounded-xl border border-border bg-background p-6 shadow-xl"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        <h2
          id="confirm-title"
          className="text-lg font-semibold text-foreground"
        >
          {title}
        </h2>
        <p
          id="confirm-message"
          className="mt-2 text-sm text-muted-foreground"
        >
          {message}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                <span className="ml-1">Deleting...</span>
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
