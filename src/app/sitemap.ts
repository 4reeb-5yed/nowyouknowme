import type { MetadataRoute } from "next";

import { listPublished } from "@/server/services/project.service";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages with their change frequencies and priorities
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/projects`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/experience`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/certifications`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  // Fetch all published projects for dynamic URLs
  // Return only static pages if DB is unavailable
  let projectPages: MetadataRoute.Sitemap = [];
  try {
    const publishedProjects = await listPublished();
    if (Array.isArray(publishedProjects)) {
      projectPages = publishedProjects.map(
        (project) => ({
          url: `${BASE_URL}/projects/${project.slug}`,
          lastModified: project.updatedAt,
          changeFrequency: "monthly" as const,
          priority: 0.7,
        })
      );
    }
  } catch (error) {
    // Database unavailable - return only static pages
    console.error("[Sitemap] Failed to fetch projects:", error);
  }

  return [...staticPages, ...projectPages];
}
