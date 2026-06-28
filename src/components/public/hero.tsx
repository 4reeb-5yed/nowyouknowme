import { ResumeButton } from "@/components/public/resume-button";

export interface HeroProps {
  tagline: string;
  resumeUrl: string | null;
}

/**
 * Hero section for the homepage.
 * Renders a large, centered hero with the tagline from Site_Config
 * and a Download Resume CTA when an active resume is available.
 */
export function Hero({ tagline, resumeUrl }: HeroProps) {
  return (
    <section
      className="relative flex min-h-[60vh] items-center justify-center overflow-hidden px-4 py-20 sm:py-28 md:py-36"
      aria-label="Hero"
    >
      {/* Subtle animated gradient background accent */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-20"
        aria-hidden="true"
      >
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent blur-[120px] motion-safe:animate-pulse" />
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          {tagline}
        </h1>
        <p className="mt-4 text-base text-muted-foreground sm:mt-6 sm:text-lg md:text-xl">
          Explore my work, experience, and what drives me.
        </p>
        {resumeUrl && (
          <div className="mt-8">
            <ResumeButton resumeUrl={resumeUrl} />
          </div>
        )}
      </div>
    </section>
  );
}