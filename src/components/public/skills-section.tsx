"use client";

import { useScrollReveal } from "@/hooks/use-scroll-reveal";

interface SkillCluster {
  name: string;
  skills: string[];
}

const skillClusters: SkillCluster[] = [
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
              <div className="skills-cluster__header">
                <p className="skills-cluster__label">{cluster.name}</p>
              </div>
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
