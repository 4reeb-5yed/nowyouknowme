import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Code } from "lucide-react";

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

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const api = await createServerClient();
  const project = await api.projects.getBySlug({ slug });

  if (!project) {
    notFound();
  }

  const techStack = (project.techStack ?? []) as string[];
  const displayDescription = project.longDescription || project.description;

  // JSON-LD structured data for project detail
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
    ...(project.liveUrl && {
      mainEntityOfPage: {
        "@type": "WebPage",
        url: project.liveUrl,
      },
    }),
    author: {
      "@type": "Person",
      name: "NowYouKnowMe",
      url: siteUrl,
    },
  };

  return (
    <main className="container mx-auto max-w-4xl px-4 py-12 md:py-16 lg:py-20">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Back link */}
      <Link
        href="/projects"
        className="mb-8 inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Back to Projects
      </Link>

      {/* Header */}
      <header className="mb-10 md:mb-12">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {project.title}
          </h1>
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary capitalize">
            {project.category}
          </span>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl">{project.description}</p>
      </header>

      {/* Content sections with consistent spacing */}
      <div className="space-y-10">
        {/* Thumbnail */}
        {project.thumbnailUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
            <Image
              src={project.thumbnailUrl}
              alt={`Project thumbnail for ${project.title}`}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 896px"
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlNWU3ZWIiLz48L3N2Zz4="
            />
          </div>
        )}

        {/* Links */}
        {(project.githubUrl || project.liveUrl) && (
          <div className="flex flex-wrap gap-4">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
              >
                <Code className="h-4 w-4" aria-hidden="true" />
                View Source
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Live Demo
              </a>
            )}
          </div>
        )}

        {/* Tech Stack */}
        {techStack.length > 0 && (
          <section aria-labelledby="tech-stack-heading">
            <h2
              id="tech-stack-heading"
              className="mb-3 text-xl font-semibold"
            >
              Tech Stack
            </h2>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center rounded-md bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Full Description */}
        {displayDescription && (
          <section aria-labelledby="description-heading">
            <h2
              id="description-heading"
              className="mb-3 text-xl font-semibold"
            >
              About This Project
            </h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-wrap">
              {displayDescription}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
