/**
 * PageTransition wraps page content with a subtle entry animation.
 * Uses Tailwind's motion-safe variant so animations are only applied
 * when the user has NOT enabled prefers-reduced-motion.
 *
 * The component uses tw-animate-css's `animate-in` + `fade-in` utilities
 * for a lightweight opacity fade on page navigation.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300 motion-safe:fill-mode-both">
      {children}
    </div>
  );
}
