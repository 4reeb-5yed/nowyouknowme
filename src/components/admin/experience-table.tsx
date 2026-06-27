"use client";

import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DragHandle, type DragHandleProps } from "@/components/admin/sortable-list";

/**
 * A single work experience entry as presented in the CMS admin UI.
 *
 * This is the shape the {@link ExperienceTable} and {@link SortableExperienceItem}
 * presentational components operate on. It is intentionally decoupled from the
 * tRPC/Drizzle record so the page can map server data into the props these
 * components expect.
 */
export interface ExperienceItem {
  id: string;
  companyName: string;
  roleTitle: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
  techStack: string[];
  isVisible: boolean;
  displayOrder: number;
}

interface ExperienceTableProps {
  experiences: ExperienceItem[];
  onEdit: (experience: ExperienceItem) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string, currentVisibility: boolean) => void;
}

/**
 * ExperienceTable renders work experience entries in a table layout with
 * columns for company, role, date range, visibility, and per-row actions.
 *
 * It is fully controlled and presentational: all data arrives via props and
 * all interactions are surfaced through callbacks. It performs no API or
 * data-access calls directly.
 */
export function ExperienceTable({
  experiences,
  onEdit,
  onDelete,
  onToggleVisibility,
}: ExperienceTableProps) {
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
      <table className="w-full text-sm" aria-label="Experience entries">
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
                    aria-label={
                      exp.isVisible
                        ? `Hide ${exp.companyName} — ${exp.roleTitle}`
                        : `Show ${exp.companyName} — ${exp.roleTitle}`
                    }
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
                    aria-label={`Edit ${exp.companyName} — ${exp.roleTitle}`}
                  >
                    <Pencil className="size-3.5" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onDelete(exp.id)}
                    aria-label={`Delete ${exp.companyName} — ${exp.roleTitle}`}
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

interface SortableExperienceItemProps {
  item: ExperienceItem;
  dragHandleProps: DragHandleProps;
}

/**
 * SortableExperienceItem renders a single experience row for the drag-and-drop
 * reorder view. It is presentational and receives its drag handle wiring via
 * props from the surrounding {@link SortableList}.
 */
export function SortableExperienceItem({
  item,
  dragHandleProps,
}: SortableExperienceItemProps) {
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

/**
 * Formats a start/end date pair into a human-readable range.
 * A null end date renders as "Present" (current position).
 */
export function formatDateRange(startDate: string, endDate: string | null): string {
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
