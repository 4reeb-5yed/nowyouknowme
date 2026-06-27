import type { Metadata } from "next";

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
  const ogImage = config?.ogImageUrl || undefined;
  const title = "Experience";

  return {
    title,
    description: `Experience — ${description}`,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/experience`,
      type: "website",
      ...(ogImage && { images: [{ url: ogImage }] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  };
}

export default async function ExperiencePage() {
  const trpc = await createServerClient();
  const rawExperiences = await trpc.experience.listVisible();

  // Normalize techStack from nullable to always an array for the ExperienceTimeline component
  const experiences = rawExperiences.map((exp) => ({
    ...exp,
    techStack: exp.techStack ?? [],
  }));

  return (
    <main className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
      <header className="mb-10 md:mb-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Experience
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Professional journey across cybersecurity, cloud, and web development.
        </p>
      </header>

      <section aria-labelledby="experience-timeline-heading" className="max-w-3xl">
        <h2 id="experience-timeline-heading" className="sr-only">
          Work History
        </h2>
        <ExperienceTimeline experiences={experiences} />
      </section>
    </main>
  );
}
