"use client";

import { Monitor, Moon, Sun } from "lucide-react";

import { AccentColorPreview } from "@/components/admin/accent-color-preview";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** Supported theme modes for the site. */
export type ThemeMode = "light" | "dark" | "system";

interface ThemeModeOption {
  value: ThemeMode;
  label: string;
  icon: typeof Sun;
}

const THEME_MODE_OPTIONS: ThemeModeOption[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export interface ThemeConfiguratorProps {
  /** Currently selected theme mode (light, dark, or system). */
  theme: ThemeMode;
  /** Accent color as a hex string (e.g., "#2563eb"). */
  accentColor: string;
  /** Called when the owner selects a different theme mode. */
  onThemeChange: (theme: ThemeMode) => void;
  /** Called when the owner changes the accent color hex value. */
  onAccentColorChange: (accentColor: string) => void;
  className?: string;
}

/**
 * ThemeConfigurator renders the theme and accent color configuration UI for
 * the CMS site-config page.
 *
 * It owns the presentational concerns — a theme mode selector (light / dark /
 * system), an accent color picker, and a live preview (via
 * {@link AccentColorPreview}) that shows how the accent renders on common UI
 * elements alongside WCAG AA (4.5:1) contrast ratio validation.
 *
 * All state lives in the parent; this component is fully controlled and never
 * performs API or data-access calls directly.
 */
export function ThemeConfigurator({
  theme,
  accentColor,
  onThemeChange,
  onAccentColorChange,
  className,
}: ThemeConfiguratorProps) {
  return (
    <section
      className={cn(
        "space-y-6 rounded-lg border border-border p-6",
        className
      )}
      aria-labelledby="theme-configurator-heading"
    >
      <h2
        id="theme-configurator-heading"
        className="text-xl font-semibold text-foreground"
      >
        Theme Settings
      </h2>

      {/* Theme mode selector */}
      <div className="space-y-2">
        <Label id="theme-mode-label">Theme Mode</Label>
        <div
          role="radiogroup"
          aria-labelledby="theme-mode-label"
          className="inline-flex flex-wrap gap-2"
        >
          {THEME_MODE_OPTIONS.map(({ value, label, icon: Icon }) => {
            const selected = theme === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onThemeChange(value)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  selected
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-input text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          Sets the default appearance. Visitors can still override this with the
          theme toggle, and &quot;System&quot; follows their device preference.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Accent Color Input */}
        <div className="space-y-2">
          <Label htmlFor="accent-color">Accent Color</Label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              id="accent-color-picker"
              value={accentColor}
              onChange={(e) => onAccentColorChange(e.target.value)}
              className="h-9 w-12 cursor-pointer rounded-md border border-input bg-transparent p-0.5"
              aria-label="Pick accent color"
            />
            <Input
              id="accent-color"
              type="text"
              value={accentColor}
              onChange={(e) => onAccentColorChange(e.target.value)}
              placeholder="#2563eb"
              className="max-w-[10rem] font-mono"
              aria-describedby="accent-color-help"
            />
          </div>
          <p id="accent-color-help" className="text-xs text-muted-foreground">
            Choose a hex color for your site&apos;s accent. Used for buttons,
            links, and interactive elements.
          </p>
        </div>

        {/* Live preview + contrast validation */}
        <AccentColorPreview hexColor={accentColor} />
      </div>
    </section>
  );
}
