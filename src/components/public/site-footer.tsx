import Link from "next/link";
import { createServerClient } from "@/lib/trpc/server";

const footerLinks = [
  { href: "/projects", label: "Projects" },
  { href: "/experience", label: "Experience" },
  { href: "/certifications", label: "Certifications" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export async function SiteFooter() {
  let socialLinks: { platform: string; url: string }[] = [];

  try {
    const trpc = await createServerClient();
    socialLinks = await trpc.socialLinks.listVisible();
  } catch {
    // Gracefully handle if social links are unavailable
  }

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="text-lg font-bold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded-md"
            >
              NowYouKnowMe
            </Link>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs">
              Building secure, scalable, and elegant solutions across cybersecurity, cloud, and web development.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Pages
            </h3>
            <nav className="mt-3 flex flex-col gap-2" aria-label="Footer navigation">
              {footerLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Connect
            </h3>
            {socialLinks.length > 0 ? (
              <nav className="mt-3 flex flex-col gap-2" aria-label="Social links">
                {socialLinks.map((link) => (
                  <a
                    key={`${link.platform}-${link.url}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`${link.platform} (opens in new tab)`}
                  >
                    {link.platform}
                  </a>
                ))}
              </nav>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Social links coming soon.
              </p>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-border/40 pt-6">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {currentYear} NowYouKnowMe. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
