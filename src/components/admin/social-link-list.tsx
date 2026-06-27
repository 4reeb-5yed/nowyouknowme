"use client";

import { Plus, Loader2, Pencil, Trash2, Eye, EyeOff, Link2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  SortableList,
  DragHandle,
  type DragHandleProps,
} from "@/components/admin/sortable-list";

export interface SocialLinkItem {
  id: string;
  platform: string;
  url: string;
  displayOrder: number;
  isVisible: boolean;
}

interface SocialLinkListProps {
  links: SocialLinkItem[];
  onAdd: () => void;
  onEdit: (link: SocialLinkItem) => void;
  onDelete: (id: string) => void;
  onReorder: (items: { id: string; displayOrder: number }[]) => void;
  onToggleVisibility: (link: SocialLinkItem) => void;
  isToggling?: boolean;
  isReordering?: boolean;
}

/**
 * SocialLinkList renders the admin management UI for social links.
 *
 * It owns the presentational concerns — header with an add action, reorder
 * hint, empty state, and a drag-and-drop sortable list with per-item edit,
 * delete, and visibility-toggle actions. All data and state transitions are
 * delegated to the parent via callbacks, keeping this component free of any
 * direct API or data-access calls.
 */
export function SocialLinkList({
  links,
  onAdd,
  onEdit,
  onDelete,
  onReorder,
  onToggleVisibility,
  isToggling = false,
  isReordering = false,
}: SocialLinkListProps) {
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
        <Button onClick={onAdd} size="sm">
          <Plus className="size-4" aria-hidden="true" />
          <span className="ml-1">Add Link</span>
        </Button>
      </div>

      {/* Reorder hint */}
      {links.length > 1 && (
        <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
          Drag and drop links to reorder them. Changes are saved automatically.
          {isReordering && (
            <span className="ml-2 inline-flex items-center gap-1">
              <Loader2 className="size-3 animate-spin" aria-hidden="true" />
              Saving...
            </span>
          )}
        </div>
      )}

      {/* Empty state */}
      {links.length === 0 && <SocialLinkListEmpty />}

      {/* Sortable list */}
      {links.length > 0 && (
        <SortableList
          items={links}
          onReorder={onReorder}
          ariaLabel="Social links, drag to reorder"
          renderItem={(item, dragHandleProps) => (
            <SortableLinkItem
              item={item}
              dragHandleProps={dragHandleProps}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleVisibility={onToggleVisibility}
              isToggling={isToggling}
            />
          )}
        />
      )}
    </div>
  );
}

function SortableLinkItem({
  item,
  dragHandleProps,
  onEdit,
  onDelete,
  onToggleVisibility,
  isToggling,
}: {
  item: SocialLinkItem;
  dragHandleProps: DragHandleProps;
  onEdit: (link: SocialLinkItem) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (link: SocialLinkItem) => void;
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

function SocialLinkListEmpty() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-3 mb-4">
        <Link2 className="size-6 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-medium text-foreground mb-1">
        No social links yet
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Click &quot;Add Link&quot; to create your first one. It will appear here
        once added.
      </p>
    </div>
  );
}
