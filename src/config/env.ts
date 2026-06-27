import { z } from "zod";

/**
 * Server-side environment variables schema.
 * Validated at startup — throws a descriptive error if required variables are missing.
 */
const serverSchema = z
  .object({
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    NEXTAUTH_URL: z.string().optional(),
    NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
    R2_ACCOUNT_ID: z.string().min(1, "R2_ACCOUNT_ID is required"),
    R2_ACCESS_KEY_ID: z.string().min(1, "R2_ACCESS_KEY_ID is required"),
    R2_SECRET_ACCESS_KEY: z.string().min(1, "R2_SECRET_ACCESS_KEY is required"),
    R2_BUCKET_NAME: z.string().min(1, "R2_BUCKET_NAME is required"),
    R2_PUBLIC_URL: z.string().min(1, "R2_PUBLIC_URL is required"),
    RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
    CONTACT_EMAIL: z.string().min(1, "CONTACT_EMAIL is required"),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  })
  .refine(
    (data) =>
      data.NODE_ENV !== "production" ||
      (data.NEXTAUTH_URL !== undefined && data.NEXTAUTH_URL.length > 0),
    {
      message: "NEXTAUTH_URL is required in production",
      path: ["NEXTAUTH_URL"],
    }
  );

/**
 * Client-side environment variables schema.
 * These are prefixed with NEXT_PUBLIC_ and available in the browser.
 */
const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
});

/**
 * Server-side environment type (inferred from schema).
 */
export type ServerEnv = z.infer<typeof serverSchema>;

/**
 * Client-side environment type (inferred from schema).
 */
export type ClientEnv = z.infer<typeof clientSchema>;

// Only validate server-side env vars when running on the server.
// This prevents errors during client-side bundle evaluation.
const isServer = typeof window === "undefined";

function validateServerEnv(): ServerEnv {
  const parsed = serverSchema.safeParse(process.env);

  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    const fieldErrors = Object.entries(flattened.fieldErrors)
      .map(([key, messages]) => `  ${key}: ${(messages as string[]).join(", ")}`)
      .join("\n");
    const formErrors =
      flattened.formErrors.length > 0
        ? `  ${(flattened.formErrors as string[]).join(", ")}\n`
        : "";

    throw new Error(
      `❌ Invalid server environment variables:\n${formErrors}${fieldErrors}\n\n` +
        "Please check your .env file and ensure all required variables are set."
    );
  }

  return parsed.data;
}

function validateClientEnv(): ClientEnv {
  const parsed = clientSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });

  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    const errorMessage = Object.entries(flattened.fieldErrors)
      .map(([key, messages]) => `  ${key}: ${(messages as string[]).join(", ")}`)
      .join("\n");

    throw new Error(
      `❌ Invalid client environment variables:\n${errorMessage}`
    );
  }

  return parsed.data;
}

/**
 * Validated server-side environment variables.
 * Access these only in server code (API routes, server components, services).
 */
export const serverEnv: ServerEnv = isServer
  ? validateServerEnv()
  : (undefined as unknown as ServerEnv);

/**
 * Validated client-side environment variables.
 * Safe to use in both server and client code.
 */
export const clientEnv: ClientEnv = validateClientEnv();

/**
 * Combined typed env export for convenience in server code.
 * Contains both server and client env vars when used server-side.
 */
export const env: ServerEnv & ClientEnv = {
  ...clientEnv,
  ...(isServer ? serverEnv : {}),
} as ServerEnv & ClientEnv;
