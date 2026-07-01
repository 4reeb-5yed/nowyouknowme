import type { Metadata } from "next";
import { Briefcase } from "lucide-react";

import { createServerClient } from "@/lib/trpc/server";
import { ExperienceTimeline } from "@/components/public/experience-timeline";
import { clientEnv } from "@/config/env";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = clientEnv.NEXT_PUBLIC_APP_URL;
  let description = "Career history and professional experience in cybersecurity, cloud infrastructure, and web development.";

  try {
    const trpc = await createServerClient();
    const config = await trpc.siteConfig.get();
    if (config?.metaDescription) {
      description = config.metaDescription;
    }
  } catch {
    // Use default description if DB unavailable
  }

  return {
    title: "Experience",
    description: `Experience — ${description}`,
    openGraph: {
      title: "Experience",
      description,
      url: `${siteUrl}/experience`,
      type: "website",
    },
  };
}

export default async function ExperiencePage() {
  let experiences: Array<{ id: string; companyName: string; roleTitle: string; startDate: Date; endDate: Date | null; description: string | null; techStack: string[]; isVisible: boolean; isCurrent: boolean }> = [];

  try {
    const trpc = await createServerClient();
    const rawExperiences = await trpc.experience.listVisible();
    experiences = rawExperiences.map((exp) => ({
      ...exp,
      techStack: exp.techStack ?? [],
      isCurrent: !exp.endDate,
    }));
  } catch {
    // Return empty experiences array if DB unavailable
  }

  return (
    <main className="min-h-screen">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background to-muted/20" />

      <div className="container mx-auto px-4 py-24 md:py-32">
        {/* Page header */}
        <header className="mx-auto mb-16 max-w-2xl text-center">
          <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card shadow-lg">
            <Briefcase className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Experience
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            My professional journey building solutions across cybersecurity, cloud infrastructure, and web development.
          </p>
        </header>

        {/* Timeline */}
        <section aria-labelledby="experience-timeline-heading" className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-lg transition-shadow hover:shadow-xl">
            <ExperienceTimeline experiences={experiences} />
          </div>
        </section>
      </div>
    </main>
  );
}
