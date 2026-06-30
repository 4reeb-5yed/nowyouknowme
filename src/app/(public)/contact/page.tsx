import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

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
    "Get in touch. Send a message or reach out via social media.";

  return {
    title: "Contact",
    description: `Contact — ${description}`,
    openGraph: {
      title: "Contact",
      description,
      url: `${siteUrl}/contact`,
      type: "website",
    },
  };
}

export default async function ContactPage() {
  const trpc = await createServerClient();
  const socialLinks = await trpc.socialLinks.listVisible();

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
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Get in touch
          </h1>
          <p className="mt-3 text-muted-foreground">
            Have a question or want to work together? Send me a message and I&apos;ll get back to you.
          </p>
        </header>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          {/* Contact Form */}
          <section aria-label="Contact form">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <ContactForm />
            </div>
          </section>

          {/* Social Links */}
          <section aria-label="Social links">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold">
                Or find me online
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Connect with me on these platforms.
              </p>
              <div className="mt-4">
                <SocialLinks links={socialLinks} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
