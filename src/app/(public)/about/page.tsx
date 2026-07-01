import type { Metadata } from "next";
import { User } from "lucide-react";

import { createServerClient } from "@/lib/trpc/server";
import { clientEnv } from "@/config/env";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = clientEnv.NEXT_PUBLIC_APP_URL;
  let description = "Learn more about my background, skills, and what drives me as a professional.";

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

type Section = {
  id: string;
  key: string;
  title: string;
  content: string | null;
};

export default async function AboutPage() {
  let section: Section | null = null;

  try {
    const trpc = await createServerClient();
    section = await trpc.pages.getSection({ key: "about" });
  } catch {
    // Return null if DB unavailable
  }

  return (
    <main className="min-h-screen">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background to-muted/20" />

      <div className="container mx-auto px-4 py-24 md:py-32">
        {/* Page header */}
        <header className="mx-auto max-w-2xl text-center">
          <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card shadow-lg">
            <User className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            About Me
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Background, skills, and what drives me as a professional.
          </p>
        </header>

        {/* Content */}
        <div className="mx-auto mt-16 max-w-2xl">
          {section?.content ? (
            <article
              className="rounded-2xl border border-border bg-card p-8 shadow-lg transition-shadow hover:shadow-xl"
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
