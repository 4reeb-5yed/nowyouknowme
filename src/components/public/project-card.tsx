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

const categoryConfig = {
  cybersecurity: {
    icon: Shield,
    gradient: "from-emerald-500/10 to-teal-500/10",
    borderGradient: "hover:border-emerald-500/30",
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  cloud: {
    icon: Cloud,
    gradient: "from-blue-500/10 to-indigo-500/10",
    borderGradient: "hover:border-blue-500/30",
    iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  web: {
    icon: Code,
    gradient: "from-purple-500/10 to-pink-500/10",
    borderGradient: "hover:border-purple-500/30",
    iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
  other: {
    icon: Box,
    gradient: "from-gray-500/10 to-gray-600/10",
    borderGradient: "hover:border-gray-500/30",
    iconBg: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  },
};

export interface ProjectCardProps {
  project: Project;
  compact?: boolean;
}

/**
 * Premium ProjectCard with elegant hover effects, category styling, and smooth animations.
 */
export function ProjectCard({ project, compact = false }: ProjectCardProps) {
  const categoryVariant = project.category as
    | "cybersecurity"
    | "cloud"
    | "web"
    | "other";

  const config = categoryConfig[categoryVariant] || categoryConfig.other;
  const Icon = config.icon;

  if (compact) {
    return (
      <article className="group relative flex gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/20 hover:shadow-md">
        {/* Thumbnail */}
        {project.thumbnailUrl && (
          <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
            <Image
              src={project.thumbnailUrl}
              alt={`${project.title} thumbnail`}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex flex-1 flex-col justify-center min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <span className={cn("rounded-md p-1", config.iconBg)}>
              <Icon className="h-3 w-3" />
            </span>
            <Badge variant={categoryVariant} className="text-[10px]">
              {project.category}
            </Badge>
          </div>
          <h3 className="text-sm font-medium leading-tight truncate transition-colors group-hover:text-primary">
            <Link
              href={`/projects/${project.slug}`}
              className="after:absolute after:inset-0"
            >
              {project.title}
            </Link>
          </h3>
        </div>

        <div className="flex items-center text-muted-foreground">
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:-translate-y-1">
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        {project.thumbnailUrl ? (
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
        ) : (
          <div className={cn(
            "absolute inset-0 flex items-center justify-center bg-gradient-to-br",
            config.gradient
          )}>
            <div className={cn("rounded-xl p-4", config.iconBg)}>
              <Icon className="h-8 w-8" />
            </div>
          </div>
        )}
        
        {/* Gradient overlay on hover */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        )} />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Category */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn("rounded-lg p-1.5", config.iconBg)}>
              <Icon className="h-3.5 w-3.5" />
            </span>
            <Badge variant={categoryVariant} className="text-[10px] font-medium">
              {project.category}
            </Badge>
          </div>
          {project.isFeatured && (
            <span className="text-xs font-medium text-amber-500">★ Featured</span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold leading-tight transition-colors group-hover:text-primary">
          <Link
            href={`/projects/${project.slug}`}
            className="after:absolute after:inset-0"
          >
            {project.title}
          </Link>
        </h3>

        {/* Description */}
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {project.description}
        </p>

        {/* Tech Stack */}
        {(project.techStack ?? []).length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1.5">
            {(project.techStack ?? []).slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="rounded-full bg-muted/80 px-2.5 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm"
              >
                {tech}
              </span>
            ))}
            {(project.techStack ?? []).length > 3 && (
              <span className="rounded-full bg-muted/80 px-2.5 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
                +{(project.techStack ?? []).length - 3}
              </span>
            )}
          </div>
        )}

        {/* View link */}
        <Link
          href={`/projects/${project.slug}`}
          className="mt-2 flex items-center gap-1.5 text-sm font-medium text-primary transition-all group-hover:gap-2.5"
        >
          View project
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
