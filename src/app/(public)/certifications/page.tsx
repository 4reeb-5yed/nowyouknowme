import type { Metadata } from "next";

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
    "Professional certifications and credentials demonstrating verified expertise in cybersecurity, cloud infrastructure, and web development.";
  const ogImage = config?.ogImageUrl || undefined;
  const title = "Certifications";

  return {
    title,
    description: `Certifications — ${description}`,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/certifications`,
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

export default async function CertificationsPage() {
  const trpc = await createServerClient();
  const certifications = await trpc.certifications.listVisible();

  return (
    <main className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
      <header className="mb-10 md:mb-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Certifications
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Professional credentials and licenses validating expertise across
          domains.
        </p>
      </header>

      <section aria-labelledby="certifications-list-heading">
        <h2 id="certifications-list-heading" className="sr-only">
          Credentials
        </h2>
        {certifications.length === 0 ? (
          <p className="text-muted-foreground">
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
    </main>
  );
}
