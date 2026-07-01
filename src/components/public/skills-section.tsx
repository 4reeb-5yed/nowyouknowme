"use client";

import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc/client";

interface SkillCluster {
  name: string;
  skills: string[];
}

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

const defaultSkills: SkillCluster[] = [
  {
    name: "Languages",
    skills: ["Go", "Rust", "TypeScript", "Python", "SQL"],
  },
  {
    name: "Infrastructure",
    skills: ["Kubernetes", "Docker", "Terraform", "AWS", "GCP"],
  },
  {
    name: "Data",
    skills: ["PostgreSQL", "Redis", "Kafka", "ClickHouse"],
  },
  {
    name: "Craft",
    skills: ["System Design", "API Design", "Observability", "Testing"],
  },
];

export function SkillsSection() {
  const { ref, isVisible } = useScrollReveal();
  const { data: skillsSection } = trpc.pages.getSection.useQuery({ key: "skills" });

  // Parse skills from section content (expects JSON format)
  let skillClusters: SkillCluster[] = defaultSkills;
  if (skillsSection?.content) {
    try {
      const parsed = JSON.parse(skillsSection.content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        skillClusters = parsed;
      }
    } catch {
      // Use default skills if parsing fails
      skillClusters = defaultSkills;
    }
  }

  return (
    <section id="skills" className="section section--canvas">
      <div className="container">
        <div className="section-header">
          <p className="section-kicker">// 03 — Skills</p>
          <h2 className="section-title">What I Work With</h2>
        </div>

        <div 
          ref={ref}
          className={`skills-grid reveal ${isVisible ? "visible" : ""}`}
        >
          {skillClusters.map((cluster) => (
            <div key={cluster.name} className="skills-cluster">
              <p className="skills-cluster__label">{cluster.name}</p>
              <ul className="skills-cluster__list">
                {cluster.skills.map((skill) => (
                  <li key={skill}>
                    <span className="skill-pill">{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
