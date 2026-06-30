import type { Metadata } from "next";
import { V2Hero } from "@/components/public/v2-hero";
import { V2Stats, V2Projects, V2Experience, V2CTA } from "@/components/public/v2-sections";
import { clientEnv } from "@/config/env";

export const revalidate = 60;

const DEFAULT_TAGLINE = "Building secure, scalable, and elegant solutions.";
const DEFAULT_DESCRIPTION = "Personal portfolio showcasing cybersecurity, cloud, and web development projects.";

// Default data for when database is not available (use string icon names)
const DEFAULT_STATS = [
  { label: "Projects", value: "10+", icon: "FolderKanban" },
  { label: "Experience", value: "5+", icon: "Clock" },
  { label: "Certifications", value: "8+", icon: "Award" },
];

export async function generateMetadata(): Promise<Metadata> {
  let tagline = DEFAULT_TAGLINE;
  let description = DEFAULT_DESCRIPTION;
  
  try {
    const { createServerClient } = await import("@/lib/trpc/server");
    const trpc = await createServerClient();
    const config = await trpc.siteConfig.get();
    tagline = config?.heroTagline || DEFAULT_TAGLINE;
    description = config?.metaDescription || DEFAULT_DESCRIPTION;
  } catch {
    // Database not available, use defaults
  }

  const title = `${tagline} | NowYouKnowMe`;

  return {
    title: { absolute: title },
    description,
    openGraph: { title, description, url: clientEnv.NEXT_PUBLIC_APP_URL, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function HomePage() {
  let tagline = DEFAULT_TAGLINE;
  let resumeUrl: string | null = null;
  let featuredProjects: any[] = [];
  let experiences: any[] = [];
  let stats = DEFAULT_STATS;

  try {
    const { createServerClient } = await import("@/lib/trpc/server");
    const { db } = await import("@/server/db");
    const { siteConfig } = await import("@/server/db/schema");

    const trpc = await createServerClient();

    // Try to fetch config
    try {
      const configRows = await db.select().from(siteConfig).limit(1);
      tagline = configRows[0]?.heroTagline || DEFAULT_TAGLINE;
    } catch {
      // Config not available
    }

    // Try to fetch resume
    try {
      const activeResume = await trpc.resume.getActive();
      resumeUrl = activeResume?.fileUrl ?? null;
    } catch {
      // Resume not available
    }

    // Try to fetch projects
    try {
      const rawProjects = await trpc.projects.list();
      featuredProjects = rawProjects
        .map((p) => ({ ...p, techStack: p.techStack ?? [] }))
        .filter((p) => p.isFeatured)
        .slice(0, 3);
      stats = [
        { label: "Projects", value: `${Math.max(rawProjects.length, 10)}+`, icon: "FolderKanban" },
        { label: "Experience", value: "5+", icon: "Clock" },
        { label: "Certifications", value: "8+", icon: "Award" },
      ];
    } catch {
      // Projects not available
    }

    // Try to fetch experiences
    try {
      const rawExperiences = await trpc.experience.listVisible();
      experiences = rawExperiences.slice(0, 4).map((exp) => ({ ...exp, techStack: exp.techStack ?? [] }));
    } catch {
      // Experiences not available
    }
  } catch {
    // Database not available, use defaults
  }

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
