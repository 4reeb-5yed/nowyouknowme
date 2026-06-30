import type { Metadata } from "next";
import Link from "next/link";

import { createServerClient } from "@/lib/trpc/server";
import { clientEnv } from "@/config/env";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const trpc = await createServerClient();
  const config = await trpc.siteConfig.get();
  const siteUrl = clientEnv.NEXT_PUBLIC_APP_URL;

  const description =
    config?.metaDescription ||
    "Learn more about my background, skills, and what drives me as a professional.";

  return {
    title: "About",
    description: `About — ${description}`,
    openGraph: {
      title: "About",
      description,
      url: `${siteUrl}/about`,
      type: "website",
    },
  };
}

export default async function AboutPage() {
  const trpc = await createServerClient();
  const section = await trpc.pages.getSection({ key: "about" });

  return (
    <main className="section section--surface">
      <div className="container">
        <div className="section-header">
          <p className="section-kicker">// 05 — Background</p>
          <h1 className="section-title">About Me</h1>
          <p className="section-description">
            The story behind the work.
          </p>
        </div>

        {section?.content ? (
          <article className="about-page-content" dangerouslySetInnerHTML={{ __html: section.content }} />
        ) : (
          <div className="about-page-empty">
            <p>About content is not available at this time.</p>
          </div>
        )}

        <div className="section-footer">
          <Link href="/#contact" className="btn btn--text">
            Get in touch
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </div>
    </main>
  );
}
