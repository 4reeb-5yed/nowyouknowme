"use client";

import { useState } from "react";
import { ProjectCard } from "./project-card";
import { cn } from "@/lib/utils";

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
  { id: "cybersecurity", label: "Security" },
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
        className="project-filter-tabs"
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            role="tab"
            aria-selected={activeCategory === cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "project-filter-tab",
              activeCategory === cat.id && "project-filter-tab--active"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Project Grid */}
      {filteredProjects.length > 0 ? (
        <div
          role="tabpanel"
          className="project-grid"
          key={activeCategory}
        >
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div
          role="tabpanel"
          className="project-grid-empty"
          key={`${activeCategory}-empty`}
        >
          <p>No projects found in this category</p>
        </div>
      )}
    </div>
  );
}
