"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import {
  Loader2,
  Save,
  Star,
  Eye,
  EyeOff,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Globe,
  Palette,
  Layout,
  Type,
  Image,
  MessageSquare,
  User,
  Code2,
  Mail,
  Layers,
} from "lucide-react";

// --- Types ---

interface SiteSettings {
  // Hero
  heroTagline: string;
  heroHeadline: string;
  heroEmphasisWord: string;
  heroSubhead: string;
  heroShowResume: boolean;
  
  // Section Visibility
  showFeaturedProjects: boolean;
  showExperience: boolean;
  showSkills: boolean;
  showAbout: boolean;
  showContact: boolean;
  
  // SEO
  metaDescription: string;
  
  // Footer
  footerCopyright: string;
  footerTagline: string;
  
  // Section Order
  sectionOrder: string[];
}

// Default values
const DEFAULT_SETTINGS: SiteSettings = {
  heroTagline: "SOFTWARE ENGINEER",
  heroHeadline: "I build software that works.",
  heroEmphasisWord: "works",
  heroSubhead: "",
  heroShowResume: true,
  showFeaturedProjects: true,
  showExperience: true,
  showSkills: true,
  showAbout: true,
  showContact: true,
  metaDescription: "",
  footerCopyright: "",
  footerTagline: "Built with passion.",
  sectionOrder: ["hero", "featured-projects", "experience", "skills", "about", "contact"],
};

// Section info for UI
const SECTIONS = [
  { key: "hero", label: "Hero", icon: Star, description: "Main headline and tagline" },
  { key: "featured-projects", label: "Featured Projects", icon: Layout, description: "Portfolio showcase" },
  { key: "experience", label: "Experience", icon: User, description: "Work history timeline" },
  { key: "skills", label: "Skills", icon: Code2, description: "Technical skills" },
  { key: "about", label: "About", icon: User, description: "About section" },
  { key: "contact", label: "Contact", icon: Mail, description: "Contact form" },
] as const;

// --- Component ---

export default function SiteSettingsPage() {
  const utils = trpc.useUtils();
  
  // Fetch current settings
  const { data: config, isLoading } = trpc.siteConfig.get.useQuery();
  
  // Settings state
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving">("idle");
  
  // Sync with fetched config
  useEffect(() => {
    if (config) {
      setSettings({
        heroTagline: config.heroTagline ?? DEFAULT_SETTINGS.heroTagline,
        heroHeadline: config.heroHeadline ?? DEFAULT_SETTINGS.heroHeadline,
        heroEmphasisWord: config.heroEmphasisWord ?? DEFAULT_SETTINGS.heroEmphasisWord,
        heroSubhead: config.heroSubhead ?? DEFAULT_SETTINGS.heroSubhead,
        heroShowResume: config.heroShowResume ?? DEFAULT_SETTINGS.heroShowResume,
        showFeaturedProjects: config.showFeaturedProjects ?? DEFAULT_SETTINGS.showFeaturedProjects,
        showExperience: config.showExperience ?? DEFAULT_SETTINGS.showExperience,
        showSkills: config.showSkills ?? DEFAULT_SETTINGS.showSkills,
        showAbout: config.showAbout ?? DEFAULT_SETTINGS.showAbout,
        showContact: config.showContact ?? DEFAULT_SETTINGS.showContact,
        metaDescription: config.metaDescription ?? DEFAULT_SETTINGS.metaDescription,
        footerCopyright: config.footerCopyright ?? DEFAULT_SETTINGS.footerCopyright,
        footerTagline: config.footerTagline ?? DEFAULT_SETTINGS.footerTagline,
        sectionOrder: config.sectionOrder ?? DEFAULT_SETTINGS.sectionOrder,
      });
    }
  }, [config]);
  
  // Update mutation
  const updateMutation = trpc.siteConfig.update.useMutation({
    onSuccess: () => {
      setSaveStatus("idle");
      utils.siteConfig.get.invalidate();
      toast.success("Settings saved successfully");
    },
    onError: (err) => {
      setSaveStatus("idle");
      toast.error("Failed to save settings", { description: err.message });
    },
  });
  
  // Save handler
  const handleSave = useCallback(() => {
    setSaveStatus("saving");
    updateMutation.mutate(settings);
  }, [settings, updateMutation]);
  
  // Update a specific field
  const updateField = <K extends keyof SiteSettings>(
    key: K,
    value: SiteSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };
  
  // Move section up/down
  const moveSection = (index: number, direction: "up" | "down") => {
    const newOrder = [...settings.sectionOrder];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setSettings((prev) => ({ ...prev, sectionOrder: newOrder }));
  };
  
  // Toggle section visibility
  const toggleSection = (key: keyof Omit<SiteSettings, "sectionOrder">) => {
    if (typeof settings[key] === "boolean") {
      updateField(key, !settings[key]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your public website content and configuration
          </p>
        </div>
        <Button onClick={handleSave} disabled={saveStatus === "saving"}>
          {saveStatus === "saving" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Hero Section */}
      <section className="rounded-lg border bg-card">
        <div className="flex items-center gap-3 border-b px-6 py-4">
          <Star className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-semibold">Hero Section</h2>
            <p className="text-sm text-muted-foreground">Main headline and tagline</p>
          </div>
        </div>
        <div className="space-y-4 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="heroTagline">Tagline</Label>
              <Input
                id="heroTagline"
                value={settings.heroTagline}
                onChange={(e) => updateField("heroTagline", e.target.value)}
                placeholder="SOFTWARE ENGINEER"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroEmphasisWord">Emphasis Word</Label>
              <Input
                id="heroEmphasisWord"
                value={settings.heroEmphasisWord}
                onChange={(e) => updateField("heroEmphasisWord", e.target.value)}
                placeholder="works"
              />
              <p className="text-xs text-muted-foreground">
                Word highlighted in the headline
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="heroHeadline">Headline</Label>
            <Input
              id="heroHeadline"
              value={settings.heroHeadline}
              onChange={(e) => updateField("heroHeadline", e.target.value)}
              placeholder="I build software that works."
            />
            <p className="text-xs text-muted-foreground">
              Use {"{word}"} syntax to highlight the emphasis word
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="heroSubhead">Subheadline</Label>
            <Textarea
              id="heroSubhead"
              value={settings.heroSubhead}
              onChange={(e) => updateField("heroSubhead", e.target.value)}
              placeholder="Your subheadline text..."
              rows={3}
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="heroShowResume"
              checked={settings.heroShowResume}
              onCheckedChange={(checked) => updateField("heroShowResume", checked)}
            />
            <Label htmlFor="heroShowResume">Show Resume button in Hero</Label>
          </div>
        </div>
      </section>

      {/* Homepage Sections */}
      <section className="rounded-lg border bg-card">
        <div className="flex items-center gap-3 border-b px-6 py-4">
          <Layout className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-semibold">Homepage Sections</h2>
            <p className="text-sm text-muted-foreground">
              Control which sections appear on your homepage
            </p>
          </div>
        </div>
        <div className="space-y-4 p-6">
          {/* Section Visibility Toggles */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Section Visibility</Label>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                { key: "showFeaturedProjects" as const, label: "Featured Projects", desc: "Show projects on homepage" },
                { key: "showExperience" as const, label: "Experience", desc: "Show work experience" },
                { key: "showSkills" as const, label: "Skills", desc: "Show skills section" },
                { key: "showAbout" as const, label: "About", desc: "Show about section" },
                { key: "showContact" as const, label: "Contact", desc: "Show contact section" },
              ].map((section) => (
                <div key={section.key} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{section.label}</p>
                    <p className="text-xs text-muted-foreground">{section.desc}</p>
                  </div>
                  <Switch
                    checked={settings[section.key] as boolean}
                    onCheckedChange={() => toggleSection(section.key)}
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Section Order */}
          <div className="space-y-3 pt-4 border-t">
            <Label className="text-sm font-medium">Section Order</Label>
            <p className="text-xs text-muted-foreground">
              Drag sections or use arrows to reorder them on the homepage
            </p>
            <div className="space-y-2">
              {settings.sectionOrder.map((sectionKey, index) => {
                const section = SECTIONS.find((s) => s.key === sectionKey);
                if (!section) return null;
                const Icon = section.icon;
                return (
                  <div
                    key={section.key}
                    className="flex items-center gap-3 rounded-lg border bg-background p-3"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 text-sm font-medium">{section.label}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveSection(index, "up")}
                      disabled={index === 0}
                      className="h-8 w-8"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveSection(index, "down")}
                      disabled={index === settings.sectionOrder.length - 1}
                      className="h-8 w-8"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* SEO Section */}
      <section className="rounded-lg border bg-card">
        <div className="flex items-center gap-3 border-b px-6 py-4">
          <Globe className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-semibold">SEO</h2>
            <p className="text-sm text-muted-foreground">
              Search engine optimization settings
            </p>
          </div>
        </div>
        <div className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Textarea
              id="metaDescription"
              value={settings.metaDescription}
              onChange={(e) => updateField("metaDescription", e.target.value)}
              placeholder="A brief description of your site for search engines..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {settings.metaDescription.length}/500 characters
            </p>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <section className="rounded-lg border bg-card">
        <div className="flex items-center gap-3 border-b px-6 py-4">
          <Layers className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-semibold">Footer</h2>
            <p className="text-sm text-muted-foreground">
              Footer content and copyright
            </p>
          </div>
        </div>
        <div className="space-y-4 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="footerTagline">Tagline</Label>
              <Input
                id="footerTagline"
                value={settings.footerTagline}
                onChange={(e) => updateField("footerTagline", e.target.value)}
                placeholder="Built with passion."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="footerCopyright">Copyright Text</Label>
              <Input
                id="footerCopyright"
                value={settings.footerCopyright}
                onChange={(e) => updateField("footerCopyright", e.target.value)}
                placeholder="© 2024 Your Name. All rights reserved."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Save Button (Bottom) */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saveStatus === "saving"} size="lg">
          {saveStatus === "saving" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save All Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
