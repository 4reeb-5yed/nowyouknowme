/**
 * tRPC root router — aggregates all sub-routers.
 */
import { createCallerFactory, createTRPCRouter } from "./trpc";
import { certificationsRouter } from "./routers/certifications";
import { pagesRouter } from "./routers/pages";
import { experienceRouter } from "./routers/experience";
import { projectsRouter } from "./routers/projects";
import { resumeRouter } from "./routers/resume";
import { siteConfigRouter } from "./routers/site-config";
import { socialLinksRouter } from "./routers/social-links";
import { activityLogRouter } from "./routers/activity-log";
import { searchRouter } from "./routers/search";

/**
 * Main application router.
 */
export const appRouter = createTRPCRouter({
  certifications: certificationsRouter,
  pages: pagesRouter,
  experience: experienceRouter,
  projects: projectsRouter,
  resume: resumeRouter,
  siteConfig: siteConfigRouter,
  socialLinks: socialLinksRouter,
  activityLog: activityLogRouter,
  search: searchRouter,
});

export type AppRouter = typeof appRouter;

/**
 * Server-side caller factory for calling tRPC procedures from server components.
 */
export const createCaller = createCallerFactory(appRouter);