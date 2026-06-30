"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import {
  History,
  Package,
  Briefcase,
  Award,
  Link2,
  FileText,
  Settings,
  Filter,
  Calendar,
  TrendingUp,
  Loader2,
  RotateCcw,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(typeof date === "string" ? new Date(date) : date);
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

export default function RevisionsPage() {
  const [filterEntityType, setFilterEntityType] = useState<string | null>(null);
  const [filterAction, setFilterAction] = useState<string | null>(null);

  const { data: revisions, isLoading: revisionsLoading } = trpc.revisions.getRecent.useQuery({ limit: 50 });
  const { data: stats } = trpc.revisions.stats.useQuery({ days: 30 });

  const filteredRevisions = revisions?.filter((rev) => {
    if (filterEntityType && rev.entityType !== filterEntityType) return false;
    if (filterAction && rev.action !== filterAction) return false;
    return true;
  });

  const entityTypes = [...new Set(revisions?.map((r) => r.entityType) ?? [])];
  const actions = [...new Set(revisions?.map((r) => r.action) ?? [])];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Revision History
        </h1>
        <p className="mt-2 text-muted-foreground">
          Track and restore all content changes across your site.
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revisions"
            value={stats.totalRevisions}
            icon={<History className="h-5 w-5" />}
          />
          <StatCard
            title="Edits This Month"
            value={stats.byAction?.update ?? 0}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatCard
            title="Content Created"
            value={stats.byAction?.create ?? 0}
            icon={<ArrowUpRight className="h-5 w-5" />}
          />
          <StatCard
            title="Last 7 Days"
            value={
              Object.entries(stats.byDay ?? {})
                .filter(([day]) => {
                  const diff = Date.now() - new Date(day).getTime();
                  return diff < 7 * 24 * 60 * 60 * 1000;
                })
                .reduce((sum, [, count]) => sum + count, 0)
            }
            icon={<Calendar className="h-5 w-5" />}
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter by:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterEntityType === null ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterEntityType(null)}
          >
            All Types
          </Button>
          {entityTypes.map((type) => (
            <Button
              key={type}
              variant={filterEntityType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterEntityType(type)}
            >
              {entityIcons[type]}
              <span className="ml-1 capitalize">{type.replace("_", " ")}</span>
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <Badge
              key={action}
              variant={filterAction === action ? "default" : "outline"}
              className={cn(
                "cursor-pointer capitalize",
                filterAction === action && actionColors[action]
              )}
              onClick={() => setFilterAction(filterAction === action ? null : action)}
            >
              {action}
            </Badge>
          ))}
        </div>
      </div>

      {/* Revision List */}
      {revisionsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredRevisions && filteredRevisions.length > 0 ? (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Entity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Time
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRevisions.map((revision) => (
                <tr key={revision.id} className="border-b last:border-b-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        {entityIcons[revision.entityType] ?? <FileText className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium capitalize">
                          {revision.entityType.replace("_", " ")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ID: {revision.entityId.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className={cn("capitalize", actionColors[revision.action])}>
                      {revision.action}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm">{revision.userEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm">{formatRelativeTime(revision.createdAt)}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(revision.createdAt)}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm">
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Restore
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <History className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No revisions found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {filterEntityType || filterAction
              ? "Try adjusting your filters"
              : "Content changes will appear here as you edit"}
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </div>
    </div>
  );
}