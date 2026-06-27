"use client";

import { Badge } from "@/components/ui/badge";

/**
 * Represents a work experience entry displayed in the timeline.
 */
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

/**
 * Formats a date string (YYYY-MM-DD) to a readable format like "Jan 2024".
 */
function formatTimelineDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * ExperienceTimeline displays work experience entries as a vertical timeline.
 * Entries are expected to arrive pre-sorted with most recent first.
 *
 * - Shows "Present" for entries where end_date is null
 * - Displays tech_stack tags and description for each entry
 * - Timeline layout with vertical line on desktop, single column on mobile
 * - Accessible: proper heading hierarchy, semantic HTML
 *
 * Validates: Requirements 18.6, 18.7
 */
export function ExperienceTimeline({ experiences }: ExperienceTimelineProps) {
  if (experiences.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        No experience entries to display.
      </p>
    );
  }

  return (
    <section aria-label="Work experience timeline">
      <ol className="relative space-y-8 md:space-y-12">
        {/* Vertical timeline line (desktop only) */}
        <div
          className="absolute left-4 top-2 hidden h-[calc(100%-1rem)] w-0.5 bg-border md:block"
          aria-hidden="true"
        />

        {experiences.map((experience) => {
          const startFormatted = formatTimelineDate(experience.startDate);
          const endFormatted = experience.endDate
            ? formatTimelineDate(experience.endDate)
            : "Present";

          return (
            <li key={experience.id} className="relative md:pl-12">
              {/* Timeline dot (desktop only) */}
              <div
                className="absolute left-[0.875rem] top-2 hidden h-3 w-3 rounded-full border-2 border-primary bg-background md:block"
                aria-hidden="true"
              />

              {/* Date range */}
              <time
                className="mb-1 block text-sm font-medium text-muted-foreground"
                dateTime={experience.startDate}
              >
                {startFormatted} — {endFormatted}
              </time>

              {/* Content card */}
              <div className="rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
                <h3 className="text-lg font-semibold leading-tight text-foreground">
                  {experience.roleTitle}
                </h3>
                <p className="mt-0.5 text-sm font-medium text-muted-foreground">
                  {experience.companyName}
                </p>

                {/* Description */}
                {experience.description && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {experience.description}
                  </p>
                )}

                {/* Tech stack tags */}
                {experience.techStack.length > 0 && (
                  <div
                    className="mt-3 flex flex-wrap gap-1.5"
                    aria-label={`Technologies used at ${experience.companyName}`}
                  >
                    {experience.techStack.map((tech) => (
                      <Badge key={tech} variant="secondary">
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
