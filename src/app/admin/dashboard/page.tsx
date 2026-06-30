"use client";

import Link from "next/link";
import {
  FolderGit2,
  Briefcase,
  Award,
  LinkIcon,
  Loader2,
  ArrowRight,
  Clock,
  Activity,
  Plus,
  Edit,
  Trash2,
  Upload,
  Eye,
  RefreshCw,
  TrendingUp,
  Calendar,
} from "lucide-react";

import { trpc } from "@/lib/trpc/client";

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  href: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatCard({ title, value, subtitle, icon, href, trend }: StatCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-border bg-background p-6 shadow-sm transition-colors hover:border-accent hover:bg-accent/5"
    >
      <div className="flex items-start justify-between">
        <div className="rounded-lg bg-muted p-2.5 text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent-foreground transition-colors">
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
            <TrendingUp className={`h-3 w-3 ${trend.isPositive ? "" : "rotate-180"}`} aria-hidden="true" />
            {trend.value}%
          </div>
        )}
        <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold tracking-tight text-foreground">
          {value}
        </p>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {subtitle && (
          <p className="mt-1 text-xs text-muted-foreground/70">{subtitle}</p>
        )}
      </div>
    </Link>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-background p-6 shadow-sm animate-pulse">
      <div className="flex items-start justify-between">
        <div className="h-10 w-10 rounded-lg bg-muted" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-7 w-16 rounded bg-muted" />
        <div className="h-4 w-24 rounded bg-muted" />
      </div>
    </div>
  );
}

// Activity icons mapping
const activityIcons: Record<string, React.ReactNode> = {
  create: <Plus className="h-3.5 w-3.5 text-green-500" />,
  update: <Edit className="h-3.5 w-3.5 text-blue-500" />,
  delete: <Trash2 className="h-3.5 w-3.5 text-red-500" />,
  publish: <Eye className="h-3.5 w-3.5 text-purple-500" />,
  unpublish: <Eye className="h-3.5 w-3.5 text-yellow-500" />,
  reorder: <RefreshCw className="h-3.5 w-3.5 text-orange-500" />,
  upload: <Upload className="h-3.5 w-3.5 text-teal-500" />,
};

const entityTypeLabels: Record<string, string> = {
  project: "Project",
  experience: "Experience",
  certification: "Certification",
  resume: "Resume",
  social_link: "Social Link",
  section: "Section",
  site_config: "Site Config",
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function DashboardPage() {
  const {
    data: projects,
    isLoading: projectsLoading,
    isError: projectsError,
  } = trpc.projects.listAll.useQuery();

  const {
    data: experiences,
    isLoading: experiencesLoading,
    isError: experiencesError,
  } = trpc.experience.listAll.useQuery();

  const {
    data: certifications,
    isLoading: certificationsLoading,
    isError: certificationsError,
  } = trpc.certifications.listAll.useQuery();

  const {
    data: socialLinks,
    isLoading: socialLinksLoading,
    isError: socialLinksError,
  } = trpc.socialLinks.listAll.useQuery();

  // Activity logs
  const {
    data: activityLogs,
    isLoading: activityLogsLoading,
  } = trpc.activityLog.list.useQuery({ limit: 10 });

  const isLoading =
    projectsLoading || experiencesLoading || certificationsLoading || socialLinksLoading;
  const isError =
    projectsError || experiencesError || certificationsError || socialLinksError;

  // Compute stats
  const totalProjects = projects?.length ?? 0;
  const publishedProjects = projects?.filter((p) => p.status === "published").length ?? 0;
  const draftProjects = totalProjects - publishedProjects;
  const totalExperience = experiences?.length ?? 0;
  const totalCertifications = certifications?.length ?? 0;
  const totalSocialLinks = socialLinks?.length ?? 0;

  // Compute last updated timestamp from most recently modified content
  const allTimestamps: Date[] = [];
  if (projects) {
    projects.forEach((p) => {
      if (p.updatedAt) allTimestamps.push(new Date(p.updatedAt));
    });
  }
  if (experiences) {
    experiences.forEach((e) => {
      if (e.updatedAt) allTimestamps.push(new Date(e.updatedAt));
    });
  }
  if (certifications) {
    certifications.forEach((c) => {
      if (c.updatedAt) allTimestamps.push(new Date(c.updatedAt));
    });
  }

  const lastUpdated =
    allTimestamps.length > 0
      ? new Date(Math.max(...allTimestamps.map((d) => d.getTime())))
      : null;

  // Error state
  if (isError && !isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Welcome back! Here&apos;s an overview of your portfolio.
          </p>
        </div>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-sm font-medium text-destructive">
            Failed to load dashboard data
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Welcome back! Here&apos;s an overview of your portfolio.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
            View Site
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Projects"
              value={totalProjects}
              subtitle={`${publishedProjects} published · ${draftProjects} draft`}
              icon={<FolderGit2 className="size-5" aria-hidden="true" />}
              href="/admin/projects"
            />
            <StatCard
              title="Experience"
              value={totalExperience}
              subtitle={`${totalExperience} ${totalExperience === 1 ? "entry" : "entries"}`}
              icon={<Briefcase className="size-5" aria-hidden="true" />}
              href="/admin/experience"
            />
            <StatCard
              title="Certifications"
              value={totalCertifications}
              subtitle={`${totalCertifications} ${totalCertifications === 1 ? "certification" : "certifications"}`}
              icon={<Award className="size-5" aria-hidden="true" />}
              href="/admin/certifications"
            />
            <StatCard
              title="Social Links"
              value={totalSocialLinks}
              subtitle={`${totalSocialLinks} ${totalSocialLinks === 1 ? "link" : "links"} configured`}
              icon={<LinkIcon className="size-5" aria-hidden="true" />}
              href="/admin/social-links"
            />
          </>
        )}
      </div>

      {/* Two column layout: Activity + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-background p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
            </div>
          </div>
          
          {activityLogsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="h-8 w-8 rounded-full bg-muted" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 w-48 rounded bg-muted" />
                    <div className="h-3 w-24 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : activityLogs && activityLogs.length > 0 ? (
            <div className="space-y-3">
              {activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center gap-3 rounded-lg p-2 -mx-2 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    {activityIcons[log.action] ?? <Activity className="h-3.5 w-3.5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {log.action.charAt(0).toUpperCase() + log.action.slice(1)} {entityTypeLabels[log.entityType] ?? log.entityType}
                      {log.entityName && `: ${log.entityName}`}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{log.userEmail}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        {formatRelativeTime(new Date(log.createdAt))}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <Activity className="mx-auto h-8 w-8 mb-2 opacity-50" aria-hidden="true" />
              <p>No recent activity</p>
              <p className="text-xs">Activity will appear here as you make changes</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-border bg-background p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <QuickActionLink
              href="/admin/projects"
              label="Manage Projects"
              description="Add or edit portfolio projects"
              icon={<FolderGit2 className="h-4 w-4" />}
            />
            <QuickActionLink
              href="/admin/experience"
              label="Manage Experience"
              description="Update work history"
              icon={<Briefcase className="h-4 w-4" />}
            />
            <QuickActionLink
              href="/admin/certifications"
              label="Manage Certifications"
              description="Add credentials and certs"
              icon={<Award className="h-4 w-4" />}
            />
            <QuickActionLink
              href="/admin/pages"
              label="Edit Pages"
              description="Update hero, about, and skills"
              icon={<Edit className="h-4 w-4" />}
            />
            <QuickActionLink
              href="/admin/site-config"
              label="Site Configuration"
              description="Theme, SEO, and settings"
              icon={<LinkIcon className="h-4 w-4" />}
            />
          </div>
        </div>
      </div>

      {/* Last Updated */}
      {!isLoading && lastUpdated && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-3">
          <Calendar className="size-4 text-muted-foreground" aria-hidden="true" />
          <span className="text-sm text-muted-foreground">
            Last content update:{" "}
            <time
              dateTime={lastUpdated.toISOString()}
              className="font-medium text-foreground"
            >
              {lastUpdated.toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
          </span>
        </div>
      )}
    </div>
  );
}

function QuickActionLink({
  href,
  label,
  description,
  icon,
}: {
  href: string;
  label: string;
  description: string;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-lg border border-transparent p-3 transition-colors hover:border-border hover:bg-muted/50"
    >
      {icon && (
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-foreground group-hover:text-accent-foreground">
          {label}
        </span>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
    </Link>
  );
}
