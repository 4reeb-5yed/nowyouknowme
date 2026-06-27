import { getConfig } from "@/server/services/site-config.service";

/**
 * Computes relative luminance of a hex color using the sRGB formula.
 * Used to determine if the foreground text should be white or black.
 */
function getRelativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Determines the best foreground color (white or black) for a given background hex color.
 * Uses WCAG contrast ratio guidelines — returns white for dark accents, black for light accents.
 */
function getAccentForeground(hex: string): string {
  const luminance = getRelativeLuminance(hex);
  // WCAG recommends 4.5:1 for normal text.
  // Luminance threshold of 0.179 is the crossover point where
  // white text on the color achieves better contrast than black text.
  return luminance > 0.179 ? "#000000" : "#ffffff";
}

/**
 * Converts a hex color to an oklch-compatible CSS color string.
 * We use the CSS color() function with sRGB values so the browser can
 * interpolate it with oklch-based variables seamlessly.
 */
function hexToOklchCompatible(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  // Use the color() function with srgb color space for modern browser compatibility
  // This allows seamless use alongside oklch values in the theme
  return `color(srgb ${r.toFixed(4)} ${g.toFixed(4)} ${b.toFixed(4)})`;
}

/**
 * Server component that fetches the site accent color from the database
 * and injects it as CSS custom properties at the :root level.
 *
 * This enables runtime theming — when the Owner updates the accent color
 * in the CMS, ISR regenerates the page with the new value (no rebuild needed).
 */
export async function ThemeInjector() {
  const config = await getConfig();

  // Fall back to the default accent if no config exists yet
  const accentColor = config?.accentColor ?? "#2563eb";
  const foregroundColor = getAccentForeground(accentColor);

  const accentCss = hexToOklchCompatible(accentColor);
  const foregroundCss = hexToOklchCompatible(foregroundColor);

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `:root{--accent:${accentCss};--accent-foreground:${foregroundCss};--ring:${accentCss}}.dark{--accent:${accentCss};--accent-foreground:${foregroundCss};--ring:${accentCss}}`,
      }}
    />
  );
}
