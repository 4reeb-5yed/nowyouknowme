/**
 * PageTransition wraps page content with smooth entry/exit animations.
 * Respects prefers-reduced-motion for accessibility.
 * Uses fade + slight upward slide for a polished feel.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-400 motion-safe:slide-in-from-bottom-4 motion-safe:fill-mode-both">
      {children}
    </div>
  );
}
