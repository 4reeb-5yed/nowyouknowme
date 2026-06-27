import type { MetadataRoute } from "next";

import { clientEnv } from "@/config/env";

/**
 * Generates robots.txt configuration.
 * Allows all crawlers to index public pages while disallowing /admin/* CMS routes.
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = clientEnv.NEXT_PUBLIC_APP_URL;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
