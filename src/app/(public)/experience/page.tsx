import type { Metadata } from "next";
import Link from "next/link";

import { createServerClient } from "@/lib/trpc/server";
import { ExperienceTimeline } from "@/components/public/experience-timeline";
import { clientEnv } from "@/config/env";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const trpc = await createServerClient();
  const config = await trpc.siteConfig.get();
  const siteUrl = clientEnv.NEXT_PUBLIC_APP_URL;

  const description =
    config?.metaDescription ||
    "Career history and professional experience in cybersecurity, cloud infrastructure, and web development.";

  return {
    title: "Experience",
    description: `Experience — ${description}`,
    openGraph: {
      title: "Experience",
      description,
      url: `${siteUrl}/experience`,
      type: "website",
    },
  };
}

export default async function ExperiencePage() {
  const trpc = await createServerClient();
  const rawExperiences = await trpc.experience.listVisible();

  const experiences = rawExperiences.map((exp) => ({
    ...exp,
    techStack: exp.techStack ?? [],
  }));

  return (
    <main className="section section--canvas">
      <div className="container">
        <div className="section-header">
          <p className="section-kicker">// 03 — Career</p>
          <h1 className="section-title">Experience</h1>
          <p className="section-description">
            Professional journey building solutions across systems engineering, cloud infrastructure, and product development.
          </p>
        </div>

        <section aria-labelledby="experience-timeline-heading" className="experience-page-timeline">
          <ExperienceTimeline experiences={experiences} />
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
