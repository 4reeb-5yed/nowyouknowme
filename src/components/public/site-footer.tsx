import Link from "next/link";
import { Sparkles } from "lucide-react";

const footerLinks = [
  { href: "/projects", label: "Projects" },
  { href: "/experience", label: "Experience" },
  { href: "/certifications", label: "Certifications" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border/50 bg-muted/30">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link
              href="/"
              className="group flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 transition-colors group-hover:bg-primary/20">
                <Sparkles className="h-3 w-3 text-primary" />
              </span>
              <span>NowYouKnowMe</span>
            </Link>
            <p className="text-xs text-muted-foreground">
              Building secure, scalable solutions
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2" aria-label="Footer navigation">
            {footerLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-1"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
