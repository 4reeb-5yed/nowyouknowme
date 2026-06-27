/**
 * tRPC root router — aggregates all sub-routers.
 */
import { createCallerFactory, createTRPCRouter } from "./trpc";
import { certificationsRouter } from "./routers/certifications";
import { contentRouter } from "./routers/content";
import { experienceRouter } from "./routers/experience";
import { projectsRouter } from "./routers/projects";
import { resumeRouter } from "./routers/resume";
import { siteConfigRouter } from "./routers/site-config";
import { socialLinksRouter } from "./routers/social-links";

/**
 * Main application router.
 * Sub-routers will be added here as features are implemented.
 */
export const appRouter = createTRPCRouter({
  certifications: certificationsRouter,
  content: contentRouter,
  experience: experienceRouter,
  projects: projectsRouter,
  resume: resumeRouter,
  siteConfig: siteConfigRouter,
  socialLinks: socialLinksRouter,
});

export type AppRouter = typeof appRouter;

/**
 * Server-side caller factory for calling tRPC procedures from server components.
 */
export const createCaller = createCallerFactory(appRouter);
