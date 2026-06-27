"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error — in production this would go to a monitoring service
    console.error("[Admin Page Error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-8 max-w-md w-full">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" aria-hidden="true" />
        <h2 className="text-xl font-semibold mb-2">Dashboard Error</h2>
        <p className="text-muted-foreground mb-6">
          Something went wrong while loading this section. Your data is safe —
          try refreshing the page.
        </p>
        <Button onClick={reset} variant="default">
          Try again
        </Button>
      </div>
    </div>
  );
}
