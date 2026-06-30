import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Sparkles, BookOpen, FolderKanban, MessageCircle } from "lucide-react";

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
    <main className="pt-16">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <Hero tagline={tagline} resumeUrl={resumeUrl} />

      {/* About Preview Section */}
      <section className="relative overflow-hidden" aria-label="About preview">
        {/* Background */}
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute left-1/4 top-1/2 h-[40vmin] w-[40vmin] -translate-y-1/2 rounded-full bg-gradient-to-r from-primary/15 via-purple-500/10 to-blue-500/15 blur-[80px]" />
        </div>
        
        <div className="container mx-auto px-4 py-16 md:py-24">
          <ScrollReveal direction="up">
            <div className="mx-auto max-w-xl text-center">
              {/* Section icon */}
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl border border-border/50 bg-gradient-to-br from-primary/15 to-primary/5 shadow-lg shadow-primary/5">
                <BookOpen className="h-7 w-7 text-primary" />
              </div>
              
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                About Me
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                {aboutPreview || "Cybersecurity professional, cloud architect, and web developer passionate about building secure, scalable solutions."}
              </p>
              <Link
                href="/about"
                className="group mt-8 inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/80 px-6 py-2.5 text-sm font-medium shadow backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Read my story
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="relative overflow-hidden" aria-label="Featured projects">
        {/* Background */}
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute right-1/4 top-1/3 h-[35vmin] w-[35vmin] rounded-full bg-gradient-to-r from-purple-500/15 via-pink-500/10 to-primary/15 blur-[80px]" />
        </div>

        <div className="container mx-auto px-4 py-16 md:py-24">
          <ScrollReveal direction="up">
            <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-border/50 bg-gradient-to-br from-purple-500/15 to-pink-500/5 shadow-lg shadow-purple-500/5">
                  <FolderKanban className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Featured Work
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Selected projects showcasing my expertise
                </p>
              </div>
            </div>
          </ScrollReveal>

          {featuredProjects.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProjects.map((project, index) => (
                <ScrollReveal key={project.id} direction="up" delay={index * 100}>
                  <ProjectCard project={project} />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border/50 bg-card/30 p-12 text-center backdrop-blur-sm">
              <FolderKanban className="mx-auto h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 text-muted-foreground">No featured projects yet.</p>
            </div>
          )}

          {featuredProjects.length > 0 && (
            <ScrollReveal direction="up" delay={featuredProjects.length * 100}>
              <div className="mt-10 flex justify-center">
                <Link
                  href="/projects"
                  className="group inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-5 py-2 text-sm font-medium shadow backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  View all projects
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="relative overflow-hidden" aria-label="Contact">
        {/* Background */}
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute left-1/2 top-1/2 h-[50vmin] w-[50vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-primary/15 via-emerald-500/10 to-teal-500/15 blur-[80px]" />
        </div>

        <div className="container mx-auto px-4 py-16 md:py-24">
          <ScrollReveal direction="up">
            <div className="relative mx-auto max-w-lg overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-8 md:p-12 shadow-xl shadow-primary/5">
              {/* Decorative gradient orbs */}
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
              <div className="absolute -left-16 -bottom-16 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
              
              <div className="relative text-center">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl border border-border/50 bg-gradient-to-br from-primary/15 to-primary/5 shadow-lg shadow-primary/5">
                  <MessageCircle className="h-7 w-7 text-primary" />
                </div>
                
                <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                  Let&apos;s work together
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Have a project in mind or want to collaborate? I&apos;d love to hear from you.
                </p>
                
                <Link
                  href="/contact"
                  className="group mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/15 transition-all hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Get in touch
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}