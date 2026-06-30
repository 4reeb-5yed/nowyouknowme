"use client";

import Image from "next/image";
import Link from "next/link";
import type { Project } from "./project-grid";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Shield, Cloud, Code, Box } from "lucide-react";
import { cn } from "@/lib/utils";

/** Tiny 1x1 pixel SVG used as blurDataURL placeholder to reduce CLS */
const PLACEHOLDER_BLUR =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlNWU3ZWIiLz48L3N2Zz4=";

const categoryIcons = {
  cybersecurity: <Shield className="h-3.5 w-3.5" />,
  cloud: <Cloud className="h-3.5 w-3.5" />,
  web: <Code className="h-3.5 w-3.5" />,
  other: <Box className="h-3.5 w-3.5" />,
};

const categoryGradients = {
  cybersecurity: "from-emerald-500/20 to-teal-500/20",
  cloud: "from-blue-500/20 to-indigo-500/20",
  web: "from-purple-500/20 to-pink-500/20",
  other: "from-gray-500/20 to-gray-600/20",
};

export interface ProjectCardProps {
  project: Project;
  compact?: boolean;
}

/**
 * Elegant ProjectCard with subtle hover effects and clear hierarchy.
 */
export function ProjectCard({ project, compact = false }: ProjectCardProps) {
  const categoryVariant = project.category as
    | "cybersecurity"
    | "cloud"
    | "web"
    | "other";

  const Icon = categoryIcons[categoryVariant] || categoryIcons.other;
  const gradient = categoryGradients[categoryVariant] || categoryGradients.other;

  if (compact) {
    return (
      <article className="group relative flex gap-4 rounded-lg border bg-card p-4 transition-all duration-200 hover:bg-muted/30 hover:border-border">
        {/* Thumbnail */}
        {project.thumbnailUrl && (
          <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
            <Image
              src={project.thumbnailUrl}
              alt={`${project.title} thumbnail`}
              fill
              className="object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex flex-1 flex-col justify-center min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-muted-foreground">{Icon}</span>
            <Badge variant={categoryVariant} className="text-[10px] px-1.5 py-0">
              {project.category}
            </Badge>
          </div>
          <h3 className="text-sm font-medium leading-tight truncate group-hover:text-primary transition-colors">
            <Link
              href={`/projects/${project.slug}`}
              className="after:absolute after:inset-0"
            >
              {project.title}
            </Link>
          </h3>
        </div>

        <div className="flex items-center text-muted-foreground">
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 premium-card">
      {/* Thumbnail */}
      {project.thumbnailUrl ? (
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
          <Image
            src={project.thumbnailUrl}
            alt={`${project.title} thumbnail`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            placeholder="blur"
            blurDataURL={PLACEHOLDER_BLUR}
          />
        </div>
      ) : (
        <div className={cn(
          "relative aspect-[16/10] w-full bg-gradient-to-br",
          gradient
        )}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-lg bg-background/50 p-3">
              {Icon}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* Category badge */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground/60">
            {Icon}
          </span>
          <Badge variant={categoryVariant} className="text-[10px] px-1.5 py-0">
            {project.category}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold leading-tight group-hover:text-primary transition-colors">
          <Link
            href={`/projects/${project.slug}`}
            className="after:absolute after:inset-0"
          >
            {project.title}
          </Link>
        </h3>

        {/* Description */}
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {project.description}
        </p>

        {/* Tech Stack */}
        {project.techStack.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
            {project.techStack.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="rounded-full bg-muted/80 px-2 py-0.5 text-xs text-muted-foreground"
              >
                {tech}
              </span>
            ))}
            {project.techStack.length > 3 && (
              <span className="rounded-full bg-muted/80 px-2 py-0.5 text-xs text-muted-foreground">
                +{project.techStack.length - 3}
              </span>
            )}
          </div>
        )}

        {/* View link */}
        <Link
          href={`/projects/${project.slug}`}
          className="mt-2 flex items-center gap-1 text-sm font-medium text-primary transition-colors group-hover:underline"
        >
          View project
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
