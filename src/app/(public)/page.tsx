import Link from "next/link";
import type { Metadata } from "next";
import { 
  ArrowRight, BookOpen, FolderKanban, 
  Award, Clock, Briefcase, Code2
} from "lucide-react";

import { createServerClient } from "@/lib/trpc/server";
import { Hero } from "@/components/public/hero";
import { ProjectCard } from "@/components/public/project-card";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { BackToTop } from "@/components/public/back-to-top";
import { AnimatedBackground } from "@/components/public/animated-background";
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

// Default stats - these should come from CMS in production
const DEFAULT_STATS = [
  { label: "Projects Delivered", value: "15+", icon: FolderKanban },
  { label: "Years Experience", value: "5+", icon: Clock },
  { label: "Certifications", value: "8+", icon: Award },
];

// Default skills
const DEFAULT_SKILLS = [
  { name: "React", category: "web" },
  { name: "TypeScript", category: "web" },
  { name: "Next.js", category: "web" },
  { name: "AWS", category: "cloud" },
  { name: "Docker", category: "cloud" },
  { name: "Python", category: "security" },
  { name: "Security+", category: "security" },
  { name: "Kubernetes", category: "cloud" },
];

export default async function HomePage() {
  const trpc = await createServerClient();

  // Fetch site config for hero tagline
  const configRows = await db.select().from(siteConfig).limit(1);
  const tagline = configRows[0]?.heroTagline || DEFAULT_TAGLINE;

  // Fetch active resume for the download button
  const activeResume = await trpc.resume.getActive();
  const resumeUrl = activeResume?.fileUrl ?? null;

  // Fetch social links
  const socialLinks = await trpc.socialLinks.listVisible();
  const githubLink = socialLinks.find(l => l.platform.toLowerCase() === "github");
  const linkedinLink = socialLinks.find(l => l.platform.toLowerCase() === "linkedin");

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

  // Fetch experience for preview
  const rawExperiences = await trpc.experience.listVisible();
  const experiences = rawExperiences.slice(0, 3).map(exp => ({
    ...exp,
    techStack: exp.techStack ?? [],
  }));

  // Fetch certifications count
  const certifications = await trpc.certifications.listVisible();

  // Calculate dynamic stats
  const stats = [
    { label: "Projects Delivered", value: `${Math.max(rawProjects.length, 10)}+`, icon: FolderKanban },
    { label: "Years Experience", value: "5+", icon: Clock },
    { label: "Certifications", value: `${certifications.length || 8}+`, icon: Award },
  ];

  // Collect all unique tech stacks
  const allTechStacks = [...new Set(rawProjects.flatMap(p => p.techStack || []))];
  const displaySkills = allTechStacks.length > 0 
    ? allTechStacks.slice(0, 8).map(name => ({ name, category: "web" as const }))
    : DEFAULT_SKILLS;

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

      {/* Full page animated background */}
      <AnimatedBackground enableParticles={false} className="min-h-screen">
      

      {/* Hero Section with Social Links */}
      <Hero 
        tagline={tagline} 
        resumeUrl={resumeUrl}
        githubUrl={githubLink?.url}
        linkedinUrl={linkedinLink?.url}
      />

      {/* Stats Section */}
      <section className="relative -mt-8 z-10" aria-label="Statistics">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="up">
            <div className="mx-auto max-w-3xl rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-xl">
              <div className="grid grid-cols-3 divide-x divide-border">
                {stats.map((stat, index) => (
                  <div key={stat.label} className="flex flex-col items-center px-4 py-5">
                    <stat.icon className="mb-2 h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold tracking-tight">{stat.value}</span>
                    <span className="mt-0.5 text-xs text-muted-foreground">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* About Preview Section */}
      <section className="relative overflow-hidden" aria-label="About preview">
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute left-1/4 top-1/2 h-[40vmin] w-[40vmin] -translate-y-1/2 rounded-full bg-gradient-to-r from-primary/15 via-purple-500/10 to-blue-500/15 blur-[80px]" />
        </div>
        
        <div className="container mx-auto px-4 py-16 md:py-24">
          <ScrollReveal direction="up">
            <div className="mx-auto max-w-2xl text-center">
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

      {/* Skills Section */}
      <section className="relative overflow-hidden" aria-label="Skills">
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute right-1/4 top-1/2 h-[30vmin] w-[30vmin] -translate-y-1/2 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/15 blur-[80px]" />
        </div>

        <div className="container mx-auto px-4 py-12 md:py-16">
          <ScrollReveal direction="up">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-border/50 bg-gradient-to-br from-cyan-500/15 to-blue-500/5 shadow-lg shadow-cyan-500/5">
                <Code2 className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                Tech Stack
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Technologies I work with
              </p>
              
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {displaySkills.map((skill) => (
                  <span
                    key={skill.name}
                    className="rounded-full border border-border/50 bg-card/60 px-4 py-1.5 text-sm font-medium backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-primary/5"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="relative overflow-hidden" aria-label="Featured projects">
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
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-muted/50">
                <FolderKanban className="h-7 w-7 text-muted-foreground/50" />
              </div>
              <p className="font-medium">Showcase your best work</p>
              <p className="mt-1 text-sm text-muted-foreground">Add featured projects in the dashboard</p>
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

      {/* Experience Preview Section */}
      {experiences.length > 0 && (
        <section className="relative overflow-hidden" aria-label="Experience preview">
          <div className="absolute inset-0 -z-10" aria-hidden="true">
            <div className="absolute left-1/4 top-1/2 h-[30vmin] w-[30vmin] -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-500/15 to-indigo-500/10 blur-[80px]" />
          </div>

          <div className="container mx-auto px-4 py-16 md:py-24">
            <ScrollReveal direction="up">
              <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-border/50 bg-gradient-to-br from-blue-500/15 to-indigo-500/5 shadow-lg shadow-blue-500/5">
                    <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Experience
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    My professional journey
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <div className="mx-auto max-w-xl space-y-4 lg:max-w-2xl lg-constrained">
              {experiences.map((exp, index) => (
                <ScrollReveal key={exp.id} direction="up" delay={index * 75}>
                  <Link
                    href="/experience"
                    className="group block rounded-xl border border-border/50 bg-card/60 p-5 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card/80"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                          {exp.roleTitle}
                        </h3>
                        <p className="text-sm text-muted-foreground">{exp.companyName}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {exp.startDate} — {exp.endDate || "Present"}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </div>
                    {exp.techStack.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {exp.techStack.slice(0, 4).map((tech) => (
                          <span
                            key={tech}
                            className="rounded-full bg-muted/50 px-2 py-0.5 text-xs"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal direction="up">
              <div className="mt-8 flex justify-center">
                <Link
                  href="/experience"
                  className="group inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-5 py-2 text-sm font-medium shadow backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  View full timeline
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* Simple Contact CTA - minimal, not redundant */}
      <section className="py-16 md:py-24" aria-label="Contact">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            Interested in working together?{" "}
            <Link
              href="/contact"
              className="inline-flex items-center gap-1 font-medium text-foreground underline-offset-4 transition-colors hover:underline"
            >
              Get in touch
              <ArrowRight className="h-4 w-4" />
            </Link>
          </p>
        </div>
      </section>

      {/* Back to Top Button */}
      <BackToTop />
      </AnimatedBackground>
    </main>
  );
}