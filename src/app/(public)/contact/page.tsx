import type { Metadata } from "next";

import { createServerClient } from "@/lib/trpc/server";
import { ContactForm } from "@/components/public/contact-form";
import { SocialLinks } from "@/components/public/social-links";
import { clientEnv } from "@/config/env";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const trpc = await createServerClient();
  const config = await trpc.siteConfig.get();
  const siteUrl = clientEnv.NEXT_PUBLIC_APP_URL;

  const description =
    config?.metaDescription ||
    "Get in touch. Send a message through the contact form or reach out via social media.";
  const ogImage = config?.ogImageUrl || undefined;
  const title = "Contact";

  return {
    title,
    description: `Contact — ${description}`,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/contact`,
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

export default async function ContactPage() {
  const trpc = await createServerClient();
  const socialLinks = await trpc.socialLinks.listVisible();

  return (
    <main className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
      <header className="mb-10 md:mb-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Contact
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Have a question or want to work together? Send me a message and
          I&apos;ll get back to you as soon as possible.
        </p>
      </header>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Contact Form */}
        <section aria-label="Contact form">
          <ContactForm />
        </section>

        {/* Alternative Contact Methods */}
        <section aria-label="Alternative contact methods">
          <h2 className="text-xl font-semibold tracking-tight">
            Other Ways to Reach Me
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You can also find me on these platforms.
          </p>
          <div className="mt-4">
            <SocialLinks links={socialLinks} />
          </div>
        </section>
      </div>
    </main>
  );
}
