import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import * as projectService from "@/server/services/project.service";
import * as experienceService from "@/server/services/experience.service";
import * as certificationService from "@/server/services/certification.service";
import * as socialLinkService from "@/server/services/social-link.service";
import { db } from "@/server/db";
import { sections } from "@/server/db/schema/section";
import { siteConfig } from "@/server/db/schema/site-config";

/**
 * Unified search across all content types.
 */
export const searchRouter = createTRPCRouter({
  /**
   * Global search across all content types (admin only).
   */
  global: protectedProcedure
    .input(z.object({
      query: z.string().min(1),
      types: z.array(z.enum([
        "projects",
        "experience",
        "certifications",
        "sections",
        "social_links",
        "site_config",
      ])).optional(),
    }))
    .query(async ({ input }) => {
      const { query, types } = input;
      const searchTypes = types ?? ["projects", "experience", "certifications", "sections", "social_links", "site_config"];
      const results: SearchResult[] = [];
      const queryLower = query.toLowerCase();

      // Search projects
      if (searchTypes.includes("projects")) {
        const projects = await projectService.listAll();
        const matchedProjects = projects.filter(p => 
          p.title.toLowerCase().includes(queryLower) ||
          p.description.toLowerCase().includes(queryLower) ||
          p.slug.toLowerCase().includes(queryLower) ||
          (p.techStack ?? []).some(t => t.toLowerCase().includes(queryLower))
        );
        results.push(...matchedProjects.map(p => ({
          id: p.id,
          type: "project" as const,
          title: p.title,
          description: p.description,
          status: p.status,
          url: `/projects/${p.slug}`,
          adminUrl: "/admin/projects",
        })));
      }

      // Search experience
      if (searchTypes.includes("experience")) {
        const experiences = await experienceService.listAll();
        const matchedExperience = experiences.filter(e =>
          e.companyName.toLowerCase().includes(queryLower) ||
          e.roleTitle.toLowerCase().includes(queryLower) ||
          (e.description ?? "").toLowerCase().includes(queryLower)
        );
        results.push(...matchedExperience.map(e => ({
          id: e.id,
          type: "experience" as const,
          title: `${e.roleTitle} at ${e.companyName}`,
          description: e.description ?? "",
          url: "/experience",
          adminUrl: "/admin/experience",
        })));
      }

      // Search certifications
      if (searchTypes.includes("certifications")) {
        const certifications = await certificationService.listAll();
        const matchedCerts = certifications.filter(c =>
          c.certificationName.toLowerCase().includes(queryLower) ||
          c.issuingOrganization.toLowerCase().includes(queryLower)
        );
        results.push(...matchedCerts.map(c => ({
          id: c.id,
          type: "certification" as const,
          title: c.certificationName,
          description: `Issued by ${c.issuingOrganization}`,
          url: "/certifications",
          adminUrl: "/admin/certifications",
        })));
      }

      // Search sections (pages content)
      if (searchTypes.includes("sections")) {
        const allSections = await db.query.sections.findMany();
        const matchedSections = allSections.filter(s =>
          s.key.toLowerCase().includes(queryLower) ||
          (s.content ?? "").toLowerCase().includes(queryLower)
        );
        results.push(...matchedSections.map(s => ({
          id: s.id,
          type: "section" as const,
          title: s.key.charAt(0).toUpperCase() + s.key.slice(1),
          description: (s.content ?? "").substring(0, 100) + ((s.content?.length ?? 0) > 100 ? "..." : ""),
          url: `/${s.key === "contact" ? "contact" : s.key === "about" ? "about" : ""}`,
          adminUrl: "/admin/pages",
        })));
      }

      // Search social links
      if (searchTypes.includes("social_links")) {
        const socialLinks = await socialLinkService.listAll();
        const matchedLinks = socialLinks.filter(l =>
          l.platform.toLowerCase().includes(queryLower) ||
          l.url.toLowerCase().includes(queryLower)
        );
        results.push(...matchedLinks.map(l => ({
          id: l.id,
          type: "social_link" as const,
          title: l.platform,
          description: l.url,
          url: l.url,
          adminUrl: "/admin/social-links",
        })));
      }

      // Search site config
      if (searchTypes.includes("site_config")) {
        const config = await db.query.siteConfig.findFirst();
        if (config) {
          const configStr = JSON.stringify(config).toLowerCase();
          if (configStr.includes(queryLower)) {
            results.push({
              id: config.id,
              type: "site_config" as const,
              title: "Site Configuration",
              description: `Theme: ${config.theme}, Accent: ${config.accentColor}`,
              adminUrl: "/admin/site-config",
            });
          }
        }
      }

      return {
        query,
        total: results.length,
        results,
      };
    }),

  /**
   * Quick search for autocomplete (admin only).
   */
  quick: protectedProcedure
    .input(z.object({
      query: z.string().min(1),
    }))
    .query(async ({ input }) => {
      const { query } = input;
      const results: QuickSearchResult[] = [];
      const queryLower = query.toLowerCase();

      // Quick search projects (title and slug only)
      if (query.length >= 2) {
        const projects = await projectService.listAll();
        const matchedProjects = projects
          .filter(p => 
            p.title.toLowerCase().includes(queryLower) ||
            p.slug.toLowerCase().includes(queryLower)
          )
          .slice(0, 5);
        
        results.push(...matchedProjects.map(p => ({
          id: p.id,
          type: "project" as const,
          title: p.title,
          subtitle: p.slug,
          url: `/admin/projects`,
        })));

        // Quick search experience
        const experiences = await experienceService.listAll();
        const matchedExp = experiences
          .filter(e =>
            e.companyName.toLowerCase().includes(queryLower) ||
            e.roleTitle.toLowerCase().includes(queryLower)
          )
          .slice(0, 3);
        
        results.push(...matchedExp.map(e => ({
          id: e.id,
          type: "experience" as const,
          title: e.roleTitle,
          subtitle: e.companyName,
          url: `/admin/experience`,
        })));
      }

      return {
        query,
        results: results.slice(0, 10),
      };
    }),
});

type SearchResult = {
  id: string;
  type: "project" | "experience" | "certification" | "section" | "social_link" | "site_config";
  title: string;
  description: string;
  status?: string;
  url?: string;
  adminUrl: string;
};

type QuickSearchResult = {
  id: string;
  type: "project" | "experience";
  title: string;
  subtitle: string;
  url: string;
};
