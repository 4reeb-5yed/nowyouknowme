"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  Maximize2,
  Minimize2,
  RefreshCw,
  ExternalLink,
  X,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DeviceType = "desktop" | "tablet" | "mobile";

interface LivePreviewProps {
  /** The URL to preview */
  url: string;
  /** Whether the preview is active */
  isActive: boolean;
  /** Callback when preview is closed */
  onClose: () => void;
  /** Refresh the preview (called when content changes) */
  onRefresh?: () => void;
  /** Custom className for the preview container */
  className?: string;
}

export function LivePreview({
  url,
  isActive,
  onClose,
  onRefresh,
  className,
}: LivePreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [isLoading, setIsLoading] = useState(false);
  const [key, setKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setKey((k) => k + 1);
    onRefresh?.();
    setTimeout(() => setIsLoading(false), 500);
  }, [onRefresh]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // R to refresh
      if (e.key === "r" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleRefresh();
      }
      // Escape to close
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isActive, handleRefresh, onClose]);

  // Device widths
  const deviceWidths: Record<DeviceType, number> = {
    desktop: 100,
    tablet: 768,
    mobile: 375,
  };

  const currentWidth = deviceWidths[device];

  if (!isActive) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col bg-background",
        isFullscreen ? "" : "m-4 rounded-xl border shadow-2xl",
        className
      )}
    >
      {/* Preview Header */}
      <div className="flex items-center justify-between border-b bg-background px-4 py-3">
        <div className="flex items-center gap-3">
          <Eye className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <span className="font-medium">Live Preview</span>
          {isLoading && (
            <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />
          )}
        </div>

        {/* Device Selector */}
        <div className="flex items-center gap-1 rounded-lg border p-1">
          <button
            onClick={() => setDevice("desktop")}
            className={cn(
              "flex items-center gap-1 rounded-md px-2 py-1 text-sm transition-colors",
              device === "desktop"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
            title="Desktop view"
          >
            <Monitor className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            onClick={() => setDevice("tablet")}
            className={cn(
              "flex items-center gap-1 rounded-md px-2 py-1 text-sm transition-colors",
              device === "tablet"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
            title="Tablet view"
          >
            <Tablet className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={cn(
              "flex items-center gap-1 rounded-md px-2 py-1 text-sm transition-colors",
              device === "mobile"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
            title="Mobile view"
          >
            <Smartphone className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleRefresh}>
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} aria-hidden="true" />
            <span className="ml-1">Refresh</span>
            <kbd className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs">R</kbd>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Maximize2 className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Open</span>
          </a>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto bg-muted/30 p-4">
        <div className="mx-auto h-full transition-all duration-300 ease-in-out">
          <div
            className={cn(
              "h-full rounded-lg border bg-background shadow-lg overflow-hidden transition-all duration-300",
              device === "mobile" && "max-w-[375px] mx-auto rounded-3xl",
              device === "tablet" && "max-w-[768px] mx-auto rounded-xl",
              device === "desktop" && "w-full"
            )}
            style={{
              height: device === "mobile" ? "667px" : device === "tablet" ? "1024px" : "100%",
              minHeight: device === "desktop" ? "600px" : undefined,
            }}
          >
            <iframe
              ref={iframeRef}
              key={key}
              src={url}
              className="h-full w-full border-0"
              title="Live Preview"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* Preview Footer */}
      <div className="border-t bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>Preview URL: {url}</span>
          <span>Press <kbd className="rounded bg-muted px-1">R</kbd> to refresh · <kbd className="rounded bg-muted px-1">Esc</kbd> to close</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook for managing live preview state and URL generation
 */
export function useLivePreview(baseUrl: string = "/") {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  const openPreview = useCallback(() => {
    setPreviewKey((k) => k + 1);
    setIsPreviewOpen(true);
  }, []);

  const closePreview = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  const refreshPreview = useCallback(() => {
    setPreviewKey((k) => k + 1);
  }, []);

  const generatePreviewUrl = useCallback(
    (params?: Record<string, string>) => {
      const url = new URL(baseUrl, "http://localhost:3000");
      url.searchParams.set("preview", "true");
      url.searchParams.set("v", String(previewKey));
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.set(key, value);
        });
      }
      return url.toString();
    },
    [baseUrl, previewKey]
  );

  return {
    isPreviewOpen,
    previewKey,
    openPreview,
    closePreview,
    refreshPreview,
    generatePreviewUrl,
  };
}
