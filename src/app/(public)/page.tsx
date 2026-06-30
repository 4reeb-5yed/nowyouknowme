import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FolderKanban, Award, Clock, Sparkles, BookOpen } from "lucide-react";
import { createServerClient } from "@/lib/trpc/server";
import { PremiumHero } from "@/components/public/premium-hero";
import { PremiumProjectCard } from "@/components/public/premium-project-card";
import { PremiumBackground } from "@/components/public/premium-background";
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
  const experiences = rawExperiences.slice(0, 3).map((exp) => ({ ...exp, techStack: exp.techStack ?? [] }));

  const certifications = await trpc.certifications.listVisible();

  const stats = [
    { label: "Projects", value: `${Math.max(rawProjects.length, 10)}+`, icon: FolderKanban },
    { label: "Experience", value: "5+", icon: Clock },
    { label: "Certifications", value: `${certifications.length || 8}+`, icon: Award },
  ];

  return (
    <main className="relative min-h-screen">
      {/* Hero */}
      <PremiumHero tagline={tagline} resumeUrl={resumeUrl} />

      {/* Stats */}
      <section className="relative z-10 -mt-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl rounded-3xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl">
            <div className="grid grid-cols-3 divide-x divide-border">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col items-center px-6 py-8">
                  <stat.icon className="mb-3 h-6 w-6 text-primary" />
                  <span className="text-3xl font-bold tracking-tight">{stat.value}</span>
                  <span className="mt-1 text-sm text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="relative py-32">
          <PremiumBackground variant="section" />
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Selected Work</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Featured Projects</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Solutions I have built across cybersecurity, cloud infrastructure, and web development.</p>
            </div>
            <div className={cn(
              "grid gap-8",
              featuredProjects.length === 1 && "max-w-2xl mx-auto",
              featuredProjects.length === 2 && "md:grid-cols-2 max-w-4xl mx-auto",
              featuredProjects.length >= 3 && "md:grid-cols-2 lg:grid-cols-3"
            )}>
              {featuredProjects.map((project, i) => (
                <div key={project.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <PremiumProjectCard project={project} featured />
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link href="/projects" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border bg-card hover:border-primary/30 hover:bg-card/80 transition-all">
                View all projects <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Experience Preview */}
      {experiences.length > 0 && (
        <section className="relative py-32">
          <PremiumBackground variant="section" />
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Career</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Experience</h2>
            </div>
            <div className={cn(
              "space-y-4",
              experiences.length === 1 && "max-w-2xl mx-auto",
              experiences.length > 1 && "max-w-xl mx-auto"
            )}>
              {experiences.map((exp, i) => (
                <Link key={exp.id} href="/experience" className="block">
                  <div className="group p-6 rounded-2xl border border-border bg-card/80 backdrop-blur-sm transition-all duration-300 hover:bg-card hover:border-primary/30 hover:shadow-lg animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{exp.roleTitle}</h3>
                        <p className="text-muted-foreground">{exp.companyName}</p>
                        <p className="mt-1 text-sm text-muted-foreground/70">{exp.startDate} — {exp.endDate || "Present"}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </div>
                    {exp.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {exp.techStack.slice(0, 4).map((tech) => (
                          <span key={tech} className="px-3 py-1 rounded-full bg-muted/50 text-xs">{tech}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative py-32">
        <PremiumBackground variant="section" />
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Let&apos;s work together</h2>
            <p className="text-lg text-muted-foreground mb-8">Have a project in mind or want to connect? I would love to hear from you.</p>
            <Link href="/contact" className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-medium transition-all hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5">
              Get in touch <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
