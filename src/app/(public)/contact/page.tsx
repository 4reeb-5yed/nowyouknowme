import type { Metadata } from "next";
import { Mail } from "lucide-react";

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
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-border/50 bg-gradient-to-br from-primary/10 to-emerald-500/5 shadow-lg shadow-primary/5">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Get in touch
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Have a question or want to work together? Send me a message and I&apos;ll get back to you.
          </p>
        </header>

        <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-2 lg:gap-10">
          {/* Contact Form */}
          <section aria-label="Contact form">
            <div className="rounded-2xl border border-border/50 bg-card/50 p-8 backdrop-blur-sm">
              <ContactForm />
            </div>
          </section>

          {/* Social Links */}
          <section aria-label="Social links">
            <div className="rounded-2xl border border-border/50 bg-card/50 p-8 backdrop-blur-sm">
              <h2 className="text-lg font-semibold">
                Or find me online
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Connect with me on these platforms.
              </p>
              <div className="mt-6">
                <SocialLinks links={socialLinks} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
