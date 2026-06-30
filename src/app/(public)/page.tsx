import type { Metadata } from "next";
import { FolderKanban, Award, Clock } from "lucide-react";
import { createServerClient } from "@/lib/trpc/server";
import { V2Hero } from "@/components/public/v2-hero";
import { V2Stats, V2Projects, V2Experience, V2CTA } from "@/components/public/v2-sections";
import { db } from "@/server/db";
import { siteConfig } from "@/server/db/schema";
import { clientEnv } from "@/config/env";

export const revalidate = 60;

const DEFAULT_TAGLINE = "Building secure, scalable, and elegant solutions.";
const DEFAULT_DESCRIPTION = "Personal portfolio showcasing cybersecurity, cloud, and web development projects.";

export async function generateMetadata(): Promise<Metadata> {
  const trpc = await createServerClient();
  const config = await trpc.siteConfig.get();
  const description = config?.metaDescription || DEFAULT_DESCRIPTION;
  const title = config?.heroTagline ? `${config.heroTagline} | NowYouKnowMe` : "NowYouKnowMe — Portfolio";

  return {
    title: { absolute: title },
    description,
    openGraph: { title, description, url: clientEnv.NEXT_PUBLIC_APP_URL, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function HomePage() {
  const trpc = await createServerClient();

  const configRows = await db.select().from(siteConfig).limit(1);
  const tagline = configRows[0]?.heroTagline || DEFAULT_TAGLINE;

  const activeResume = await trpc.resume.getActive();
  const resumeUrl = activeResume?.fileUrl ?? null;

  const rawProjects = await trpc.projects.list();
  const featuredProjects = rawProjects
    .map((p) => ({ ...p, techStack: p.techStack ?? [] }))
    .filter((p) => p.isFeatured)
    .slice(0, 3);

  const rawExperiences = await trpc.experience.listVisible();
  const experiences = rawExperiences.slice(0, 4).map((exp) => ({ ...exp, techStack: exp.techStack ?? [] }));

  const certifications = await trpc.certifications.listVisible();

  const stats = [
    { label: "Projects", value: `${Math.max(rawProjects.length, 10)}+`, icon: FolderKanban },
    { label: "Experience", value: "5+", icon: Clock },
    { label: "Certifications", value: `${certifications.length || 8}+`, icon: Award },
  ];

  return (
    <main className="relative">
      {/* Immersive Hero */}
      <V2Hero tagline={tagline} resumeUrl={resumeUrl} />

      {/* Stats - Editorial floating card */}
      <V2Stats stats={stats} />

      {/* Featured Projects - Magazine style */}
      <V2Projects projects={featuredProjects} />

      {/* Experience - Storytelling timeline */}
      <V2Experience experiences={experiences} />

      {/* CTA - Cinematic */}
      <V2CTA />
    </main>
  );
}
