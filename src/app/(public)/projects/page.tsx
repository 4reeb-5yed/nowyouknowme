import type { Metadata } from "next";
import Link from "next/link";

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
    <main className="section section--canvas">
      <div className="container">
        <div className="section-header section-header--centered">
          <p className="section-kicker">// 02 — Selected Work</p>
          <h1 className="section-title">Projects</h1>
          <p className="section-description">
            A curated collection of projects spanning systems engineering, 
            cloud infrastructure, and product development.
          </p>
        </div>

        <section aria-labelledby="project-list-heading">
          <h2 id="project-list-heading" className="sr-only">
            Project List
          </h2>
          <ProjectGrid projects={projects} />
        </section>

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
