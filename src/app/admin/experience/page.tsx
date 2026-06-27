"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import { SortableList } from "@/components/admin/sortable-list";
import {
  ExperienceTable,
  SortableExperienceItem,
  type ExperienceItem,
} from "@/components/admin/experience-table";
import { ExperienceForm } from "@/components/admin/experience-form";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUpDown, List, Loader2 } from "lucide-react";

type ViewMode = "table" | "reorder";

export default function ExperiencePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<ExperienceItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const utils = trpc.useUtils();

  // Queries
  const {
    data: experiences,
    isLoading,
    isError,
    error,
  } = trpc.experience.listAll.useQuery();

  // Mutations
  const createMutation = trpc.experience.create.useMutation({
    onSuccess: () => {
      utils.experience.listAll.invalidate();
      setModalOpen(false);
      setEditingExperience(null);
      toast.success("Experience entry created successfully");
    },
    onError: (err) => {
      toast.error("Failed to create experience entry", { description: err.message });
    },
  });

  const updateMutation = trpc.experience.update.useMutation({
    onSuccess: () => {
      utils.experience.listAll.invalidate();
      setModalOpen(false);
      setEditingExperience(null);
      toast.success("Experience entry updated successfully");
    },
    onError: (err) => {
      toast.error("Failed to update experience entry", { description: err.message });
    },
  });

  const deleteMutation = trpc.experience.delete.useMutation({
    onSuccess: () => {
      utils.experience.listAll.invalidate();
      setDeleteConfirmId(null);
      toast.success("Experience entry deleted");
    },
    onError: (err) => {
      toast.error("Failed to delete experience entry", { description: err.message });
    },
  });

  const reorderMutation = trpc.experience.reorder.useMutation({
    onSuccess: () => {
      utils.experience.listAll.invalidate();
    },
    onError: (err) => {
      toast.error("Failed to reorder entries", { description: err.message });
    },
  });

  // Handlers
  const handleNewExperience = useCallback(() => {
    setEditingExperience(null);
    setModalOpen(true);
  }, []);

  const handleEdit = useCallback(
    (experience: ExperienceItem) => {
      setEditingExperience(experience);
      setModalOpen(true);
    },
    []
  );

  const handleDelete = useCallback((id: string) => {
    setDeleteConfirmId(id);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deleteConfirmId) {
      deleteMutation.mutate({ id: deleteConfirmId });
    }
  }, [deleteConfirmId, deleteMutation]);

  const handleToggleVisibility = useCallback(
    (id: string, currentVisibility: boolean) => {
      updateMutation.mutate({ id, isVisible: !currentVisibility });
    },
    [updateMutation]
  );

  const handleReorder = useCallback(
    (items: { id: string; displayOrder: number }[]) => {
      reorderMutation.mutate(items);
    },
    [reorderMutation]
  );

  const handleFormSuccess = useCallback(() => {
    setModalOpen(false);
    setEditingExperience(null);
    utils.experience.listAll.invalidate();
  }, [utils]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden="true" />
        <p className="mt-3 text-sm text-muted-foreground">Loading experiences...</p>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-sm font-medium text-destructive">
          Failed to load experiences
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {error?.message ?? "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  const experienceList: ExperienceItem[] = (experiences ?? []).map((e) => ({
    id: e.id,
    companyName: e.companyName,
    roleTitle: e.roleTitle,
    startDate: e.startDate,
    endDate: e.endDate,
    description: e.description,
    techStack: e.techStack ?? [],
    isVisible: e.isVisible,
    displayOrder: e.displayOrder,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Experience
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your work experience entries. Add roles, companies, and
            descriptions for your timeline.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
            aria-label="Table view"
            aria-pressed={viewMode === "table"}
          >
            <List className="size-4" aria-hidden="true" />
            <span className="ml-1 hidden sm:inline">List</span>
          </Button>
          <Button
            variant={viewMode === "reorder" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("reorder")}
            aria-label="Reorder view"
            aria-pressed={viewMode === "reorder"}
          >
            <ArrowUpDown className="size-4" aria-hidden="true" />
            <span className="ml-1 hidden sm:inline">Reorder</span>
          </Button>

          {/* Add Experience button */}
          <Button onClick={handleNewExperience} size="sm">
            <Plus className="size-4" aria-hidden="true" />
            <span className="ml-1">Add Experience</span>
          </Button>
        </div>
      </div>

      {/* Reorder mode indicator */}
      {viewMode === "reorder" && experienceList.length > 0 && (
        <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
          Drag and drop experiences to reorder them. Changes are saved automatically.
          {reorderMutation.isPending && (
            <span className="ml-2 inline-flex items-center gap-1">
              <Loader2 className="size-3 animate-spin" aria-hidden="true" />
              Saving...
            </span>
          )}
        </div>
      )}

      {/* Content based on view mode */}
      {viewMode === "table" ? (
        <ExperienceTable
          experiences={experienceList}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleVisibility={handleToggleVisibility}
        />
      ) : (
        <SortableList
          items={experienceList}
          onReorder={handleReorder}
          ariaLabel="Experience entries, drag to reorder"
          renderItem={(item, dragHandleProps) => (
            <SortableExperienceItem item={item} dragHandleProps={dragHandleProps} />
          )}
        />
      )}

      {/* Form Modal */}
      {modalOpen && (
        <Modal
          title={editingExperience ? "Edit Experience" : "Add Experience"}
          onClose={() => {
            setModalOpen(false);
            setEditingExperience(null);
          }}
        >
          <ExperienceForm
            experience={editingExperience ?? undefined}
            onSuccess={handleFormSuccess}
            createMutation={createMutation}
            updateMutation={updateMutation}
          />
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <ConfirmDialog
          title="Delete Experience"
          message="Are you sure you want to delete this experience entry? This action cannot be undone."
          confirmLabel="Delete"
          isLoading={deleteMutation.isPending}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}
    </div>
  );
}

// --- Modal component ---

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-[10vh]">
      <div
        className="relative w-full max-w-2xl rounded-xl border border-border bg-background shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2
            id="modal-title"
            className="text-lg font-semibold text-foreground"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close modal"
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

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}

// --- Confirm Dialog component ---

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
