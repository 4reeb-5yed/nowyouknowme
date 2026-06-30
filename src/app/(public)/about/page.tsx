import type { Metadata } from "next";
import { User } from "lucide-react";

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
        <header className="mx-auto max-w-2xl text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-border/50 bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg shadow-primary/5">
            <User className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            About Me
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Background, skills, and what drives me as a professional.
          </p>
        </header>

        {/* Content */}
        <div className="mx-auto mt-12 max-w-2xl">
          {section?.content ? (
            <article
              className="rounded-2xl border border-border/50 bg-card/50 p-8 backdrop-blur-sm"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
              <p className="text-muted-foreground">About content is not available at this time.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
