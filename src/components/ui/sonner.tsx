"use client";

import { Toaster as SonnerToaster } from "sonner";

/**
 * Toast notification provider component.
 * Renders the sonner Toaster with styling that matches the app's theme.
 * Should be placed in the admin layout to provide toast notifications across all CMS pages.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "group border-border bg-background text-foreground shadow-lg rounded-lg",
          title: "text-sm font-medium",
          description: "text-xs text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground text-xs font-medium",
          cancelButton: "bg-muted text-muted-foreground text-xs font-medium",
          error: "border-destructive/50 bg-destructive/10 text-destructive",
          success:
            "border-green-500/50 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
        },
      }}
      closeButton
      richColors
    />
  );
}
