"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import {
  Upload,
  X,
  File,
  Image,
  FileText,
  Trash2,
  Copy,
  CheckCircle,
  Loader2,
  Grid,
  List,
  Search,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "list";

interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: "image" | "pdf" | "other";
  size: number;
  uploadedAt: Date;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getFileIcon(type: string) {
  if (type === "image") return <Image className="h-8 w-8" />;
  if (type === "pdf") return <FileText className="h-8 w-8" />;
  return <File className="h-8 w-8" />;
}

export function MediaLibrary() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // In a real implementation, this would fetch from a media router
  // For now, we'll show placeholder data
  const mockMediaItems: MediaItem[] = [
    {
      id: "1",
      name: "project-thumb-1.png",
      url: "/uploads/project-thumb-1.png",
      type: "image",
      size: 245000,
      uploadedAt: new Date("2024-01-15"),
    },
    {
      id: "2",
      name: "resume-2024.pdf",
      url: "/uploads/resume-2024.pdf",
      type: "pdf",
      size: 89000,
      uploadedAt: new Date("2024-02-20"),
    },
    {
      id: "3",
      name: "og-image.png",
      url: "/uploads/og-image.png",
      type: "image",
      size: 156000,
      uploadedAt: new Date("2024-03-10"),
    },
  ];

  const filteredItems = mockMediaItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyUrl = useCallback(async (item: MediaItem) => {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopiedId(item.id);
      toast.success("URL copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  }, []);

  const handleDelete = useCallback((item: MediaItem) => {
    // In real implementation, this would call a delete mutation
    toast.success(`Deleted ${item.name}`);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Media Library</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage uploaded files and images
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center rounded-lg border border-border">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "rounded-l-lg px-3 py-2 transition-colors",
                viewMode === "grid"
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-muted"
              )}
              aria-label="Grid view"
            >
              <Grid className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "rounded-r-lg px-3 py-2 transition-colors",
                viewMode === "list"
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-muted"
              )}
              aria-label="List view"
            >
              <List className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Search and upload */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button disabled={isUploading}>
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span className="ml-2">Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" aria-hidden="true" />
              <span className="ml-2">Upload Files</span>
            </>
          )}
        </Button>
      </div>

      {/* Drop zone */}
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 text-center hover:border-accent transition-colors">
        <Upload className="h-10 w-10 text-muted-foreground mb-4" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">
          Drag and drop files here, or click Upload to browse
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Supports images (PNG, JPG, GIF, WebP) and PDFs up to 10MB
        </p>
      </div>

      {/* Media grid/list */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
          <p className="text-muted-foreground">No files found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {searchQuery ? "Try a different search term" : "Upload your first file to get started"}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              onCopy={() => handleCopyUrl(item)}
              onDelete={() => handleDelete(item)}
              isCopied={copiedId === item.id}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Size
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Uploaded
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <MediaRow
                  key={item.id}
                  item={item}
                  onCopy={() => handleCopyUrl(item)}
                  onDelete={() => handleDelete(item)}
                  isCopied={copiedId === item.id}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function MediaCard({
  item,
  onCopy,
  onDelete,
  isCopied,
}: {
  item: MediaItem;
  onCopy: () => void;
  onDelete: () => void;
  isCopied: boolean;
}) {
  return (
    <div className="group relative rounded-lg border border-border bg-background p-4 transition-colors hover:border-accent">
      {/* Preview */}
      <div className="flex aspect-square items-center justify-center rounded-lg bg-muted mb-3">
        {item.type === "image" ? (
          <div className="h-full w-full rounded-lg bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
            <Image className="h-12 w-12 text-muted-foreground/50" aria-hidden="true" />
          </div>
        ) : (
          <div className="text-muted-foreground">{getFileIcon(item.type)}</div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-1">
        <p className="truncate text-sm font-medium" title={item.name}>
          {item.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(item.size)} · {formatDate(item.uploadedAt)}
        </p>
      </div>

      {/* Actions */}
      <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onCopy}
          className="rounded-md bg-background/90 p-1.5 text-muted-foreground hover:text-foreground transition-colors shadow-sm"
          title="Copy URL"
        >
          {isCopied ? (
            <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
        <button
          onClick={onDelete}
          className="rounded-md bg-background/90 p-1.5 text-muted-foreground hover:text-destructive transition-colors shadow-sm"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function MediaRow({
  item,
  onCopy,
  onDelete,
  isCopied,
}: {
  item: MediaItem;
  onCopy: () => void;
  onDelete: () => void;
  isCopied: boolean;
}) {
  return (
    <tr className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            {getFileIcon(item.type)}
          </div>
          <span className="text-sm font-medium truncate max-w-[200px]" title={item.name}>
            {item.name}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="rounded bg-muted px-2 py-1 text-xs font-medium uppercase">
          {item.type}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formatFileSize(item.size)}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formatDate(item.uploadedAt)}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-1">
          <button
            onClick={onCopy}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Copy URL"
          >
            {isCopied ? (
              <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
          <button
            onClick={onDelete}
            className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </td>
    </tr>
  );
}
