"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Briefcase, Code2, Shield, Cloud, Star, FolderKanban, Award, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// Intersection Observer hook for scroll animations
function useInView(options = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.disconnect();
      }
    }, { threshold: 0.1, ...options });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isInView };
}

// Icon mapping for stats
const iconMap = {
  FolderKanban,
  Award,
  Clock,
};

// V2 Stats Section - Editorial layout
interface Stat {
  label: string;
  value: string;
  icon: string;
}

export function V2Stats({ stats }: { stats: Stat[] }) {
  const { ref, isInView } = useInView();

  return (
    <section ref={ref} className="relative z-10 -mt-20 pb-20">
      <div className="container mx-auto px-4">
        <div 
          className={cn(
            "relative overflow-hidden rounded-[2rem] border border-border/30 bg-card/60 backdrop-blur-2xl shadow-2xl",
            "transition-all duration-1000 ease-out",
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          )}
        >
          {/* Inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          
          {/* Decorative corner elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-tl-[2rem]" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-accent/10 to-transparent rounded-br-[2rem]" />

          <div className="relative grid grid-cols-3 divide-x divide-border/50">
            {stats.map((stat, i) => {
              const IconComponent = iconMap[stat.icon as keyof typeof iconMap] || FolderKanban;
              return (
                <div 
                  key={stat.label} 
                  className={cn(
                    "flex flex-col items-center px-6 py-10 transition-all duration-700",
                    isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  )}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <IconComponent className="w-7 h-7 text-primary mb-4" />
                  <span className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent">
                    {stat.value}
                  </span>
                  <span className="mt-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// V2 Projects Section - Editorial, magazine-style
interface Project {
  id: string;
  title: string;
  description: string;
  slug: string;
  thumbnailUrl?: string;
  category: string;
  techStack: string[];
  isFeatured?: boolean;
}

export function V2Projects({ projects }: { projects: Project[] }) {
  const { ref, isInView } = useInView();

  if (projects.length === 0) return null;

  const featuredProject = projects[0];
  const otherProjects = projects.slice(1);

  return (
    <section ref={ref} className="relative py-32 md:py-40 overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 via-transparent to-transparent rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className={cn(
          "text-center mb-20 transition-all duration-1000",
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        )}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Selected Work</span>
          </div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Featured Projects
          </h2>
          <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto">
            A curated selection of projects that showcase my expertise in building secure, scalable, and elegant solutions.
          </p>
        </div>

        {/* Featured project - large editorial card */}
        {featuredProject && (
          <div className={cn(
            "mb-12 transition-all duration-1000 delay-200",
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
          )}>
            <Link href={`/projects/${featuredProject.slug}`} className="group block">
              <div className="relative overflow-hidden rounded-[2rem] border border-border/30 bg-gradient-to-br from-card to-card/50 shadow-2xl transition-all duration-500 hover:shadow-3xl hover:-translate-y-1">
                {/* Featured badge */}
                <div className="absolute top-6 right-6 z-10">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-500 text-sm font-medium backdrop-blur-sm border border-amber-500/20">
                    <Star className="w-4 h-4 fill-current" />
                    Featured
                  </span>
                </div>

                {/* Image */}
                <div className="relative aspect-[21/9] overflow-hidden rounded-t-[2rem]">
                  {featuredProject.thumbnailUrl ? (
                    <Image
                      src={featuredProject.thumbnailUrl}
                      alt={featuredProject.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative p-8 md:p-12 -mt-32">
                  <div className="max-w-3xl">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        {featuredProject.category}
                      </span>
                    </div>
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 group-hover:text-primary transition-colors">
                      {featuredProject.title}
                    </h3>
                    <p className="text-lg text-muted-foreground/80 mb-6 leading-relaxed">
                      {featuredProject.description}
                    </p>
                    <div className="flex items-center gap-2 text-primary font-medium">
                      <span>View Case Study</span>
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Other projects grid */}
        {otherProjects.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherProjects.map((project, i) => (
              <ProjectCardV2 key={project.id} project={project} index={i} isInView={isInView} />
            ))}
          </div>
        )}

        {/* View all link */}
        <div className={cn(
          "text-center mt-16 transition-all duration-1000 delay-500",
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          <Link 
            href="/projects"
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm font-medium transition-all hover:bg-card hover:border-primary/30 hover:-translate-y-0.5"
          >
            <span>View All Projects</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// Individual project card
function ProjectCardV2({ project, index, isInView }: { project: Project; index: number; isInView: boolean }) {
  const categoryIcon = {
    cybersecurity: Shield,
    cloud: Cloud,
    web: Code2,
    other: Code2,
  }[project.category] || Code2;
  const Icon = categoryIcon;

  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      <article 
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border/30 bg-card/80 backdrop-blur-sm",
          "transition-all duration-500 hover:bg-card hover:border-primary/30 hover:shadow-xl hover:-translate-y-1",
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        )}
        style={{ transitionDelay: `${300 + index * 100}ms` }}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          {project.thumbnailUrl ? (
            <Image
              src={project.thumbnailUrl}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <Icon className="w-12 h-12 text-primary/30" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Icon className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {project.category}
            </span>
          </div>
          <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
            {project.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        </div>
      </article>
    </Link>
  );
}

// V2 Experience Section - Storytelling timeline
interface Experience {
  id: string;
  roleTitle: string;
  companyName: string;
  startDate: string;
  endDate?: string;
  techStack: string[];
}

export function V2Experience({ experiences }: { experiences: Experience[] }) {
  const { ref, isInView } = useInView();

  if (experiences.length === 0) return null;

  return (
    <section ref={ref} className="relative py-32 md:py-40">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-radial from-accent/5 via-transparent to-transparent rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className={cn(
          "text-center mb-20 transition-all duration-1000",
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        )}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <Briefcase className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Career</span>
          </div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Experience
          </h2>
          <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto">
            My professional journey building solutions across cybersecurity, cloud infrastructure, and web development.
          </p>
        </div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto">
          {experiences.map((exp, i) => (
            <Link key={exp.id} href="/experience" className="group block">
              <div 
                className={cn(
                  "relative pl-12 pb-12 transition-all duration-700",
                  isInView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
                )}
                style={{ transitionDelay: `${200 + i * 150}ms` }}
              >
                {/* Timeline line */}
                {i < experiences.length - 1 && (
                  <div className="absolute left-[19px] top-12 bottom-0 w-px bg-gradient-to-b from-border to-border/20" />
                )}

                {/* Timeline dot */}
                <div className="absolute left-0 top-2 w-10 h-10 rounded-full border-2 border-border bg-card flex items-center justify-center transition-all duration-300 group-hover:border-primary group-hover:bg-primary/10">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                </div>

                {/* Content */}
                <div className={cn(
                  "relative rounded-2xl border border-border/30 bg-card/60 backdrop-blur-sm p-6 md:p-8",
                  "transition-all duration-300 group-hover:bg-card group-hover:border-primary/30 group-hover:shadow-lg"
                )}>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl md:text-2xl font-semibold group-hover:text-primary transition-colors">
                        {exp.roleTitle}
                      </h3>
                      <p className="text-muted-foreground font-medium">{exp.companyName}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-muted-foreground/70">
                        {exp.startDate}
                      </span>
                      <span className="text-sm text-muted-foreground/50 mx-2">—</span>
                      <span className="text-sm font-medium text-primary">
                        {exp.endDate || "Present"}
                      </span>
                    </div>
                  </div>

                  {exp.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {exp.techStack.slice(0, 5).map((tech) => (
                        <span 
                          key={tech} 
                          className="px-3 py-1.5 rounded-full bg-muted/50 text-xs font-medium text-muted-foreground backdrop-blur-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* View more indicator */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className={cn(
          "text-center mt-12 transition-all duration-1000 delay-500",
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          <Link 
            href="/experience"
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm font-medium transition-all hover:bg-card hover:border-primary/30"
          >
            <span>View Full Timeline</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// V2 CTA Section - Cinematic
export function V2CTA() {
  const { ref, isInView } = useInView();

  return (
    <section ref={ref} className="relative py-40 md:py-56 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/10 via-accent/5 to-transparent rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4">
        <div className={cn(
          "max-w-3xl mx-auto text-center transition-all duration-1000",
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
        )}>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-8 leading-tight">
            Let&apos;s create something<br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              extraordinary
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground/80 mb-12 max-w-xl mx-auto">
            Have a project in mind or want to explore opportunities? I would love to hear from you.
          </p>
          <Link 
            href="/contact"
            className="group inline-flex items-center gap-4 px-10 py-5 rounded-2xl bg-primary text-primary-foreground font-semibold text-lg shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-1 active:translate-y-0"
          >
            <span>Get in Touch</span>
            <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}
