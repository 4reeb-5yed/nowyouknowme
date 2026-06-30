import Link from "next/link";
import type { Metadata } from "next";

import { createServerClient } from "@/lib/trpc/server";
import { Hero } from "@/components/public/hero";
import { ProjectCard } from "@/components/public/project-card";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { db } from "@/server/db";
import { siteConfig } from "@/server/db/schema";
import { clientEnv } from "@/config/env";

export const revalidate = 60;

const DEFAULT_TAGLINE = "Building secure, scalable, and elegant solutions.";
const DEFAULT_DESCRIPTION =
  "Personal portfolio showcasing cybersecurity, cloud, and web development projects.";

export async function generateMetadata(): Promise<Metadata> {
  const trpc = await createServerClient();
  const config = await trpc.siteConfig.get();

  const description = config?.metaDescription || DEFAULT_DESCRIPTION;
  const title = config?.heroTagline
    ? `${config.heroTagline} | NowYouKnowMe`
    : "NowYouKnowMe — Portfolio";

  return {
    title: {
      absolute: title,
    },
    description,
    openGraph: {
      title,
      description,
      url: clientEnv.NEXT_PUBLIC_APP_URL,
      type: "website",
      ...(config?.ogImageUrl && { images: [{ url: config.ogImageUrl }] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(config?.ogImageUrl && { images: [config.ogImageUrl] }),
    },
  };
}

export default async function HomePage() {
  const trpc = await createServerClient();

  // Fetch site config for hero tagline
  const configRows = await db.select().from(siteConfig).limit(1);
  const tagline = configRows[0]?.heroTagline || DEFAULT_TAGLINE;

  // Fetch active resume for the download button
  const activeResume = await trpc.resume.getActive();
  const resumeUrl = activeResume?.fileUrl ?? null;

  // Fetch About section content for preview
  const aboutSection = await trpc.pages.getSection({ key: "about" });
  const aboutContent = aboutSection?.content ?? "";

  // Strip HTML tags for a plain-text preview, truncate to ~200 chars
  const aboutPlainText = aboutContent.replace(/<[^>]*>/g, "").trim();
  const aboutPreview =
    aboutPlainText.length > 200
      ? aboutPlainText.slice(0, 200) + "…"
      : aboutPlainText;

  // Fetch published projects, filter to featured only
  const rawProjects = await trpc.projects.list();
  const featuredProjects = rawProjects
    .map((p) => ({ ...p, techStack: p.techStack ?? [] }))
    .filter((p) => p.isFeatured);

  // JSON-LD structured data for homepage
  const siteUrl = clientEnv.NEXT_PUBLIC_APP_URL;
  const description = configRows[0]?.metaDescription || DEFAULT_DESCRIPTION;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "NowYouKnowMe",
        description,
        url: siteUrl,
      },
      {
        "@type": "Person",
        name: "NowYouKnowMe",
        url: siteUrl,
        description: tagline,
        jobTitle: "Cybersecurity Professional & Developer",
      },
    ],
  };

  return (
    <main>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <Hero tagline={tagline} resumeUrl={resumeUrl} />

      {/* About Preview Section */}
      <section className="container mx-auto px-4 py-12 md:py-16 lg:py-20" aria-label="About preview">
        <ScrollReveal direction="up" delay={0}>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              About Me
            </h2>
            {aboutPreview ? (
              <p className="mt-6 max-w-2xl mx-auto text-lg leading-relaxed text-muted-foreground">
                {aboutPreview}
              </p>
            ) : (
              <p className="mt-6 max-w-2xl mx-auto text-lg leading-relaxed text-muted-foreground">
                Cybersecurity professional, cloud architect, and web developer.
              </p>
            )}
            <Link
              href="/about"
              className="group mt-8 inline-flex items-center gap-2 text-sm font-medium text-primary transition-all hover:gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Learn more about me 
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* Decorative divider */}
      <div className="relative py-8">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-px w-full max-w-xs bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
        <div className="relative flex justify-center">
          <span className="rounded-full border bg-background px-4 py-1 text-xs font-medium text-muted-foreground">
            ✦
          </span>
        </div>
      </div>

      {/* Featured Projects Section */}
      <section id="projects" className="container mx-auto px-4 py-12 md:py-16 lg:py-20" aria-label="Featured projects">
        <ScrollReveal direction="up" delay={0}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Featured Projects
              </h2>
              <p className="mt-2 text-muted-foreground">
                Selected work showcasing my expertise
              </p>
            </div>
            <Link
              href="/projects"
              className="group inline-flex items-center gap-2 text-sm font-medium text-primary transition-all hover:gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              See all projects 
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </ScrollReveal>

        {featuredProjects.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project, index) => (
              <ScrollReveal key={project.id} direction="up" delay={index * 100}>
                <ProjectCard project={project} />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-muted-foreground/25 p-12 text-center">
            <p className="text-muted-foreground">No featured projects yet. Check back soon.</p>
          </div>
        )}
      </section>
    </main>
  );
}