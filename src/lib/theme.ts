/**
 * Theme resolution helpers shared by the root layout and the theme system.
 *
 * The site supports three theme modes that can be set as the configured
 * default in Site_Config:
 * - "light"  — force light mode as the default
 * - "dark"   — force dark mode as the default
 * - "system" — follow the visitor's prefers-color-scheme (the safe fallback)
 *
 * The configured default only applies to visitors who have not made a manual
 * choice. next-themes lets visitors override it via the theme toggle and
 * persists that choice in localStorage (storage key "theme").
 */

/** Theme modes the site supports as a configured default. */
export const VALID_THEMES = ["light", "dark", "system"] as const;

export type ThemeMode = (typeof VALID_THEMES)[number];

/**
 * Resolves the configured default theme from Site_Config, falling back to
 * "system" when no config row exists or the stored value is unrecognized.
 *
 * Falling back to "system" guarantees Requirement 7.4: the visitor's
 * system-level prefers-color-scheme preference is respected as the default.
 */
export function resolveDefaultTheme(theme: string | undefined | null): ThemeMode {
  return VALID_THEMES.includes(theme as ThemeMode)
    ? (theme as ThemeMode)
    : "system";
}
