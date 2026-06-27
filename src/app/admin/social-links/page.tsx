"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import { SortableList, DragHandle, type DragHandleProps } from "@/components/admin/sortable-list";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  displayOrder: number;
  isVisible: boolean;
}

export default function SocialLinksPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const utils = trpc.useUtils();

  // Query
  const { data: links, isLoading, isError, error } = trpc.socialLinks.listAll.useQuery();

  // Mutations
  const createMutation = trpc.socialLinks.create.useMutation({
    onSuccess: () => {
      utils.socialLinks.listAll.invalidate();
      setFormOpen(false);
      toast.success("Social link added successfully");
    },
    onError: (err) => {
      toast.error("Failed to add social link", { description: err.message });
    },
  });

  const updateMutation = trpc.socialLinks.update.useMutation({
    onSuccess: () => {
      utils.socialLinks.listAll.invalidate();
      setEditingLink(null);
      setFormOpen(false);
      toast.success("Social link updated successfully");
    },
    onError: (err) => {
      toast.error("Failed to update social link", { description: err.message });
    },
  });

  const deleteMutation = trpc.socialLinks.delete.useMutation({
    onSuccess: () => {
      utils.socialLinks.listAll.invalidate();
      setDeleteConfirmId(null);
      toast.success("Social link deleted");
    },
    onError: (err) => {
      toast.error("Failed to delete social link", { description: err.message });
    },
  });

  const reorderMutation = trpc.socialLinks.reorder.useMutation({
    onSuccess: () => {
      utils.socialLinks.listAll.invalidate();
    },
    onError: (err) => {
      toast.error("Failed to reorder links", { description: err.message });
    },
  });

  // Handlers
  const handleAddLink = useCallback(() => {
    setEditingLink(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((link: SocialLink) => {
    setEditingLink(link);
    setFormOpen(true);
  }, []);

  const handleToggleVisibility = useCallback(
    (link: SocialLink) => {
      updateMutation.mutate({ id: link.id, isVisible: !link.isVisible });
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
    (data: { platform: string; url: string }) => {
      if (editingLink) {
        updateMutation.mutate({ id: editingLink.id, ...data });
      } else {
        createMutation.mutate(data);
      }
    },
    [editingLink, createMutation, updateMutation]
  );

  const handleFormCancel = useCallback(() => {
    setFormOpen(false);
    setEditingLink(null);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden="true" />
        <p className="mt-3 text-sm text-muted-foreground">Loading social links...</p>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-sm font-medium text-destructive">
          Failed to load social links
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {error?.message ?? "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  const linkList: SocialLink[] = (links ?? []).map((l) => ({
    id: l.id,
    platform: l.platform,
    url: l.url,
    displayOrder: l.displayOrder,
    isVisible: l.isVisible,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Social Links
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your social media links. Add, remove, and reorder the links
            displayed on your site.
          </p>
        </div>
        <Button onClick={handleAddLink} size="sm">
          <Plus className="size-4" aria-hidden="true" />
          <span className="ml-1">Add Link</span>
        </Button>
      </div>

      {/* Reorder hint */}
      {linkList.length > 1 && (
        <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
          Drag and drop links to reorder them. Changes are saved automatically.
          {reorderMutation.isPending && (
            <span className="ml-2 inline-flex items-center gap-1">
              <Loader2 className="size-3 animate-spin" aria-hidden="true" />
              Saving...
            </span>
          )}
        </div>
      )}

      {/* Empty state */}
      {linkList.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No social links yet. Click &quot;Add Link&quot; to create your first one.
          </p>
        </div>
      )}

      {/* Sortable list */}
      {linkList.length > 0 && (
        <SortableList
          items={linkList}
          onReorder={handleReorder}
          ariaLabel="Social links, drag to reorder"
          renderItem={(item, dragHandleProps) => (
            <SortableLinkItem
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
        <SocialLinkFormModal
          link={editingLink}
          isLoading={createMutation.isPending || updateMutation.isPending}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <ConfirmDialog
          title="Delete Social Link"
          message="Are you sure you want to delete this social link? This action cannot be undone."
          confirmLabel="Delete"
          isLoading={deleteMutation.isPending}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}
    </div>
  );
}

// --- Sortable Link Item ---

function SortableLinkItem({
  item,
  dragHandleProps,
  onEdit,
  onDelete,
  onToggleVisibility,
  isToggling,
}: {
  item: SocialLink;
  dragHandleProps: DragHandleProps;
  onEdit: (link: SocialLink) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (link: SocialLink) => void;
  isToggling: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <DragHandle dragHandleProps={dragHandleProps} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground truncate">
            {item.platform}
          </span>
          {!item.isVisible && (
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              Hidden
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground truncate block">
          {item.url}
        </span>
      </div>
      <div className="flex items-center gap-1">
        {/* Visibility toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleVisibility(item)}
          disabled={isToggling}
          aria-label={item.isVisible ? `Hide ${item.platform} link` : `Show ${item.platform} link`}
          title={item.isVisible ? "Hide link" : "Show link"}
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
          aria-label={`Edit ${item.platform} link`}
        >
          <Pencil className="size-4" aria-hidden="true" />
        </Button>
        {/* Delete button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(item.id)}
          aria-label={`Delete ${item.platform} link`}
        >
          <Trash2 className="size-4 text-destructive" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

// --- Social Link Form Modal ---

function SocialLinkFormModal({
  link,
  isLoading,
  onSubmit,
  onCancel,
}: {
  link: SocialLink | null;
  isLoading: boolean;
  onSubmit: (data: { platform: string; url: string }) => void;
  onCancel: () => void;
}) {
  const [platform, setPlatform] = useState(link?.platform ?? "");
  const [url, setUrl] = useState(link?.url ?? "");
  const [errors, setErrors] = useState<{ platform?: string; url?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { platform?: string; url?: string } = {};

    if (!platform.trim()) {
      newErrors.platform = "Platform is required";
    }
    if (!url.trim()) {
      newErrors.url = "URL is required";
    } else {
      try {
        new URL(url);
      } catch {
        newErrors.url = "Please enter a valid URL";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit({ platform: platform.trim(), url: url.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-[10vh]">
      <div
        className="relative w-full max-w-md rounded-xl border border-border bg-background shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="social-link-form-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2
            id="social-link-form-title"
            className="text-lg font-semibold text-foreground"
          >
            {link ? "Edit Social Link" : "Add Social Link"}
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
          <div>
            <label
              htmlFor="platform"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Platform
            </label>
            <input
              id="platform"
              type="text"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="e.g. GitHub, LinkedIn, Twitter"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={100}
              aria-required="true"
              aria-invalid={errors.platform ? true : undefined}
              aria-describedby={errors.platform ? "platform-error" : undefined}
            />
            {errors.platform && (
              <p id="platform-error" role="alert" className="mt-1 text-xs text-destructive">{errors.platform}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="url"
              className="block text-sm font-medium text-foreground mb-1"
            >
              URL
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/username"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={500}
              aria-required="true"
              aria-invalid={errors.url ? true : undefined}
              aria-describedby={errors.url ? "url-error" : undefined}
            />
            {errors.url && (
              <p id="url-error" role="alert" className="mt-1 text-xs text-destructive">{errors.url}</p>
            )}
          </div>

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
              ) : link ? (
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
