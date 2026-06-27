"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import { SortableList, DragHandle, type DragHandleProps } from "@/components/admin/sortable-list";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowUpDown, List, Loader2, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { experienceCreateSchema } from "@/lib/validators/experience";

type ViewMode = "table" | "reorder";

interface ExperienceItem {
  id: string;
  companyName: string;
  roleTitle: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
  techStack: string[] | null;
  isVisible: boolean;
  displayOrder: number;
}

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
    techStack: e.techStack,
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
          >
            <List className="size-4" aria-hidden="true" />
            <span className="ml-1 hidden sm:inline">List</span>
          </Button>
          <Button
            variant={viewMode === "reorder" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("reorder")}
            aria-label="Reorder view"
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


// --- Experience Table ---

function ExperienceTable({
  experiences,
  onEdit,
  onDelete,
  onToggleVisibility,
}: {
  experiences: ExperienceItem[];
  onEdit: (experience: ExperienceItem) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string, currentVisibility: boolean) => void;
}) {
  if (experiences.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-12 text-center">
        <p className="text-sm text-muted-foreground">
          No experience entries yet. Add your first one to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Company
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Role
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Date Range
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Visibility
            </th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {experiences.map((exp) => (
            <tr key={exp.id} className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3 font-medium text-foreground">
                {exp.companyName}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {exp.roleTitle}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {formatDateRange(exp.startDate, exp.endDate)}
              </td>
              <td className="px-4 py-3">
                <Badge variant={exp.isVisible ? "success" : "warning"}>
                  {exp.isVisible ? "Visible" : "Hidden"}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onToggleVisibility(exp.id, exp.isVisible)}
                    aria-label={exp.isVisible ? "Hide experience" : "Show experience"}
                  >
                    {exp.isVisible ? (
                      <EyeOff className="size-3.5" aria-hidden="true" />
                    ) : (
                      <Eye className="size-3.5" aria-hidden="true" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onEdit(exp)}
                    aria-label="Edit experience"
                  >
                    <Pencil className="size-3.5" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onDelete(exp.id)}
                    aria-label="Delete experience"
                  >
                    <Trash2 className="size-3.5 text-destructive" aria-hidden="true" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Sortable Experience Item for reorder view ---

function SortableExperienceItem({
  item,
  dragHandleProps,
}: {
  item: ExperienceItem;
  dragHandleProps: DragHandleProps;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <DragHandle dragHandleProps={dragHandleProps} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground truncate">
            {item.companyName}
          </span>
          <span className="text-xs text-muted-foreground truncate">
            — {item.roleTitle}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatDateRange(item.startDate, item.endDate)}
        </span>
      </div>
      <Badge variant={item.isVisible ? "success" : "warning"}>
        {item.isVisible ? "Visible" : "Hidden"}
      </Badge>
      <span className="text-xs text-muted-foreground tabular-nums">
        #{item.displayOrder}
      </span>
    </div>
  );
}


// --- Experience Form ---

interface ExperienceFormProps {
  experience?: ExperienceItem;
  onSuccess: () => void;
  createMutation: ReturnType<typeof trpc.experience.create.useMutation>;
  updateMutation: ReturnType<typeof trpc.experience.update.useMutation>;
}

function ExperienceForm({
  experience,
  onSuccess,
  createMutation,
  updateMutation,
}: ExperienceFormProps) {
  const [companyName, setCompanyName] = useState(experience?.companyName ?? "");
  const [roleTitle, setRoleTitle] = useState(experience?.roleTitle ?? "");
  const [startDate, setStartDate] = useState(experience?.startDate ?? "");
  const [endDate, setEndDate] = useState(experience?.endDate ?? "");
  const [description, setDescription] = useState(experience?.description ?? "");
  const [techStack, setTechStack] = useState(experience?.techStack?.join(", ") ?? "");
  const [isVisible, setIsVisible] = useState(experience?.isVisible ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!experience;
  const isPending = createMutation.isPending || updateMutation.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const techStackArray = techStack
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const formData = {
      companyName,
      roleTitle,
      startDate,
      endDate: endDate || null,
      description: description || null,
      techStack: techStackArray,
      isVisible,
    };

    // Validate with experienceCreateSchema
    const result = experienceCreateSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join(".");
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    if (isEditing) {
      updateMutation.mutate(
        { id: experience.id, ...result.data },
        { onSuccess }
      );
    } else {
      createMutation.mutate(result.data, { onSuccess });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Company Name */}
      <div>
        <label htmlFor="companyName" className="block text-sm font-medium text-foreground">
          Company Name <span className="text-destructive">*</span>
        </label>
        <input
          id="companyName"
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="e.g. Google"
        />
        {errors.companyName && (
          <p className="mt-1 text-xs text-destructive">{errors.companyName}</p>
        )}
      </div>

      {/* Role Title */}
      <div>
        <label htmlFor="roleTitle" className="block text-sm font-medium text-foreground">
          Role Title <span className="text-destructive">*</span>
        </label>
        <input
          id="roleTitle"
          type="text"
          value={roleTitle}
          onChange={(e) => setRoleTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="e.g. Senior Software Engineer"
        />
        {errors.roleTitle && (
          <p className="mt-1 text-xs text-destructive">{errors.roleTitle}</p>
        )}
      </div>

      {/* Date fields */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-foreground">
            Start Date <span className="text-destructive">*</span>
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {errors.startDate && (
            <p className="mt-1 text-xs text-destructive">{errors.startDate}</p>
          )}
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-foreground">
            End Date <span className="text-muted-foreground">(optional)</span>
          </label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {errors.endDate && (
            <p className="mt-1 text-xs text-destructive">{errors.endDate}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-foreground">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring resize-y"
          placeholder="Describe your role and achievements..."
        />
        {errors.description && (
          <p className="mt-1 text-xs text-destructive">{errors.description}</p>
        )}
      </div>

      {/* Tech Stack */}
      <div>
        <label htmlFor="techStack" className="block text-sm font-medium text-foreground">
          Tech Stack <span className="text-muted-foreground">(comma-separated)</span>
        </label>
        <input
          id="techStack"
          type="text"
          value={techStack}
          onChange={(e) => setTechStack(e.target.value)}
          className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="e.g. React, TypeScript, AWS"
        />
        {errors.techStack && (
          <p className="mt-1 text-xs text-destructive">{errors.techStack}</p>
        )}
      </div>

      {/* Visibility */}
      <div className="flex items-center gap-2">
        <input
          id="isVisible"
          type="checkbox"
          checked={isVisible}
          onChange={(e) => setIsVisible(e.target.checked)}
          className="size-4 rounded border-border text-primary focus:ring-ring"
        />
        <label htmlFor="isVisible" className="text-sm font-medium text-foreground">
          Visible on public site
        </label>
      </div>

      {/* Server error */}
      {(createMutation.error || updateMutation.error) && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {createMutation.error?.message || updateMutation.error?.message}
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="size-3 animate-spin" aria-hidden="true" />
              <span className="ml-1">Saving...</span>
            </>
          ) : isEditing ? (
            "Update Experience"
          ) : (
            "Create Experience"
          )}
        </Button>
      </div>
    </form>
  );
}


// --- Utility: format date range ---

function formatDateRange(startDate: string, endDate: string | null): string {
  const start = new Date(startDate).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
  if (!endDate) {
    return `${start} — Present`;
  }
  const end = new Date(endDate).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
  return `${start} — ${end}`;
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
