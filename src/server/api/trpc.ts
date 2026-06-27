/**
 * tRPC initialization and context creation.
 *
 * This file sets up the tRPC backend with:
 * - Context creation (session + database)
 * - Base procedure (public)
 * - Protected procedure (requires authentication)
 */
import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/server/db";

/**
 * Context available to all tRPC procedures.
 * Provides session (from NextAuth `auth()`) and the Drizzle database client.
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth();

  return {
    db,
    session,
    ...opts,
  };
};

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * tRPC initialization with custom error formatting.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError
            ? (error.cause as ZodError).flatten()
            : null,
      },
    };
  },
});

/**
 * Router and procedure helpers.
 */
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const middleware = t.middleware;

/**
 * Public procedure — no authentication required.
 */
export const publicProcedure = t.procedure;

/**
 * Protected procedure — requires authenticated session.
 * Throws UNAUTHORIZED if the user is not logged in.
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});
