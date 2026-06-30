import type { Metadata } from "next";
import { Briefcase } from "lucide-react";

import { createServerClient } from "@/lib/trpc/server";
import { ExperienceTimeline } from "@/components/public/experience-timeline";
import { clientEnv } from "@/config/env";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const trpc = await createServerClient();
  const config = await trpc.siteConfig.get();
  const siteUrl = clientEnv.NEXT_PUBLIC_APP_URL;

  const description =
    config?.metaDescription ||
    "Career history and professional experience in cybersecurity, cloud infrastructure, and web development.";

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
  const trpc = await createServerClient();
  const rawExperiences = await trpc.experience.listVisible();

  const experiences = rawExperiences.map((exp) => ({
    ...exp,
    techStack: exp.techStack ?? [],
  }));

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute right-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-purple-500/10 blur-[100px]" />
        <div className="absolute left-1/4 bottom-1/3 h-[300px] w-[300px] rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-[80px]" />
      </div>

      <div className="container mx-auto px-4 py-24 md:py-32">
        {/* Page header */}
        <header className="mx-auto mb-16 max-w-2xl text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-border/50 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 shadow-lg shadow-blue-500/5">
            <Briefcase className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Experience
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            My professional journey building solutions across cybersecurity, cloud infrastructure, and web development.
          </p>
        </header>

        {/* Timeline */}
        <section aria-labelledby="experience-timeline-heading" className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-border/50 bg-card/50 p-8 backdrop-blur-sm">
            <ExperienceTimeline experiences={experiences} />
          </div>
        </section>
      </div>
    </main>
  );
}
