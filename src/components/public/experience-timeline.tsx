"use client";

import { Badge } from "@/components/ui/badge";

export interface Experience {
  id: string;
  companyName: string;
  roleTitle: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
  techStack: string[];
  displayOrder: number;
  isVisible: boolean;
}

export interface ExperienceTimelineProps {
  experiences: Experience[];
}

function formatTimelineDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Elegant timeline for displaying work experience.
 */
export function ExperienceTimeline({ experiences }: ExperienceTimelineProps) {
  if (experiences.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">
        No experience entries yet.
      </p>
    );
  }

  return (
    <section aria-label="Work experience timeline">
      <ol className="relative space-y-6">
        {experiences.map((experience, index) => {
          const startFormatted = formatTimelineDate(experience.startDate);
          const endFormatted = experience.endDate
            ? formatTimelineDate(experience.endDate)
            : "Present";
          const isLatest = index === 0;

          return (
            <li key={experience.id} className="relative pl-8 md:pl-10">
              {/* Timeline line */}
              <div
                className="absolute left-3 top-2 h-full w-px bg-border md:left-[11px]"
                aria-hidden="true"
              />

              {/* Timeline dot */}
              <div
                className={`absolute left-0 top-1.5 h-2 w-2 rounded-full md:left-[7px] ${
                  isLatest
                    ? "bg-primary shadow-lg shadow-primary/30"
                    : "bg-muted-foreground/30"
                }`}
                aria-hidden="true"
              />

              {/* Content */}
              <div className="pb-6 last:pb-0">
                {/* Date */}
                <time
                  className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground"
                  dateTime={experience.startDate}
                >
                  {startFormatted} — {endFormatted}
                </time>

                {/* Role & Company */}
                <h3 className="text-base font-semibold text-foreground">
                  {experience.roleTitle}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {experience.companyName}
                </p>

                {/* Description */}
                {experience.description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {experience.description}
                  </p>
                )}

                {/* Tech stack */}
                {(experience.techStack ?? []).length > 0 && (
                  <div
                    className="mt-3 flex flex-wrap gap-1.5"
                    aria-label={`Technologies used at ${experience.companyName}`}
                  >
                    {(experience.techStack ?? []).map((tech) => (
                      <Badge key={tech} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
