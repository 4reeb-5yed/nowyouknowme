import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Briefcase } from "lucide-react";

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
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Back link */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        {/* Page header */}
        <header className="mb-12 max-w-2xl">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-gradient-to-br from-primary/5 to-primary/10">
            <Briefcase className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Experience
          </h1>
          <p className="mt-3 text-muted-foreground">
            My professional journey building solutions across cybersecurity, cloud infrastructure, and web development.
          </p>
        </header>

        {/* Timeline */}
        <section aria-labelledby="experience-timeline-heading" className="max-w-2xl">
          <ExperienceTimeline experiences={experiences} />
        </section>
      </div>
    </main>
  );
}
