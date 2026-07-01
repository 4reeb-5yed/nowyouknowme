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

function formatDate(date: Date | string | null): string {
  if (!date) return "Present";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function ExperienceSection() {
  const { ref, isVisible } = useScrollReveal();
  const { data: experiences, isLoading } = trpc.experience.listVisible.useQuery();

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

        {isLoading ? (
          <div 
            className="experience-timeline"
            style={{ maxWidth: "calc(8/12 * 100%)", margin: "0 auto" }}
          >
            {[1, 2, 3].map((i) => (
              <div key={i} className="experience-entry animate-pulse">
                <div className="experience-entry__header">
                  <div className="h-4 w-32 rounded bg-muted" />
                </div>
                <div className="h-6 w-48 rounded bg-muted mt-2" />
                <div className="h-5 w-32 rounded bg-muted mt-1" />
                <div className="space-y-2 mt-3">
                  <div className="h-4 w-full rounded bg-muted" />
                  <div className="h-4 w-3/4 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : experiences && experiences.length > 0 ? (
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
                  <span className="experience-entry__date">
                    {formatDate(exp.startDate)} — {formatDate(exp.endDate)}
                  </span>
                </div>
                <h3 className="experience-entry__role">{exp.roleTitle}</h3>
                <p className="experience-entry__company">{exp.companyName}</p>
                <p className="experience-entry__description">{exp.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16" style={{ maxWidth: "calc(8/12 * 100%)", margin: "0 auto" }}>
            <p className="text-muted-foreground">No experience entries yet.</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Add your work history in the CMS dashboard.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
