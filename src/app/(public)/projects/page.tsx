import type { Metadata } from "next";

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
  const ogImage = config?.ogImageUrl || undefined;
  const title = "Projects";

  return {
    title,
    description: `Projects — ${description}`,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/projects`,
      type: "website",
      ...(ogImage && { images: [{ url: ogImage }] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  };
}

export default async function ProjectsPage() {
  const trpc = await createServerClient();
  const rawProjects = await trpc.projects.list();

  // Normalize techStack from nullable to always an array for the ProjectGrid component
  const projects = rawProjects.map((p) => ({
    ...p,
    techStack: p.techStack ?? [],
  }));

  return (
    <main className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
      <header className="mb-10 md:mb-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Projects
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          A collection of work across cybersecurity, cloud, and web development.
        </p>
      </header>

      <section aria-labelledby="project-list-heading">
        <h2 id="project-list-heading" className="sr-only">
          Project List
        </h2>
        <ProjectGrid projects={projects} />
      </section>
    </main>
  );
}
