"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import {
  CertificationTable,
  type CertificationTableItem,
} from "@/components/admin/certification-table";
import {
  CertificationForm,
  type CertFormData,
} from "@/components/admin/certification-form";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";

export default function CertificationsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<CertificationTableItem | null>(null);
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

  const handleEdit = useCallback((cert: CertificationTableItem) => {
    setEditingCert(cert);
    setFormOpen(true);
  }, []);

  const handleToggleVisibility = useCallback(
    (cert: CertificationTableItem) => {
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
    (data: CertFormData) => {
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

  const certList: CertificationTableItem[] = (certifications ?? []).map((c) => ({
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

      {/* Certification table / sortable list */}
      <CertificationTable
        certifications={certList}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleVisibility={handleToggleVisibility}
        onReorder={handleReorder}
        isToggling={updateMutation.isPending}
      />

      {/* Add/Edit Form Modal */}
      {formOpen && (
        <CertificationForm
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
