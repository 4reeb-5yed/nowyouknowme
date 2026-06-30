import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Github, ExternalLink, Shield, Cloud, Code, Box } from "lucide-react";

import type { Metadata } from "next";
import { createServerClient } from "@/lib/trpc/server";
import { clientEnv } from "@/config/env";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const api = await createServerClient();
  const [project, config] = await Promise.all([
    api.projects.getBySlug({ slug }),
    api.siteConfig.get(),
  ]);

  if (!project) {
    return {
      title: "Project Not Found",
      description: "The requested project could not be found.",
    };
  }

  const ogImage = project.thumbnailUrl || config?.ogImageUrl;
  const siteUrl = clientEnv.NEXT_PUBLIC_APP_URL;

  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      url: `${siteUrl}/projects/${slug}`,
      type: "article",
      ...(ogImage && { images: [{ url: ogImage }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.description,
      ...(ogImage && { images: [ogImage] }),
    },
  };
}

const categoryConfig = {
  cybersecurity: { icon: Shield, label: "Security" },
  cloud: { icon: Cloud, label: "Cloud" },
  web: { icon: Code, label: "Web" },
  other: { icon: Box, label: "Other" },
};

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const api = await createServerClient();
  const project = await api.projects.getBySlug({ slug });

  if (!project) {
    notFound();
  }

  const techStack = (project.techStack ?? []) as string[];
  const displayDescription = project.longDescription || project.description;
  const categoryVariant = project.category as keyof typeof categoryConfig;
  const catConfig = categoryConfig[categoryVariant] || categoryConfig.other;
  const Icon = catConfig.icon;

  const siteUrl = clientEnv.NEXT_PUBLIC_APP_URL;
  const projectUrl = `${siteUrl}/projects/${slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    url: projectUrl,
    ...(project.thumbnailUrl && { image: project.thumbnailUrl }),
    ...(techStack.length > 0 && { keywords: techStack.join(", ") }),
    ...(project.githubUrl && { codeRepository: project.githubUrl }),
    author: { "@type": "Person", name: "Areeb Syed", url: siteUrl },
  };

  return (
    <main className="section section--canvas">
      <div className="container">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <Link href="/projects" className="project-detail__back">
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>

        <header className="project-detail__header">
          <div className="project-detail__meta">
            <span className="project-detail__category">
              <Icon className="h-3 w-3" />
              {catConfig.label}
            </span>
            {project.isFeatured && (
              <span className="project-detail__featured">Featured</span>
            )}
          </div>
          <h1 className="project-detail__title">{project.title}</h1>
          <p className="project-detail__description">{project.description}</p>
        </header>

        {project.thumbnailUrl && (
          <div className="project-detail__image">
            <Image
              src={project.thumbnailUrl}
              alt={`Project thumbnail for ${project.title}`}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 80vw"
            />
          </div>
        )}

        <div className="project-detail__content">
          {(project.githubUrl || project.liveUrl) && (
            <div className="project-detail__links">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--secondary"
                >
                  <Github className="h-4 w-4" />
                  View Source
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--primary"
                >
                  <ExternalLink className="h-4 w-4" />
                  Live Demo
                </a>
              )}
            </div>
          )}

          {techStack.length > 0 && (
            <section className="project-detail__section">
              <h2 className="project-detail__section-title">Tech Stack</h2>
              <div className="project-detail__stack">
                {techStack.map((tech) => (
                  <span key={tech} className="project-detail__tag">{tech}</span>
                ))}
              </div>
            </section>
          )}

          {displayDescription && (
            <section className="project-detail__section">
              <h2 className="project-detail__section-title">About This Project</h2>
              <div className="project-detail__body">{displayDescription}</div>
            </section>
          )}
        </div>

        <div className="section-footer">
          <Link href="/#contact" className="btn btn--text">
            Interested in working together?
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </div>
    </main>
  );
}
