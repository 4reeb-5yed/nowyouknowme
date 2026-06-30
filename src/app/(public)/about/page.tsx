import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
    <main className="container mx-auto px-4 py-12 md:py-16">
      {/* Back link */}
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      {/* Page header */}
      <header className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          About
        </h1>
        <p className="mt-3 text-muted-foreground">
          Background, skills, and what drives me as a professional.
        </p>
      </header>

      {/* Content */}
      {section?.content ? (
        <article
          className="prose prose-neutral dark:prose-invert max-w-2xl"
          dangerouslySetInnerHTML={{ __html: section.content }}
        />
      ) : (
        <p className="text-muted-foreground">
          About content is not available at this time.
        </p>
      )}
    </main>
  );
}
