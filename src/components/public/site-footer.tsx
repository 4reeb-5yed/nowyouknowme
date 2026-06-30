import Link from "next/link";
import { Heart } from "lucide-react";

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
    <footer className="border-t border-border/50 bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Main footer content */}
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Brand */}
          <div className="flex flex-col items-center sm:items-start gap-2">
            <Link
              href="/"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              NowYouKnowMe
            </Link>
            <p className="text-xs text-muted-foreground">
              Building secure, scalable solutions
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2" aria-label="Footer navigation">
            {footerLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear}
          </p>
        </div>
      </div>
    </footer>
  );
}
