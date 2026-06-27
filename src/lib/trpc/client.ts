/**
 * tRPC React client hooks.
 * Used in client components for queries and mutations.
 */
import { createTRPCReact } from "@trpc/react-query";

import type { AppRouter } from "@/server/api/root";

export const trpc = createTRPCReact<AppRouter>();
