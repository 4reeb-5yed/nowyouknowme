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
    <main className="section section--canvas">
      <div className="container">
        <div className="section-header section-header--centered">
          <p className="section-kicker">// 06 — Contact</p>
          <h1 className="section-title">Get in Touch</h1>
          <p className="section-description">
            Have a question or want to work together? Send me a message and I&apos;ll get back to you.
          </p>
        </div>

        <div className="contact-page-grid">
          {/* Contact Form */}
          <section aria-label="Contact form" className="contact-page-form">
            <ContactForm />
          </section>

          {/* Social Links */}
          <section aria-label="Social links" className="contact-page-social">
            <h2 className="contact-page-social__title">Or find me online</h2>
            <p className="contact-page-social__desc">
              Connect with me on these platforms.
            </p>
            <div className="contact-page-social__links">
              <SocialLinks links={socialLinks} />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
