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
          <div className="absolute left-1/4 top-1/2 h-[500px] w-[500px] rounded-full bg-gradient-to-r from-primary/15 via-purple-500/10 to-blue-500/15 blur-[120px]" />
        </div>
        
        <div className="container mx-auto px-4 py-24 md:py-32">
          <ScrollReveal direction="up">
            <div className="mx-auto max-w-2xl text-center">
              {/* Section icon */}
              <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-border/50 bg-gradient-to-br from-primary/20 to-primary/5 shadow-xl shadow-primary/10">
                <BookOpen className="h-10 w-10 text-primary" />
              </div>
              
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                About Me
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                {aboutPreview || "Cybersecurity professional, cloud architect, and web developer passionate about building secure, scalable solutions."}
              </p>
              <Link
                href="/about"
                className="group mt-10 inline-flex items-center gap-2.5 rounded-full border border-border/50 bg-card/80 px-7 py-3 text-sm font-medium shadow-lg backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          <div className="absolute right-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-gradient-to-r from-purple-500/15 via-pink-500/10 to-primary/15 blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 py-24 md:py-32">
          <ScrollReveal direction="up">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-border/50 bg-gradient-to-br from-purple-500/20 to-pink-500/5 shadow-lg shadow-purple-500/10">
                  <FolderKanban className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Featured Work
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Selected projects showcasing my expertise
                </p>
              </div>
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
            <div className="rounded-2xl border border-dashed border-border/50 bg-card/30 p-16 text-center backdrop-blur-sm">
              <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">No featured projects yet.</p>
            </div>
          )}

          {featuredProjects.length > 0 && (
            <ScrollReveal direction="up" delay={featuredProjects.length * 100}>
              <div className="mt-14 flex justify-center">
                <Link
                  href="/projects"
                  className="group inline-flex items-center gap-2.5 rounded-full border border-border/50 bg-card/50 px-6 py-2.5 text-sm font-medium shadow backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-primary/20 via-emerald-500/10 to-teal-500/20 blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 py-24 md:py-32">
          <ScrollReveal direction="up">
            <div className="relative mx-auto max-w-xl overflow-hidden rounded-3xl border border-border/50 bg-card/60 backdrop-blur-xl p-10 md:p-14 shadow-2xl shadow-primary/5">
              {/* Decorative gradient orbs */}
              <div className="absolute -right-24 -top-24 h-60 w-60 rounded-full bg-primary/20 blur-3xl" />
              <div className="absolute -left-24 -bottom-24 h-60 w-60 rounded-full bg-emerald-500/10 blur-3xl" />
              <div className="absolute right-1/4 top-0 h-1 w-1/2 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              
              <div className="relative text-center">
                <div className="mb-8 inline-flex h-18 w-18 items-center justify-center rounded-2xl border border-border/50 bg-gradient-to-br from-primary/20 to-primary/5 shadow-xl shadow-primary/10">
                  <MessageCircle className="h-9 w-9 text-primary" />
                </div>
                
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Let&apos;s work together
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  Have a project in mind or want to collaborate? I&apos;d love to hear from you.
                </p>
                
                <Link
                  href="/contact"
                  className="group mt-10 inline-flex items-center gap-2.5 rounded-full bg-primary px-10 py-4 text-base font-medium text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Get in touch
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}