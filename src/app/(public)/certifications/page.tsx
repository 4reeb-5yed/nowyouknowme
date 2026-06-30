import type { Metadata } from "next";
import { Award } from "lucide-react";

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
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-border/50 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 shadow-lg shadow-amber-500/5">
            <Award className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Certifications
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Professional credentials validating expertise across domains.
          </p>
        </header>

        {/* Certifications grid */}
        <section aria-labelledby="certifications-list-heading" className="mx-auto max-w-5xl">
          <h2 id="certifications-list-heading" className="sr-only">
            Credentials
          </h2>
          {certifications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
              <Award className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">No certifications to display at this time.</p>
            </div>
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
