"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export interface SkillDomain {
  domain: string;
  items: string[];
}

interface SkillsDisplayProps {
  skills: SkillDomain[];
}

const domainFilters = [
  { id: "all", label: "All" },
  { id: "cybersecurity", label: "Cybersecurity" },
  { id: "cloud infrastructure", label: "Cloud" },
  { id: "web development", label: "Web Dev" },
] as const;

type DomainFilter = (typeof domainFilters)[number]["id"];

function getDomainVariant(
  domain: string
): "cybersecurity" | "cloud" | "web" | "secondary" {
  const normalized = domain.toLowerCase();
  if (normalized.includes("cybersecurity")) return "cybersecurity";
  if (normalized.includes("cloud")) return "cloud";
  if (normalized.includes("web")) return "web";
  return "secondary";
}

function getDomainHeading(domain: string): string {
  const normalized = domain.toLowerCase();
  if (normalized.includes("cybersecurity")) return "Cybersecurity";
  if (normalized.includes("cloud")) return "Cloud Infrastructure";
  if (normalized.includes("web")) return "Web Development";
  // Fallback to the domain name with first letter capitalized
  return domain.charAt(0).toUpperCase() + domain.slice(1);
}

export function SkillsDisplay({ skills }: SkillsDisplayProps) {
  const [activeDomain, setActiveDomain] = useState<DomainFilter>("all");

  const filteredSkills =
    activeDomain === "all"
      ? skills
      : skills.filter(
          (s) => s.domain.toLowerCase() === activeDomain.toLowerCase()
        );

  return (
    <div>
      {/* Domain Filter Tabs */}
      <div
        role="tablist"
        aria-label="Filter skills by domain"
        className="mb-8 flex flex-wrap gap-2"
      >
        {domainFilters.map((filter) => (
          <button
            key={filter.id}
            role="tab"
            aria-selected={activeDomain === filter.id}
            onClick={() => setActiveDomain(filter.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              activeDomain === filter.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Skills Content */}
      {filteredSkills.length > 0 ? (
        <div
          role="tabpanel"
          className="space-y-6 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300"
          key={activeDomain}
        >
          {filteredSkills.map((group) => (
            <div key={group.domain}>
              {/* Show domain heading when viewing all domains */}
              {activeDomain === "all" && (
                <h3 className="mb-3 text-lg font-semibold text-foreground">
                  {getDomainHeading(group.domain)}
                </h3>
              )}
              <div className="flex flex-wrap gap-2">
                {group.items.map((skill) => (
                  <Badge
                    key={skill}
                    variant={getDomainVariant(group.domain)}
                    className="text-sm"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          role="tabpanel"
          className="flex min-h-[120px] items-center justify-center rounded-lg border border-dashed border-muted-foreground/25 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300"
          key={`${activeDomain}-empty`}
        >
          <p className="text-muted-foreground">No skills found</p>
        </div>
      )}
    </div>
  );
}
