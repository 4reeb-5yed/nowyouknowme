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
} from "lucide-react";

import { trpc } from "@/lib/trpc/client";

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  href: string;
}

function StatCard({ title, value, subtitle, icon, href }: StatCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-border bg-background p-6 shadow-sm transition-colors hover:border-accent hover:bg-accent/5"
    >
      <div className="flex items-start justify-between">
        <div className="rounded-lg bg-muted p-2.5 text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent-foreground transition-colors">
          {icon}
        </div>
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Welcome back! Here&apos;s an overview of your portfolio.
        </p>
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

      {/* Last Updated */}
      {!isLoading && lastUpdated && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-3">
          <Clock className="size-4 text-muted-foreground" aria-hidden="true" />
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

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionLink
            href="/admin/projects"
            label="Manage Projects"
            description="Add or edit portfolio projects"
          />
          <QuickActionLink
            href="/admin/experience"
            label="Manage Experience"
            description="Update work history"
          />
          <QuickActionLink
            href="/admin/certifications"
            label="Manage Certifications"
            description="Add credentials and certs"
          />
          <QuickActionLink
            href="/admin/content"
            label="Edit Content"
            description="Update hero, about, and skills"
          />
        </div>
      </div>
    </div>
  );
}

function QuickActionLink({
  href,
  label,
  description,
}: {
  href: string;
  label: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-lg border border-border p-4 transition-colors hover:border-accent hover:bg-accent/5"
    >
      <span className="text-sm font-medium text-foreground group-hover:text-accent-foreground">
        {label}
      </span>
      <span className="mt-1 text-xs text-muted-foreground">{description}</span>
    </Link>
  );
}
