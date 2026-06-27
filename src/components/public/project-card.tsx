"use client";

import Image from "next/image";
import type { Project } from "./project-grid";
import { Badge } from "@/components/ui/badge";

/** Tiny 1x1 pixel SVG used as blurDataURL placeholder to reduce CLS */
const PLACEHOLDER_BLUR =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlNWU3ZWIiLz48L3N2Zz4=";

export interface ProjectCardProps {
  project: Project;
}

/**
 * ProjectCard displays a single project in the grid.
 * Shows thumbnail, title, category badge, description, tech stack, and featured indicator.
 */
export function ProjectCard({ project }: ProjectCardProps) {
  const categoryVariant = project.category as
    | "cybersecurity"
    | "cloud"
    | "web"
    | "other";

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all motion-safe:hover:scale-[1.02] hover:shadow-md">
      {/* Thumbnail */}
      {project.thumbnailUrl && (
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <Image
            src={project.thumbnailUrl}
            alt={`Project thumbnail for ${project.title}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform motion-safe:group-hover:scale-105"
            loading="lazy"
            placeholder="blur"
            blurDataURL={PLACEHOLDER_BLUR}
          />
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* Header row: title + featured indicator */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold leading-tight">
            <a
              href={`/projects/${project.slug}`}
              className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {project.title}
            </a>
          </h3>
          {project.isFeatured && (
            <span
              className="shrink-0 text-yellow-500"
              title="Featured project"
              aria-label="Featured project"
            >
              ★
            </span>
          )}
        </div>

        {/* Category badge */}
        <Badge variant={categoryVariant} className="w-fit">
          {project.category.charAt(0).toUpperCase() + project.category.slice(1)}
        </Badge>

        {/* Description */}
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {project.description}
        </p>

        {/* Tech Stack */}
        {project.techStack.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1 pt-2">
            {project.techStack.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
              >
                {tech}
              </span>
            ))}
            {project.techStack.length > 4 && (
              <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                +{project.techStack.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
