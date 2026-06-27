"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface AccentColorPreviewProps {
  /** Hex color value (e.g., "#2563eb") */
  hexColor: string;
  className?: string;
}

/** Light and dark background colors used for contrast checking */
const LIGHT_BACKGROUND = "#ffffff";
const DARK_BACKGROUND = "#0a0a0a";
const WCAG_AA_RATIO = 4.5;

/**
 * Converts a hex color string to RGB values.
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.replace(/^#/, "");
  if (cleaned.length !== 6 && cleaned.length !== 3) return null;

  const fullHex =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;

  const num = parseInt(fullHex, 16);
  if (isNaN(num)) return null;

  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Converts sRGB to linear RGB (removes gamma correction).
 */
function srgbToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/**
 * Converts linear RGB to OKLab color space.
 * Based on the OKLab specification by Björn Ottosson.
 */
function linearRgbToOklab(r: number, g: number, b: number) {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  return {
    L: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  };
}

/**
 * Converts OKLab to OKLCH (lightness, chroma, hue).
 */
function oklabToOklch(L: number, a: number, b: number) {
  const C = Math.sqrt(a * a + b * b);
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { L, C, h };
}

/**
 * Converts a hex color to an oklch() CSS string.
 */
function hexToOklch(hex: string): string | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  const lr = srgbToLinear(rgb.r);
  const lg = srgbToLinear(rgb.g);
  const lb = srgbToLinear(rgb.b);

  const { L, a, b } = linearRgbToOklab(lr, lg, lb);
  const { C, h } = oklabToOklch(L, a, b);

  // Round to 3 decimal places for readable output
  const lRound = Math.round(L * 1000) / 1000;
  const cRound = Math.round(C * 1000) / 1000;
  const hRound = Math.round(h * 1000) / 1000;

  return `oklch(${lRound} ${cRound} ${hRound})`;
}

/**
 * Computes a suitable foreground color (white or black) for the given accent,
 * based on perceived luminance of the hex color.
 */
function computeForegroundOklch(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "oklch(0.985 0 0)"; // default white

  // Relative luminance calculation (WCAG)
  const lr = srgbToLinear(rgb.r);
  const lg = srgbToLinear(rgb.g);
  const lb = srgbToLinear(rgb.b);
  const luminance = 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;

  // If the accent is dark, use white foreground; otherwise black
  return luminance > 0.4 ? "oklch(0.145 0 0)" : "oklch(0.985 0 0)";
}

/**
 * Validates whether a string is a valid hex color.
 */
function isValidHex(hex: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);
}

/**
 * Computes the relative luminance of a hex color per WCAG 2.1 definition.
 * Returns a value between 0 (darkest) and 1 (lightest).
 */
function getRelativeLuminance(hex: string): number | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  const lr = srgbToLinear(rgb.r);
  const lg = srgbToLinear(rgb.g);
  const lb = srgbToLinear(rgb.b);

  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

/**
 * Computes the WCAG contrast ratio between two colors.
 * Formula: (L1 + 0.05) / (L2 + 0.05) where L1 is the lighter luminance.
 * Returns a value >= 1 (1:1 means identical colors, 21:1 is max contrast).
 */
export function getContrastRatio(hex1: string, hex2: string): number | null {
  const lum1 = getRelativeLuminance(hex1);
  const lum2 = getRelativeLuminance(hex2);

  if (lum1 === null || lum2 === null) return null;

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

interface ContrastResult {
  lightRatio: number | null;
  darkRatio: number | null;
  lightPasses: boolean;
  darkPasses: boolean;
}

/**
 * Computes contrast ratios against both light and dark backgrounds.
 */
function computeContrastResults(hex: string): ContrastResult {
  const lightRatio = getContrastRatio(hex, LIGHT_BACKGROUND);
  const darkRatio = getContrastRatio(hex, DARK_BACKGROUND);

  return {
    lightRatio,
    darkRatio,
    lightPasses: lightRatio !== null && lightRatio >= WCAG_AA_RATIO,
    darkPasses: darkRatio !== null && darkRatio >= WCAG_AA_RATIO,
  };
}

/**
 * Formats a contrast ratio for display (e.g., "5.23:1").
 */
function formatRatio(ratio: number | null): string {
  if (ratio === null) return "—";
  return `${ratio.toFixed(2)}:1`;
}

/**
 * ContrastChecker displays WCAG contrast ratio information for the
 * accent color against both light and dark backgrounds, warning the
 * user when the minimum 4.5:1 ratio is not met.
 */
function ContrastChecker({ hexColor }: { hexColor: string }) {
  const results = useMemo(() => {
    if (!isValidHex(hexColor)) return null;
    return computeContrastResults(hexColor);
  }, [hexColor]);

  if (!results) return null;

  const { lightRatio, darkRatio, lightPasses, darkPasses } = results;
  const allPass = lightPasses && darkPasses;

  return (
    <div className="space-y-3" role="region" aria-label="Contrast ratio information">
      {/* Contrast ratios display */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Contrast Ratios
        </p>
        <div className="flex flex-wrap gap-3">
          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium",
              lightPasses
                ? "bg-green-500/10 text-green-700 dark:text-green-400"
                : "bg-destructive/10 text-destructive"
            )}
          >
            <span
              className={cn(
                "size-2 rounded-full",
                lightPasses ? "bg-green-500" : "bg-destructive"
              )}
              aria-hidden="true"
            />
            <span>Light: {formatRatio(lightRatio)}</span>
            <span aria-label={lightPasses ? "passes" : "fails"}>
              {lightPasses ? "✓" : "✗"}
            </span>
          </div>

          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium",
              darkPasses
                ? "bg-green-500/10 text-green-700 dark:text-green-400"
                : "bg-destructive/10 text-destructive"
            )}
          >
            <span
              className={cn(
                "size-2 rounded-full",
                darkPasses ? "bg-green-500" : "bg-destructive"
              )}
              aria-hidden="true"
            />
            <span>Dark: {formatRatio(darkRatio)}</span>
            <span aria-label={darkPasses ? "passes" : "fails"}>
              {darkPasses ? "✓" : "✗"}
            </span>
          </div>
        </div>
      </div>

      {/* Warning message when contrast is insufficient */}
      {!allPass && (
        <div
          className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2"
          role="alert"
        >
          <p className="text-xs font-medium text-destructive">
            Warning: This color may not meet WCAG AA contrast requirements on{" "}
            {!lightPasses && !darkPasses
              ? "light and dark"
              : !lightPasses
              ? "light"
              : "dark"}{" "}
            backgrounds.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Minimum ratio of 4.5:1 is required for normal text (WCAG AA).
          </p>
        </div>
      )}

      {/* Success indicator */}
      {allPass && (
        <div className="rounded-md border border-green-500/30 bg-green-500/5 px-3 py-2">
          <p className="text-xs font-medium text-green-700 dark:text-green-400">
            ✓ Meets WCAG AA contrast requirements on both backgrounds.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * AccentColorPreview provides a live preview of how the accent color
 * will look on various UI elements (buttons, links, badges).
 *
 * It overrides CSS custom properties within a scoped container so the
 * preview doesn't affect the rest of the page and cleans up on unmount.
 */
export function AccentColorPreview({ hexColor, className }: AccentColorPreviewProps) {
  const previewStyles = useMemo(() => {
    if (!isValidHex(hexColor)) return null;

    const oklchValue = hexToOklch(hexColor);
    if (!oklchValue) return null;

    const foreground = computeForegroundOklch(hexColor);

    return {
      "--accent": oklchValue,
      "--accent-foreground": foreground,
      "--ring": oklchValue,
    } as React.CSSProperties;
  }, [hexColor]);

  const valid = isValidHex(hexColor);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium text-foreground">Live Preview</h3>
        {!valid && hexColor.length > 0 && (
          <span className="text-xs text-destructive">Invalid hex color</span>
        )}
      </div>

      <div
        className="rounded-lg border border-border bg-card p-6 space-y-6"
        style={previewStyles ?? undefined}
      >
        {/* Color swatch */}
        <div className="flex items-center gap-3">
          <div
            className="size-10 rounded-lg border border-border shadow-sm"
            style={{ backgroundColor: valid ? hexColor : undefined }}
          />
          <div>
            <p className="text-sm font-medium text-foreground">
              {valid ? hexColor.toUpperCase() : "—"}
            </p>
            <p className="text-xs text-muted-foreground">Accent color</p>
          </div>
        </div>

        {/* Sample buttons */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Buttons
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="inline-flex h-8 items-center justify-center rounded-lg bg-accent px-3 text-sm font-medium text-accent-foreground transition-colors hover:opacity-90"
            >
              Primary Action
            </button>
            <button
              type="button"
              className="inline-flex h-8 items-center justify-center rounded-lg border border-accent bg-transparent px-3 text-sm font-medium text-accent transition-colors hover:bg-accent/10"
            >
              Outline
            </button>
            <button
              type="button"
              className="inline-flex h-8 items-center justify-center rounded-lg bg-accent/10 px-3 text-sm font-medium text-accent transition-colors hover:bg-accent/20"
            >
              Ghost
            </button>
          </div>
        </div>

        {/* Sample links */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Links
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-accent underline underline-offset-4 cursor-pointer">
              View project details
            </span>
            <span className="text-sm text-accent cursor-pointer hover:underline">
              Learn more →
            </span>
          </div>
        </div>

        {/* Sample badges */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Badges & Tags
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
              Featured
            </span>
            <span className="inline-flex items-center rounded-md bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
              TypeScript
            </span>
            <span className="inline-flex items-center rounded-md border border-accent/30 px-2 py-0.5 text-xs font-medium text-accent">
              Next.js
            </span>
          </div>
        </div>

        {/* Sample focus ring */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Focus Ring
          </p>
          <div className="flex items-center gap-3">
            <div className="inline-flex h-8 items-center justify-center rounded-lg border border-accent bg-transparent px-3 text-sm font-medium text-accent ring-2 ring-accent/50 ring-offset-2 ring-offset-background">
              Focused element
            </div>
          </div>
        </div>
      </div>

      {/* Contrast ratio checker */}
      {valid && <ContrastChecker hexColor={hexColor} />}

      {!valid && (
        <p className="text-xs text-muted-foreground">
          Enter a valid hex color (e.g., #2563eb) to see the preview.
        </p>
      )}
    </div>
  );
}
