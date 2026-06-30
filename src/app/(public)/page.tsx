import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Sparkles } from "lucide-react";

import { createServerClient } from "@/lib/trpc/server";
import { Hero } from "@/components/public/hero";
import { ProjectCard } from "@/components/public/project-card";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { db } from "@/server/db";
import { siteConfig } from "@/server/db/schema";
import { clientEnv } from "@/config/env";

export const revalidate = 60;

const DEFAULT_TAGLINE = "Building secure, scalable, and elegant solutions.";
const DEFAULT_NAME = "Your Name"; // Should come from site config
const DEFAULT_ROLE = "Cybersecurity Professional & Developer";
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
      <section className="container mx-auto px-4 py-16 md:py-20" aria-label="About preview">
        <ScrollReveal direction="up">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              About Me
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {aboutPreview || "Cybersecurity professional, cloud architect, and web developer passionate about building secure, scalable solutions."}
            </p>
            <Link
              href="/about"
              className="group mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-all hover:gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Read my story
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* Featured Projects Section */}
      <section className="container mx-auto px-4 py-16 md:py-20" aria-label="Featured projects">
        <ScrollReveal direction="up">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight">
              Featured Work
            </h2>
          </div>
        </ScrollReveal>

        {featuredProjects.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project, index) => (
              <ScrollReveal key={project.id} direction="up" delay={index * 75}>
                <ProjectCard project={project} />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground">No featured projects yet.</p>
          </div>
        )}

        {featuredProjects.length > 0 && (
          <ScrollReveal direction="up" delay={featuredProjects.length * 75}>
            <div className="mt-10 flex justify-center">
              <Link
                href="/projects"
                className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                View all projects
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </ScrollReveal>
        )}
      </section>

      {/* Quick Contact CTA */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <ScrollReveal direction="up">
          <div className="rounded-2xl border bg-muted/30 p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Let&apos;s work together</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Interested in working together? I&apos;d love to hear from you.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Get in touch
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </main>
  );
}