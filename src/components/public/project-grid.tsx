"use client";

import { useState } from "react";
import { ProjectCard } from "./project-card";

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription?: string | null;
  techStack: string[];
  category: "cybersecurity" | "cloud" | "web" | "other";
  githubUrl?: string | null;
  liveUrl?: string | null;
  thumbnailUrl?: string | null;
  isFeatured: boolean;
  displayOrder: number;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectGridProps {
  projects: Project[];
}

const categories = [
  { id: "all", label: "All" },
  { id: "cybersecurity", label: "Cybersecurity" },
  { id: "cloud", label: "Cloud" },
  { id: "web", label: "Web" },
  { id: "other", label: "Other" },
] as const;

type CategoryFilter = (typeof categories)[number]["id"];

export function ProjectGrid({ projects }: ProjectGridProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");

  const filteredProjects =
    activeCategory === "all"
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  return (
    <div>
      {/* Category Filter Tabs */}
      <div
        role="tablist"
        aria-label="Filter projects by category"
        className="mb-8 flex flex-wrap gap-2"
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            role="tab"
            aria-selected={activeCategory === cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              activeCategory === cat.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Project Grid */}
      {filteredProjects.length > 0 ? (
        <div
          role="tabpanel"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300"
          key={activeCategory}
        >
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div
          role="tabpanel"
          className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-muted-foreground/25 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300"
          key={`${activeCategory}-empty`}
        >
          <p className="text-muted-foreground">No projects found</p>
        </div>
      )}
    </div>
  );
}
