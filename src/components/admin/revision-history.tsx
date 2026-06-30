"use client";

import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import {
  History,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  FileText,
  Package,
  Briefcase,
  Award,
  Link2,
  Settings,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Revision data type (matches tRPC output)
interface RevisionData {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  userEmail: string;
  snapshot: Record<string, unknown> | null;
  description: string | null;
  createdAt: Date | string;
}

interface RevisionHistoryProps {
  entityId: string;
  entityType: string;
  entityName?: string;
  maxDisplay?: number;
}

const entityIcons: Record<string, React.ReactNode> = {
  project: <Package className="h-4 w-4" />,
  experience: <Briefcase className="h-4 w-4" />,
  certification: <Award className="h-4 w-4" />,
  social_link: <Link2 className="h-4 w-4" />,
  section: <FileText className="h-4 w-4" />,
  site_config: <Settings className="h-4 w-4" />,
};

const actionColors: Record<string, string> = {
  create: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  update: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  delete: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  publish: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  unpublish: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
};

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(d);
}

export function RevisionHistory({
  entityId,
  entityType,
  maxDisplay = 10,
}: RevisionHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: revisions, isLoading, error } = trpc.revisions.getEntityRevisions.useQuery({
    entityId,
    entityType,
    limit: maxDisplay,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Failed to load revisions</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  if (!revisions || revisions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-center">
        <History className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">No revision history</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Changes to this {entityType.replace("_", " ")} will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium">Revision History</h3>
        </div>
        <Badge variant="secondary">{revisions.length} revisions</Badge>
      </div>

      {/* Revision List */}
      <div className="space-y-2">
        {revisions.map((revision) => (
          <RevisionItem
            key={revision.id}
            revision={revision as RevisionData}
            isExpanded={expandedId === revision.id}
            onToggle={() => setExpandedId(expandedId === revision.id ? null : revision.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface RevisionItemProps {
  revision: RevisionData;
  isExpanded: boolean;
  onToggle: () => void;
}

function RevisionItem({
  revision,
  isExpanded,
  onToggle,
}: RevisionItemProps) {
  const snapshot = revision.snapshot ?? {};
  
  // Extract display-relevant fields from snapshot
  const displayFields = Object.entries(snapshot as Record<string, unknown>)
    .filter(([key]) => {
      // Skip internal fields
      const skipKeys = ["id", "createdAt", "updatedAt", "userId", "displayOrder", "__typename"];
      return !skipKeys.includes(key) && !key.endsWith("Id");
    })
    .slice(0, 5); // Limit to 5 fields

  return (
    <div
      className={cn(
        "rounded-lg border bg-background transition-colors",
        isExpanded && "border-primary/50"
      )}
    >
      {/* Revision Header */}
      <div className="flex items-center gap-3 p-3">
        {/* Entity Icon */}
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground shrink-0">
          {entityIcons[revision.entityType] ?? <FileText className="h-4 w-4" />}
        </div>

        {/* Revision Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={cn("text-xs", actionColors[revision.action] ?? "")}
            >
              {revision.action}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {formatRelativeTime(new Date(revision.createdAt))}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            {revision.userEmail}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-8 px-2"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-border p-3 bg-muted/30">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">
            Snapshot at time of change
          </h4>
          <div className="space-y-1.5">
            {displayFields.map(([key, value]) => (
              <div key={key} className="flex items-start gap-2 text-sm">
                <span className="text-muted-foreground capitalize shrink-0 w-24 truncate">
                  {key.replace(/([A-Z])/g, " $1").trim()}:
                </span>
                <span className="text-foreground break-all">
                  {formatValue(value)}
                </span>
              </div>
            ))}
          </div>
          {revision.description && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground italic">
                &quot;{revision.description}&quot;
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") {
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(", ") : "—";
    }
    return JSON.stringify(value);
  }
  return String(value);
}

/**
 * Compact revision history badge for inline display
 */
export function RevisionCountBadge({ entityId, entityType }: { entityId: string; entityType: string }) {
  const { data } = trpc.revisions.getEntityRevisions.useQuery({
    entityId,
    entityType,
    limit: 1,
  });

  if (!data || data.length === 0) return null;

  return (
    <Badge variant="outline" className="text-xs gap-1">
      <History className="h-3 w-3" />
      {data.length}
    </Badge>
  );
}