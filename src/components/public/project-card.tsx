"use client";

import Image from "next/image";
import Link from "next/link";
import type { Project } from "./project-grid";
import { ArrowRight, Shield, Cloud, Code, Box } from "lucide-react";
import { cn } from "@/lib/utils";

/** Tiny 1x1 pixel SVG used as blurDataURL placeholder to reduce CLS */
const PLACEHOLDER_BLUR =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlNWU3ZWIiLz48L3N2Zz4=";

const categoryConfig = {
  cybersecurity: {
    icon: Shield,
    label: "Security",
    iconBg: "bg-accent/10 text-accent",
  },
  cloud: {
    icon: Cloud,
    label: "Cloud",
    iconBg: "bg-accent/10 text-accent",
  },
  web: {
    icon: Code,
    label: "Web",
    iconBg: "bg-accent/10 text-accent",
  },
  other: {
    icon: Box,
    label: "Other",
    iconBg: "bg-accent/10 text-accent",
  },
};

export interface ProjectCardProps {
  project: Project;
  compact?: boolean;
}

/**
 * Refined ProjectCard with editorial styling
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
      <article className="project-card-compact">
        {project.thumbnailUrl && (
          <div className="project-card-compact__image">
            <Image
              src={project.thumbnailUrl}
              alt={`${project.title} thumbnail`}
              fill
              className="object-cover"
              loading="lazy"
            />
          </div>
        )}

        <div className="project-card-compact__content">
          <div className="project-card-compact__meta">
            <span className={cn("rounded p-1", config.iconBg)}>
              <Icon className="h-3 w-3" />
            </span>
            <span className="project-card-compact__category">{config.label}</span>
          </div>
          <h3 className="project-card-compact__title truncate">
            <Link
              href={`/projects/${project.slug}`}
              className="after:absolute after:inset-0"
            >
              {project.title}
            </Link>
          </h3>
        </div>

        <div className="project-card-compact__arrow">
          <ArrowRight className="h-4 w-4" />
        </div>
      </article>
    );
  }

  return (
    <article className="project-card">
      <div className="project-card__image">
        {project.thumbnailUrl ? (
          <Image
            src={project.thumbnailUrl}
            alt={`${project.title} thumbnail`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            loading="lazy"
            placeholder="blur"
            blurDataURL={PLACEHOLDER_BLUR}
          />
        ) : (
          <div className="project-card__placeholder">
            <span className={cn("rounded-lg p-3", config.iconBg)}>
              <Icon className="h-6 w-6" />
            </span>
          </div>
        )}
      </div>

      <div className="project-card__content">
        <div className="project-card__meta">
          <span className={cn("rounded p-1", config.iconBg)}>
            <Icon className="h-3 w-3" />
          </span>
          <span className="project-card__category">{config.label}</span>
          {project.isFeatured && (
            <span className="project-card__featured">Featured</span>
          )}
        </div>

        <h3 className="project-card__title">
          <Link
            href={`/projects/${project.slug}`}
            className="after:absolute after:inset-0"
          >
            {project.title}
          </Link>
        </h3>

        <p className="project-card__description line-clamp-2">
          {project.description}
        </p>

        {project.techStack.length > 0 && (
          <div className="project-card__stack">
            {project.techStack.slice(0, 3).map((tech) => (
              <span key={tech} className="project-card__tag">
                {tech}
              </span>
            ))}
            {project.techStack.length > 3 && (
              <span className="project-card__tag">+{project.techStack.length - 3}</span>
            )}
          </div>
        )}

        <Link
          href={`/projects/${project.slug}`}
          className="project-card__link"
        >
          View project
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
