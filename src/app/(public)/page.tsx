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
      <section className="relative section-gradient-border" aria-label="About preview">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <ScrollReveal direction="up">
            <div className="mx-auto max-w-2xl text-center">
              {/* Section icon */}
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              
              <h2 className="text-2xl font-semibold tracking-tight">
                About Me
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {aboutPreview || "Cybersecurity professional, cloud architect, and web developer passionate about building secure, scalable solutions."}
              </p>
              <Link
                href="/about"
                className="group mt-8 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-all hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Read my story
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="container mx-auto px-4 py-20 md:py-28" aria-label="Featured projects">
        <ScrollReveal direction="up">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-gradient-to-br from-primary/5 to-primary/10">
                <FolderKanban className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">
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
              <ScrollReveal key={project.id} direction="up" delay={index * 75}>
                <ProjectCard project={project} />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <FolderKanban className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-3 text-muted-foreground">No featured projects yet.</p>
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
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </ScrollReveal>
        )}
      </section>

      {/* Contact CTA Section */}
      <section className="relative section-gradient-border" aria-label="Contact">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <ScrollReveal direction="up">
            <div className="relative mx-auto max-w-xl overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-muted/50 to-muted/20 p-8 md:p-12">
              {/* Decorative gradient orb */}
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
              
              <div className="relative text-center">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background shadow-sm">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                
                <h2 className="text-xl font-semibold tracking-tight">
                  Let&apos;s work together
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Have a project in mind or want to collaborate? I&apos;d love to hear from you.
                </p>
                
                <Link
                  href="/contact"
                  className="group mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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