"use client";

import { useScrollReveal } from "@/hooks/use-scroll-reveal";

interface Experience {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
  isCurrent: boolean;
}

const experiences: Experience[] = [
  {
    id: "1",
    role: "Senior Software Engineer",
    company: "Acme Systems",
    startDate: "2022",
    endDate: "Present",
    description: "Leading the platform team, focusing on developer experience and system reliability. Reduced p99 latency by 60% through targeted optimization work.",
    isCurrent: true,
  },
  {
    id: "2",
    role: "Software Engineer",
    company: "TechCorp",
    startDate: "2019",
    endDate: "2022",
    description: "Built and maintained core backend services processing millions of daily transactions. Introduced automated testing practices that cut production incidents by 40%.",
    isCurrent: false,
  },
  {
    id: "3",
    role: "Junior Developer",
    company: "StartupXYZ",
    startDate: "2017",
    endDate: "2019",
    description: "Full-stack development on a rapidly growing e-commerce platform. Wrote the inventory sync system that became the foundation for future scaling efforts.",
    isCurrent: false,
  },
];

export function ExperienceSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="experience" className="section section--surface">
      <div className="container">
        <div 
          className="section-header reveal" 
          ref={ref}
          style={{ maxWidth: "calc(10/12 * 100%)", margin: "0 auto var(--space-16)" }}
        >
          <p className="section-kicker">// 02 — Experience</p>
          <h2 className="section-title">Where I&apos;ve Worked</h2>
          <p className="section-description">
            A path through building systems at scale. Each role built on the last.
          </p>
        </div>

        <div 
          className={`experience-timeline reveal ${isVisible ? "visible" : ""}`}
          style={{ maxWidth: "calc(8/12 * 100%)", margin: "0 auto" }}
        >
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className={`experience-entry ${exp.isCurrent ? "experience-entry--current" : ""}`}
            >
              <div className="experience-entry__header">
                <span className="experience-entry__date">{exp.startDate} — {exp.endDate}</span>
              </div>
              <h3 className="experience-entry__role">{exp.role}</h3>
              <p className="experience-entry__company">{exp.company}</p>
              <p className="experience-entry__description">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
