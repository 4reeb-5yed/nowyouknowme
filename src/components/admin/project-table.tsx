"use client";

import { Edit, Trash2, Eye, EyeOff, FolderOpen } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProjectCategory = "cybersecurity" | "cloud" | "web" | "other";
type ProjectStatus = "draft" | "published";

export interface ProjectTableItem {
  id: string;
  title: string;
  slug: string;
  category: ProjectCategory;
  status: ProjectStatus;
  displayOrder: number;
  isFeatured: boolean;
}

interface ProjectTableProps {
  projects: ProjectTableItem[];
  onEdit: (project: ProjectTableItem) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: ProjectStatus) => void;
}

const categoryBadgeVariant: Record<ProjectCategory, "cybersecurity" | "cloud" | "web" | "other"> = {
  cybersecurity: "cybersecurity",
  cloud: "cloud",
  web: "web",
  other: "other",
};

const categoryLabel: Record<ProjectCategory, string> = {
  cybersecurity: "Cybersecurity",
  cloud: "Cloud",
  web: "Web",
  other: "Other",
};

export function ProjectTable({
  projects,
  onEdit,
  onDelete,
  onToggleStatus,
}: ProjectTableProps) {
  if (projects.length === 0) {
    return <ProjectTableEmpty />;
  }

  return (
    <>
      {/* Desktop table view */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Title
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Category
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Order
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr
                key={project.id}
                className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      {project.title}
                    </span>
                    {project.isFeatured && (
                      <Badge variant="secondary" className="text-[10px]">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    /{project.slug}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={categoryBadgeVariant[project.category]}>
                    {categoryLabel[project.category]}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={project.status} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {project.displayOrder}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onToggleStatus(project.id, project.status)}
                      aria-label={
                        project.status === "published"
                          ? `Unpublish ${project.title}`
                          : `Publish ${project.title}`
                      }
                      title={
                        project.status === "published"
                          ? "Set to draft"
                          : "Publish"
                      }
                    >
                      {project.status === "published" ? (
                        <EyeOff className="size-4" aria-hidden="true" />
                      ) : (
                        <Eye className="size-4" aria-hidden="true" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onEdit(project)}
                      aria-label={`Edit ${project.title}`}
                    >
                      <Edit className="size-4" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon-sm"
                      onClick={() => onDelete(project.id)}
                      aria-label={`Delete ${project.title}`}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
          />
        ))}
      </div>
    </>
  );
}

function ProjectCard({
  project,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  project: ProjectTableItem;
  onEdit: (project: ProjectTableItem) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: ProjectStatus) => void;
}) {
  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium text-foreground truncate">
              {project.title}
            </h3>
            {project.isFeatured && (
              <Badge variant="secondary" className="text-[10px]">
                Featured
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">/{project.slug}</p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={categoryBadgeVariant[project.category]}>
          {categoryLabel[project.category]}
        </Badge>
        <span className="text-xs text-muted-foreground">
          Order: {project.displayOrder}
        </span>
      </div>

      <div className="flex items-center gap-1 pt-1 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleStatus(project.id, project.status)}
          aria-label={
            project.status === "published"
              ? `Unpublish ${project.title}`
              : `Publish ${project.title}`
          }
        >
          {project.status === "published" ? (
            <EyeOff className="size-3.5" aria-hidden="true" />
          ) : (
            <Eye className="size-3.5" aria-hidden="true" />
          )}
          <span className="ml-1">
            {project.status === "published" ? "Unpublish" : "Publish"}
          </span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(project)}
          aria-label={`Edit ${project.title}`}
        >
          <Edit className="size-3.5" aria-hidden="true" />
          <span className="ml-1">Edit</span>
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(project.id)}
          aria-label={`Delete ${project.title}`}
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
          <span className="ml-1">Delete</span>
        </Button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge variant={status === "published" ? "success" : "warning"}>
      {status === "published" ? "Published" : "Draft"}
    </Badge>
  );
}

function ProjectTableEmpty() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-3 mb-4">
        <FolderOpen className="size-6 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-medium text-foreground mb-1">
        No projects yet
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Create your first project to showcase your work. It will appear here once
        added.
      </p>
    </div>
  );
}
