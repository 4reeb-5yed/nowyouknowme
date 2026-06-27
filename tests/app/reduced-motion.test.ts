import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Accessibility verification for Requirement 11.6:
 * "WHILE the Visitor has enabled prefers-reduced-motion, THE Public_Site SHALL
 *  disable all non-essential animations and transitions."
 *
 * These tests guard the global reduced-motion strategy against regression:
 *  1. A `prefers-reduced-motion: reduce` media query neutralizes all
 *     animations and transitions site-wide (with !important so inline,
 *     JS-driven transitions such as dnd-kit's are overridden too).
 *  2. Essential feedback (the loading/submit spinner) is explicitly exempt.
 *  3. Decorative, non-essential animations are gated behind Tailwind's
 *     `motion-safe:` variant so they never run under reduced motion.
 */

const root = join(__dirname, "..", "..");

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

describe("Reduced motion (Requirement 11.6)", () => {
  const globals = read("src/app/globals.css");

  it("defines a prefers-reduced-motion: reduce media query", () => {
    expect(globals).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  });

  it("neutralizes all animations and transitions with !important", () => {
    const block = globals.slice(
      globals.indexOf("@media (prefers-reduced-motion: reduce)")
    );
    // Applies to every element and pseudo-element.
    expect(block).toContain("*,");
    expect(block).toContain("*::before");
    expect(block).toContain("*::after");
    // Both animation and transition durations are collapsed.
    expect(block).toMatch(/animation-duration:\s*0\.01ms\s*!important/);
    expect(block).toMatch(/transition-duration:\s*0\.01ms\s*!important/);
    expect(block).toMatch(/animation-iteration-count:\s*1\s*!important/);
    // Smooth scrolling is also disabled.
    expect(block).toMatch(/scroll-behavior:\s*auto\s*!important/);
  });

  it("keeps the essential feedback spinner running under reduced motion", () => {
    const block = globals.slice(
      globals.indexOf("@media (prefers-reduced-motion: reduce)")
    );
    expect(block).toContain(".animate-spin");
    expect(block).toMatch(/animation-iteration-count:\s*infinite\s*!important/);
  });

  it("gates decorative animations behind the motion-safe variant", () => {
    // Page transition entry animation must only run when motion is allowed.
    const pageTransition = read("src/components/page-transition.tsx");
    expect(pageTransition).toContain("motion-safe:animate-in");

    // Decorative hover scale on public cards is motion-safe only.
    const projectCard = read("src/components/public/project-card.tsx");
    expect(projectCard).toContain("motion-safe:hover:scale-");
    // The thumbnail zoom-on-hover is also gated behind motion-safe.
    expect(projectCard).toContain("motion-safe:group-hover:scale-");
    expect(projectCard).not.toMatch(/[^:]group-hover:scale-/);

    const certificationCard = read(
      "src/components/public/certification-card.tsx"
    );
    expect(certificationCard).toContain("motion-safe:hover:scale-");

    // Decorative hero pulse is motion-safe only.
    const hero = read("src/components/public/hero.tsx");
    expect(hero).toContain("motion-safe:animate-pulse");
  });
});
