"use client";

import { useEffect, useRef, useState } from "react";

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  techStack: string[];
  imageUrl: string;
  liveUrl?: string;
  codeUrl?: string;
}

const projects: Project[] = [
  {
    id: "1",
    title: "Distributed Task Queue",
    category: "SYSTEMS ENGINEERING",
    description: "A high-throughput task processing system handling 50k+ jobs per second with sub-millisecond latency and zero-downtime deployments.",
    techStack: ["Go", "Redis", "Kubernetes", "gRPC"],
    imageUrl: "https://picsum.photos/seed/project1/1200/750",
    liveUrl: "#",
    codeUrl: "#",
  },
  {
    id: "2",
    title: "Real-time Analytics Pipeline",
    category: "DATA ENGINEERING",
    description: "Stream processing architecture that transforms billions of events daily into actionable business intelligence with under 5-second data freshness.",
    techStack: ["Apache Kafka", "ClickHouse", "Rust", "React"],
    imageUrl: "https://picsum.photos/seed/project2/1200/750",
    liveUrl: "#",
    codeUrl: "#",
  },
  {
    id: "3",
    title: "API Gateway Platform",
    category: "INFRASTRUCTURE",
    description: "Multi-tenant API management layer with automatic rate limiting, circuit breakers, and comprehensive observability built in from day one.",
    techStack: ["Node.js", "TypeScript", "PostgreSQL", "Prometheus"],
    imageUrl: "https://picsum.photos/seed/project3/1200/750",
    liveUrl: "#",
    codeUrl: "#",
  },
];

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

export function FeaturedProjects() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="work" className="section section--canvas">
      <div className="container">
        <div className="section-header">
          <p className="section-kicker">// 01 — Selected Work</p>
          <h2 className="section-title">Featured Projects</h2>
        </div>

        {projects.map((project, index) => (
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
                {project.techStack.map((tech) => (
                  <span key={tech} className="projects-spread__tag">{tech}</span>
                ))}
              </div>
              <div className="projects-spread__links">
                {project.liveUrl && (
                  <a href={project.liveUrl} className="btn btn--text link-draw">
                    View Case Study
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M7 17L17 7M17 7H7M17 7V17"/>
                    </svg>
                  </a>
                )}
                {project.codeUrl && (
                  <a href={project.codeUrl} className="btn btn--text link-draw">
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
                src={project.imageUrl}
                alt={`${project.title} project screenshot`}
                loading="lazy"
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
