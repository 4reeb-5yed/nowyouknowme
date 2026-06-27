"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import {
  ThemeConfigurator,
  type ThemeMode,
} from "@/components/admin/theme-configurator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";

const DEFAULT_ACCENT = "#2563eb";

export default function SiteConfigPage() {
  const [theme, setTheme] = useState<ThemeMode>("system");
  const [accentColor, setAccentColor] = useState(DEFAULT_ACCENT);
  const [heroTagline, setHeroTagline] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");

  // Fetch current config
  const { data: config, isLoading, isError, error } = trpc.siteConfig.get.useQuery();

  // Seed form from fetched data
  useEffect(() => {
    if (config) {
      setTheme((config.theme as ThemeMode) ?? "system");
      setAccentColor(config.accentColor ?? DEFAULT_ACCENT);
      setHeroTagline(config.heroTagline ?? "");
      setMetaDescription(config.metaDescription ?? "");
      setOgImageUrl(config.ogImageUrl ?? "");
    }
  }, [config]);

  // Update mutation
  const utils = trpc.useUtils();
  const updateMutation = trpc.siteConfig.update.useMutation({
    onSuccess: () => {
      utils.siteConfig.get.invalidate();
      toast.success("Site configuration saved successfully");
    },
    onError: (err) => {
      toast.error("Failed to save site configuration", {
        description: err.message,
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      theme,
      accentColor,
      heroTagline,
      metaDescription,
      ogImageUrl: ogImageUrl.trim() || null,
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden="true" />
        <p className="mt-3 text-sm text-muted-foreground">Loading site configuration...</p>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-sm font-medium text-destructive">
          Failed to load site configuration
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {error?.message ?? "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Site Config
          </h1>
          <p className="mt-2 text-muted-foreground">
            Configure your site theme, accent color, SEO metadata, and other global
            settings.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              <span className="ml-1">Saving...</span>
            </>
          ) : (
            <>
              <Save className="size-4" aria-hidden="true" />
              <span className="ml-1">Save Changes</span>
            </>
          )}
        </Button>
      </div>

      {/* Theme Settings Section */}
      <ThemeConfigurator
        theme={theme}
        accentColor={accentColor}
        onThemeChange={setTheme}
        onAccentColorChange={setAccentColor}
      />

      {/* Content Section */}
      <section className="space-y-6 rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-foreground">Content</h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hero-tagline">Hero Tagline</Label>
            <Input
              id="hero-tagline"
              type="text"
              value={heroTagline}
              onChange={(e) => setHeroTagline(e.target.value)}
              placeholder="Your hero section tagline..."
            />
            <p className="text-xs text-muted-foreground">
              The tagline displayed in the hero section of your homepage.
            </p>
          </div>
        </div>
      </section>

      {/* SEO Section */}
      <section className="space-y-6 rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-foreground">SEO Settings</h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meta-description">Meta Description</Label>
            <Textarea
              id="meta-description"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="A brief description of your site for search engines..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Displayed in search engine results. Recommended 150-160 characters.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="og-image-url">OG Image URL</Label>
            <Input
              id="og-image-url"
              type="url"
              value={ogImageUrl}
              onChange={(e) => setOgImageUrl(e.target.value)}
              placeholder="https://example.com/og-image.png"
            />
            <p className="text-xs text-muted-foreground">
              The image displayed when your site is shared on social media.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
