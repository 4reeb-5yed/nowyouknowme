"use client";

import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc/client";

function useScrollReveal(threshold = 0.25) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold, rootMargin: "-10% 0px -10% 0px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

function ProjectSkeleton() {
  return (
    <article className="projects-spread projects-spread--image-left animate-pulse">
      <div className="projects-spread__content">
        <div className="h-4 w-24 rounded bg-muted mb-4" />
        <div className="h-8 w-64 rounded bg-muted mb-4" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-3/4 rounded bg-muted" />
        </div>
        <div className="flex gap-2 mt-4">
          <div className="h-6 w-16 rounded bg-muted" />
          <div className="h-6 w-20 rounded bg-muted" />
          <div className="h-6 w-14 rounded bg-muted" />
        </div>
      </div>
      <div className="projects-spread__image">
        <div className="w-full h-full bg-muted rounded-lg" />
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <p className="text-muted-foreground">No projects to display yet.</p>
      <p className="text-sm text-muted-foreground/70 mt-1">
        Add projects in the CMS dashboard.
      </p>
    </div>
  );
}

export function FeaturedProjects() {
  const { ref, isVisible } = useScrollReveal();
  const { data: projects, isLoading } = trpc.projects.list.useQuery();

  return (
    <section id="work" className="section section--canvas">
      <div className="container">
        <div className="section-header">
          <p className="section-kicker">// 01 — Selected Work</p>
          <h2 className="section-title">Featured Projects</h2>
        </div>

        {isLoading ? (
          <>
            <ProjectSkeleton />
            <ProjectSkeleton />
            <ProjectSkeleton />
          </>
        ) : projects && projects.length > 0 ? (
          projects.map((project, index) => (
            <article
              key={project.id}
              ref={index === 0 ? ref : undefined}
              className={`projects-spread reveal ${isVisible ? "visible" : ""} ${index % 2 === 0 ? "projects-spread--image-left" : "projects-spread--image-right"}`}
            >
              <div className="projects-spread__content">
                <p className="projects-spread__kicker">// {String(index + 1).padStart(2, "0")} — {project.category}</p>
                <h3 className="projects-spread__title">{project.title}</h3>
                <p className="projects-spread__description">{project.description}</p>
                <div className="projects-spread__tags">
                  {project.techStack.map((tech: string) => (
                    <span key={tech} className="projects-spread__tag">{tech}</span>
                  ))}
                </div>
                <div className="projects-spread__links">
                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="btn btn--text link-draw">
                      View Case Study
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M7 17L17 7M17 7H7M17 7V17"/>
                      </svg>
                    </a>
                  )}
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="btn btn--text link-draw">
                      View Code
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
              <div className="projects-spread__image">
                <img
                  src={project.thumbnailUrl || "https://picsum.photos/seed/project/1200/750"}
                  alt={`${project.title} project screenshot`}
                  loading="lazy"
                />
              </div>
            </article>
          ))
        ) : (
          <EmptyState />
        )}
      </div>
    </section>
  );
}
