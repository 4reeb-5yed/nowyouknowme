"use client";

import { ExternalLink } from "lucide-react";

export interface SocialLinkItem {
  platform: string;
  url: string;
}

export interface SocialLinksProps {
  links: SocialLinkItem[];
}

/**
 * SocialLinks displays the owner's social media links in a horizontal layout.
 * Each link shows the platform name with an external link icon, opens in a new tab,
 * and includes accessible aria-labels.
 */
export function SocialLinks({ links }: SocialLinksProps) {
  if (links.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Social links">
      <ul className="flex flex-wrap items-center gap-4">
        {links.map((link) => (
          <li key={`${link.platform}-${link.url}`}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${link.platform} (opens in new tab)`}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <span>{link.platform}</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
