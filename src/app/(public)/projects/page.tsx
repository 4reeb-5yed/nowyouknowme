import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FolderKanban } from "lucide-react";

import { createServerClient } from "@/lib/trpc/server";
import { ProjectGrid } from "@/components/public/project-grid";
import { clientEnv } from "@/config/env";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const trpc = await createServerClient();
  const config = await trpc.siteConfig.get();
  const siteUrl = clientEnv.NEXT_PUBLIC_APP_URL;

  const description =
    config?.metaDescription ||
    "Browse portfolio projects spanning cybersecurity, cloud infrastructure, and web development.";

  return {
    title: "Projects",
    description: `Projects — ${description}`,
    openGraph: {
      title: "Projects",
      description,
      url: `${siteUrl}/projects`,
      type: "website",
    },
  };
}

export default async function ProjectsPage() {
  const trpc = await createServerClient();
  const rawProjects = await trpc.projects.list();

  const projects = rawProjects.map((p) => ({
    ...p,
    techStack: p.techStack ?? [],
  }));

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Back link */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        {/* Page header */}
        <header className="mb-12 max-w-2xl">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-gradient-to-br from-primary/5 to-primary/10">
            <FolderKanban className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Projects
          </h1>
          <p className="mt-3 text-muted-foreground">
            A collection of work across cybersecurity, cloud, and web development.
          </p>
        </header>

        {/* Projects grid */}
        <section aria-labelledby="project-list-heading">
          <h2 id="project-list-heading" className="sr-only">
            Project List
          </h2>
          <ProjectGrid projects={projects} />
        </section>
      </div>
    </main>
  );
}
