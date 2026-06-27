"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import { ProjectTable, type ProjectTableItem } from "@/components/admin/project-table";
import { ProjectForm } from "@/components/admin/project-form";
import { SortableList, DragHandle, type DragHandleProps } from "@/components/admin/sortable-list";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowUpDown, List, Loader2 } from "lucide-react";

type ViewMode = "table" | "reorder";

/** Full project shape returned by listAll, used for editing */
interface FullProject {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription: string | null;
  techStack: string[];
  category: "cybersecurity" | "cloud" | "web" | "other";
  githubUrl: string | null;
  liveUrl: string | null;
  thumbnailUrl: string | null;
  isFeatured: boolean;
  status: "draft" | "published";
  displayOrder: number;
}

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<FullProject | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const utils = trpc.useUtils();

  // Queries
  const {
    data: projects,
    isLoading,
    isError,
    error,
  } = trpc.projects.listAll.useQuery();

  // Mutations
  const deleteMutation = trpc.projects.delete.useMutation({
    onSuccess: () => {
      utils.projects.listAll.invalidate();
      setDeleteConfirmId(null);
      toast.success("Project deleted successfully");
    },
    onError: (err) => {
      toast.error("Failed to delete project", {
        description: err.message,
      });
    },
  });

  const updateMutation = trpc.projects.update.useMutation({
    onSuccess: () => {
      utils.projects.listAll.invalidate();
      toast.success("Project updated successfully");
    },
    onError: (err) => {
      toast.error("Failed to update project", {
        description: err.message,
      });
    },
  });

  const reorderMutation = trpc.projects.reorder.useMutation({
    onSuccess: () => {
      utils.projects.listAll.invalidate();
    },
    onError: (err) => {
      toast.error("Failed to reorder projects", {
        description: err.message,
      });
    },
  });

  // Handlers
  const handleNewProject = useCallback(() => {
    setEditingProject(null);
    setModalOpen(true);
  }, []);

  const handleEdit = useCallback(
    (project: ProjectTableItem) => {
      // Find the full project data from the query cache
      const full = projects?.find((p) => p.id === project.id);
      if (full) {
        setEditingProject(full as FullProject);
        setModalOpen(true);
      }
    },
    [projects]
  );

  const handleDelete = useCallback((id: string) => {
    setDeleteConfirmId(id);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deleteConfirmId) {
      deleteMutation.mutate({ id: deleteConfirmId });
    }
  }, [deleteConfirmId, deleteMutation]);

  const handleToggleStatus = useCallback(
    (id: string, currentStatus: "draft" | "published") => {
      const newStatus = currentStatus === "published" ? "draft" : "published";
      updateMutation.mutate({ id, status: newStatus });
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
    setEditingProject(null);
    utils.projects.listAll.invalidate();
    toast.success(editingProject ? "Project updated successfully" : "Project created successfully");
  }, [utils, editingProject]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden="true" />
        <p className="mt-3 text-sm text-muted-foreground">Loading projects...</p>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-sm font-medium text-destructive">
          Failed to load projects
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {error?.message ?? "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  const projectList: ProjectTableItem[] = (projects ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.category as ProjectTableItem["category"],
    status: p.status as ProjectTableItem["status"],
    displayOrder: p.displayOrder,
    isFeatured: p.isFeatured,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Projects
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your portfolio projects. Create, edit, reorder, and publish
            projects from here.
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

          {/* New project button */}
          <Button onClick={handleNewProject} size="sm">
            <Plus className="size-4" aria-hidden="true" />
            <span className="ml-1">New Project</span>
          </Button>
        </div>
      </div>

      {/* Reorder mode indicator */}
      {viewMode === "reorder" && projectList.length > 0 && (
        <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
          Drag and drop projects to reorder them. Changes are saved automatically.
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
        <ProjectTable
          projects={projectList}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />
      ) : (
        <SortableList
          items={projectList}
          onReorder={handleReorder}
          ariaLabel="Projects, drag to reorder"
          renderItem={(item, dragHandleProps) => (
            <SortableProjectItem item={item} dragHandleProps={dragHandleProps} />
          )}
        />
      )}

      {/* Form Modal */}
      {modalOpen && (
        <Modal
          title={editingProject ? "Edit Project" : "New Project"}
          onClose={() => {
            setModalOpen(false);
            setEditingProject(null);
          }}
        >
          <ProjectForm
            project={editingProject ?? undefined}
            onSuccess={handleFormSuccess}
          />
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <ConfirmDialog
          title="Delete Project"
          message="Are you sure you want to delete this project? This action cannot be undone."
          confirmLabel="Delete"
          isLoading={deleteMutation.isPending}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}
    </div>
  );
}

// --- Sortable Project Item for reorder view ---

function SortableProjectItem({
  item,
  dragHandleProps,
}: {
  item: ProjectTableItem;
  dragHandleProps: DragHandleProps;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <DragHandle dragHandleProps={dragHandleProps} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground truncate">
            {item.title}
          </span>
          {item.isFeatured && (
            <Badge variant="secondary" className="text-[10px]">
              Featured
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground">/{item.slug}</span>
      </div>
      <Badge variant={item.status === "published" ? "success" : "warning"}>
        {item.status === "published" ? "Published" : "Draft"}
      </Badge>
      <span className="text-xs text-muted-foreground tabular-nums">
        #{item.displayOrder}
      </span>
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
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
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
