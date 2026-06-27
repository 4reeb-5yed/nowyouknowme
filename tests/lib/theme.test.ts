import { describe, it, expect } from "vitest";

import { resolveDefaultTheme, VALID_THEMES } from "@/lib/theme";

/**
 * Tests for the configured default-theme resolution used by the root layout.
 *
 * Validates:
 * - Requirement 7.4: system prefers-color-scheme is respected as the default
 *   (the fallback whenever no valid configured theme exists).
 * - The configured default from Site_Config ("light" / "dark" / "system") is
 *   honored when present and valid.
 */
describe("resolveDefaultTheme", () => {
  it("returns each valid configured theme unchanged", () => {
    expect(resolveDefaultTheme("light")).toBe("light");
    expect(resolveDefaultTheme("dark")).toBe("dark");
    expect(resolveDefaultTheme("system")).toBe("system");
  });

  it("falls back to 'system' when no config value exists", () => {
    expect(resolveDefaultTheme(undefined)).toBe("system");
    expect(resolveDefaultTheme(null)).toBe("system");
    expect(resolveDefaultTheme("")).toBe("system");
  });

  it("falls back to 'system' for unrecognized values", () => {
    expect(resolveDefaultTheme("blue")).toBe("system");
    expect(resolveDefaultTheme("Light")).toBe("system"); // case-sensitive
    expect(resolveDefaultTheme("DARK")).toBe("system");
    expect(resolveDefaultTheme("auto")).toBe("system");
  });

  it("only recognizes the three supported theme modes", () => {
    expect(VALID_THEMES).toEqual(["light", "dark", "system"]);
  });
});
