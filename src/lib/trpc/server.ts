/**
 * tRPC server-side caller for use in React Server Components.
 */
import { headers } from "next/headers";

import { createCaller } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

/**
 * Creates a server-side tRPC caller with the current request context.
 * Use this in Server Components to call tRPC procedures directly.
 */
export const createServerClient = async () => {
  const heads = await headers();
  return createCaller(
    await createTRPCContext({
      headers: heads,
    })
  );
};
