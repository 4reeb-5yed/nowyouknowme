"use client";

import Image from "next/image";
import Link from "next/link";
import type { Project } from "./project-grid";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ExternalLink, Shield, Cloud, Code, Box } from "lucide-react";
import { cn } from "@/lib/utils";

/** Tiny 1x1 pixel SVG used as blurDataURL placeholder to reduce CLS */
const PLACEHOLDER_BLUR =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlNWU3ZWIiLz48L3N2Zz4=";

const categoryIcons = {
  cybersecurity: <Shield className="h-4 w-4" />,
  cloud: <Cloud className="h-4 w-4" />,
  web: <Code className="h-4 w-4" />,
  other: <Box className="h-4 w-4" />,
};

const categoryGradients = {
  cybersecurity: "from-emerald-500/20 to-teal-500/20",
  cloud: "from-blue-500/20 to-indigo-500/20",
  web: "from-purple-500/20 to-pink-500/20",
  other: "from-gray-500/20 to-gray-600/20",
};

export interface ProjectCardProps {
  project: Project;
}

/**
 * Premium ProjectCard with enhanced hover effects, category icons, and smooth animations.
 */
export function ProjectCard({ project }: ProjectCardProps) {
  const categoryVariant = project.category as
    | "cybersecurity"
    | "cloud"
    | "web"
    | "other";

  const Icon = categoryIcons[categoryVariant] || categoryIcons.other;
  const gradient = categoryGradients[categoryVariant] || categoryGradients.other;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 premium-card">
      {/* Thumbnail with overlay */}
      {project.thumbnailUrl ? (
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <Image
            src={project.thumbnailUrl}
            alt={`Project thumbnail for ${project.title}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            placeholder="blur"
            blurDataURL={PLACEHOLDER_BLUR}
          />
          {/* Gradient overlay on hover */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100",
            gradient
          )} />
          {/* View project overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-0">
            <span className="flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background">
              View Project <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      ) : (
        // Placeholder gradient when no thumbnail
        <div className={cn(
          "relative aspect-video w-full bg-gradient-to-br",
          gradient
        )}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-background/50 p-4">
              {Icon}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Header row: category + featured */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-foreground/40">
              {Icon}
            </span>
            <Badge variant={categoryVariant} className="text-xs">
              {project.category.charAt(0).toUpperCase() + project.category.slice(1)}
            </Badge>
          </div>
          {project.isFeatured && (
            <span className="flex items-center gap-1 text-xs font-medium text-yellow-500">
              <span className="text-base">★</span> Featured
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold leading-tight group-hover:text-primary transition-colors">
          <Link
            href={`/projects/${project.slug}`}
            className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {project.title}
          </Link>
        </h3>

        {/* Description */}
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {project.description}
        </p>

        {/* Tech Stack */}
        {project.techStack.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-2 pt-2">
            {project.techStack.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="rounded-full bg-muted/80 px-2.5 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm"
              >
                {tech}
              </span>
            ))}
            {project.techStack.length > 4 && (
              <span className="rounded-full bg-muted/80 px-2.5 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
                +{project.techStack.length - 4}
              </span>
            )}
          </div>
        )}

        {/* View link (always visible on mobile, hover on desktop) */}
        <Link
          href={`/projects/${project.slug}`}
          className="mt-2 flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-all duration-300 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0"
        >
          View Details <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* Bottom accent line */}
      <div className={cn(
        "absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r transition-all duration-500 group-hover:w-full",
        project.category === "cybersecurity" && "from-emerald-500 to-teal-500",
        project.category === "cloud" && "from-blue-500 to-indigo-500",
        project.category === "web" && "from-purple-500 to-pink-500",
        project.category === "other" && "from-gray-500 to-gray-600",
      )} />
    </article>
  );
}
