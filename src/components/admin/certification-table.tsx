"use client";

import {
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  ShieldMinus,
} from "lucide-react";

import {
  SortableList,
  DragHandle,
  type DragHandleProps,
} from "@/components/admin/sortable-list";
import { Button } from "@/components/ui/button";

export interface CertificationTableItem {
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

interface CertificationTableProps {
  certifications: CertificationTableItem[];
  onEdit: (cert: CertificationTableItem) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (cert: CertificationTableItem) => void;
  onReorder: (items: { id: string; displayOrder: number }[]) => void;
  isToggling: boolean;
}

export function getExpiryStatus(
  expiryDate: string | null
): "expired" | "valid" | "no-expiry" {
  if (!expiryDate) return "no-expiry";
  return new Date(expiryDate) < new Date() ? "expired" : "valid";
}

export function CertificationTable({
  certifications,
  onEdit,
  onDelete,
  onToggleVisibility,
  onReorder,
  isToggling,
}: CertificationTableProps) {
  if (certifications.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-12 text-center">
        <p className="text-sm text-muted-foreground">
          No certifications yet. Click &quot;Add Certification&quot; to create your first one.
        </p>
      </div>
    );
  }

  return (
    <SortableList
      items={certifications}
      onReorder={onReorder}
      ariaLabel="Certifications, drag to reorder"
      renderItem={(item, dragHandleProps) => (
        <SortableCertItem
          item={item}
          dragHandleProps={dragHandleProps}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleVisibility={onToggleVisibility}
          isToggling={isToggling}
        />
      )}
    />
  );
}

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
  item: CertificationTableItem;
  dragHandleProps: DragHandleProps;
  onEdit: (cert: CertificationTableItem) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (cert: CertificationTableItem) => void;
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
          aria-label={
            item.isVisible
              ? `Hide ${item.certificationName}`
              : `Show ${item.certificationName}`
          }
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
          aria-label={`Edit ${item.certificationName}`}
        >
          <Pencil className="size-4" aria-hidden="true" />
        </Button>
        {/* Delete button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(item.id)}
          aria-label={`Delete ${item.certificationName}`}
        >
          <Trash2 className="size-4 text-destructive" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
