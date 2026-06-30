import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Award } from "lucide-react";

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
            <Award className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Certifications
          </h1>
          <p className="mt-3 text-muted-foreground">
            Professional credentials validating expertise across domains.
          </p>
        </header>

        {/* Certifications grid */}
        <section aria-labelledby="certifications-list-heading">
          <h2 id="certifications-list-heading" className="sr-only">
            Credentials
          </h2>
          {certifications.length === 0 ? (
            <p className="text-muted-foreground py-12 text-center">
              No certifications to display at this time.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {certifications.map((certification) => (
                <CertificationCard
                  key={certification.id}
                  certification={certification}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
