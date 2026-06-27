"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Client-side validation schema
const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type FieldErrors = Partial<Record<keyof LoginFormData, string>>;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setServerError("");

    // Client-side validation
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const errors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof LoginFormData;
        if (!errors[field]) {
          errors[field] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await signIn("credentials", {
        email: result.data.email,
        password: result.data.password,
        redirect: false,
        callbackUrl: "/admin/dashboard",
      });

      if (response?.error) {
        // Generic error message — never reveal which field was wrong
        setServerError("Invalid email or password");
      } else if (response?.url) {
        // Redirect on success
        window.location.href = response.url;
      }
    } catch {
      setServerError("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Card container */}
        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-card-foreground">
              Admin Login
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to manage your portfolio
            </p>
          </div>

          {/* Server error alert */}
          {serverError && (
            <div
              role="alert"
              aria-live="assertive"
              className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {serverError}
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email field */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-card-foreground"
              >
                Email
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!fieldErrors.email}
                aria-describedby={
                  fieldErrors.email ? "login-email-error" : undefined
                }
                disabled={isLoading}
                className={cn(
                  "block w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground",
                  "placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  fieldErrors.email
                    ? "border-destructive focus:ring-destructive/30"
                    : "border-input"
                )}
                placeholder="you@example.com"
              />
              {fieldErrors.email && (
                <p
                  id="login-email-error"
                  role="alert"
                  className="text-xs text-destructive"
                >
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-card-foreground"
              >
                Password
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!fieldErrors.password}
                aria-describedby={
                  fieldErrors.password ? "login-password-error" : undefined
                }
                disabled={isLoading}
                className={cn(
                  "block w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground",
                  "placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  fieldErrors.password
                    ? "border-destructive focus:ring-destructive/30"
                    : "border-input"
                )}
                placeholder="Enter your password"
              />
              {fieldErrors.password && (
                <p
                  id="login-password-error"
                  role="alert"
                  className="text-xs text-destructive"
                >
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
