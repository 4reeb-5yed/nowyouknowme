"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./craft-projects.module.css";

interface Project {
  id: string;
  title: string;
  description: string;
  slug: string;
  thumbnailUrl?: string;
  category: string;
  techStack: string[];
}

interface CraftProjectsProps {
  projects: Project[];
}

export function CraftProjects({ projects }: CraftProjectsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  if (projects.length === 0) return null;

  const featured = projects[0];
  const others = projects.slice(1);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.container}>
        <header className={`${styles.header} ${isInView ? styles.visible : ""}`}>
          <span className={styles.label}>Selected Work</span>
          <h2 className={styles.title}>Projects</h2>
        </header>

        {featured && (
          <article className={`${styles.featured} ${isInView ? styles.visible : ""}`}>
            <Link href={`/projects/${featured.slug}`} className={styles.featuredLink}>
              <div className={styles.featuredImage}>
                {featured.thumbnailUrl ? (
                  <Image
                    src={featured.thumbnailUrl}
                    alt={featured.title}
                    fill
                    className={styles.image}
                    priority
                  />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <span>{featured.category}</span>
                  </div>
                )}
                <div className={styles.imageOverlay} />
              </div>
              
              <div className={styles.featuredContent}>
                <span className={styles.featuredCategory}>{featured.category}</span>
                <h3 className={styles.featuredTitle}>{featured.title}</h3>
                <p className={styles.featuredDescription}>{featured.description}</p>
                <div className={styles.featuredCta}>
                  <span>View Case Study</span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </Link>
          </article>
        )}

        {others.length > 0 && (
          <div className={styles.grid}>
            {others.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        <div className={`${styles.viewAll} ${isInView ? styles.visible : ""}`}>
          <Link href="/projects" className={styles.viewAllLink}>
            <span>View All Projects</span>
            <span className={styles.viewAllCount}>{projects.length}+</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.slug}`} className={styles.card}>
      <article className={styles.cardInner}>
        <div className={styles.cardImage}>
          {project.thumbnailUrl ? (
            <Image
              src={project.thumbnailUrl}
              alt={project.title}
              fill
              className={styles.cardImg}
            />
          ) : (
            <div className={styles.cardPlaceholder}>
              <span>{project.category.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <div className={styles.cardOverlay} />
        </div>
        
        <div className={styles.cardContent}>
          <span className={styles.cardCategory}>{project.category}</span>
          <h3 className={styles.cardTitle}>{project.title}</h3>
          <p className={styles.cardDescription}>{project.description}</p>
          
          {project.techStack.length > 0 && (
            <div className={styles.cardTech}>
              {project.techStack.slice(0, 3).map((tech) => (
                <span key={tech} className={styles.cardTechItem}>{tech}</span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
