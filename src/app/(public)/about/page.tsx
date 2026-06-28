import type { Metadata } from "next";

import { createServerClient } from "@/lib/trpc/server";
import { clientEnv } from "@/config/env";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const trpc = await createServerClient();
  const config = await trpc.siteConfig.get();
  const siteUrl = clientEnv.NEXT_PUBLIC_APP_URL;

  const description =
    config?.metaDescription ||
    "Learn more about a professional spanning cybersecurity, cloud infrastructure, and web development.";
  const ogImage = config?.ogImageUrl || undefined;
  const title = "About";

  return {
    title,
    description: `About — ${description}`,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/about`,
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

export default async function AboutPage() {
  const trpc = await createServerClient();
  const section = await trpc.pages.getSection({ key: "about" });

  return (
    <main className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
      <header className="mb-10 md:mb-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          About
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Background, skills, and what drives me as a professional.
        </p>
      </header>

      {section?.content ? (
        <article
          className="prose prose-neutral dark:prose-invert max-w-3xl"
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
