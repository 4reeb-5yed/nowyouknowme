import type { Metadata } from "next";
import Link from "next/link";

import { createServerClient } from "@/lib/trpc/server";
import { CertificationCard } from "@/components/public/certification-card";
import { clientEnv } from "@/config/env";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const trpc = await createServerClient();
  const config = await trpc.siteConfig.get();
  const siteUrl = clientEnv.NEXT_PUBLIC_APP_URL;

  const description =
    config?.metaDescription ||
    "Professional certifications and credentials validating expertise across cybersecurity, cloud infrastructure, and web development.";

  return {
    title: "Certifications",
    description: `Certifications — ${description}`,
    openGraph: {
      title: "Certifications",
      description,
      url: `${siteUrl}/certifications`,
      type: "website",
    },
  };
}

export default async function CertificationsPage() {
  const trpc = await createServerClient();
  const certifications = await trpc.certifications.listVisible();

  return (
    <main className="section section--canvas">
      <div className="container">
        <div className="section-header">
          <p className="section-kicker">// 04 — Credentials</p>
          <h1 className="section-title">Certifications</h1>
          <p className="section-description">
            Professional credentials validating expertise across domains.
          </p>
        </div>

        <section aria-labelledby="certifications-list-heading">
          <h2 id="certifications-list-heading" className="sr-only">
            Credentials
          </h2>
          {certifications.length === 0 ? (
            <div className="certifications-empty">
              <p>No certifications to display at this time.</p>
            </div>
          ) : (
            <div className="certifications-grid">
              {certifications.map((certification) => (
                <CertificationCard
                  key={certification.id}
                  certification={certification}
                />
              ))}
            </div>
          )}
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
