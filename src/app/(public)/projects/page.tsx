import type { Metadata } from "next";
import { FolderKanban } from "lucide-react";

import { createServerClient } from "@/lib/trpc/server";
import { ProjectGrid } from "@/components/public/project-grid";
import { clientEnv } from "@/config/env";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = clientEnv.NEXT_PUBLIC_APP_URL;
  let description = "Browse portfolio projects spanning cybersecurity, cloud infrastructure, and web development.";

  try {
    const trpc = await createServerClient();
    const config = await trpc.siteConfig.get();
    if (config?.metaDescription) {
      description = config.metaDescription;
    }
  } catch {
    // Use default description if DB unavailable
  }

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
  let projects: Array<{ id: string; title: string; description: string; techStack: string[]; category: string; slug: string; thumbnailUrl: string | null; githubUrl: string | null; liveUrl: string | null; isFeatured: boolean; status: string }> = [];

  try {
    const trpc = await createServerClient();
    const rawProjects = await trpc.projects.list();
    projects = rawProjects.map((p) => ({
      ...p,
      techStack: p.techStack ?? [],
    }));
  } catch {
    // Return empty projects array if DB unavailable
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Premium animated background */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-section" />
        <div className="aurora aurora-1" />
        <div className="aurora aurora-2" />
        <div className="aurora aurora-3" />
      </div>

      <div className="container mx-auto px-4 py-24 md:py-32">
        {/* Page header */}
        <header className="mx-auto mb-16 max-w-2xl text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-border/50 bg-gradient-to-br from-purple-500/10 to-pink-500/5 shadow-lg shadow-purple-500/5">
            <FolderKanban className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Projects
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            A collection of work across cybersecurity, cloud, and web development.
          </p>
        </header>

        {/* Projects grid */}
        <section aria-labelledby="project-list-heading" className="mx-auto max-w-6xl">
          <h2 id="project-list-heading" className="sr-only">
            Project List
          </h2>
          <ProjectGrid projects={projects} />
        </section>
      </div>
    </main>
  );
}
