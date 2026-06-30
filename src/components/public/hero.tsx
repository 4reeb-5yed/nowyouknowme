"use client";

import Link from "next/link";
import { ResumeButton } from "@/components/public/resume-button";
import { ChevronDown } from "lucide-react";

export interface HeroProps {
  tagline: string;
  resumeUrl: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  email?: string | null;
}

/**
 * Clean, minimal hero section.
 * - Static tagline (no distracting animations)
 * - Single primary CTA (not multiple competing buttons)
 * - Simple social links
 * - Focus on content, not decoration
 */
export function Hero({ tagline, resumeUrl, githubUrl, linkedinUrl, email }: HeroProps) {
  // Determine primary CTA - prioritize resume download if available
  const hasResume = !!resumeUrl;
  const primaryCta = hasResume 
    ? { label: "Download Resume", href: resumeUrl, isButton: true, isResume: true }
    : { label: "Get in touch", href: "/contact", isButton: true, isResume: false };

  return (
    <section
      className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-4"
      aria-label="Hero"
    >
      {/* Animated background */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        {/* Main gradient orbs with animations */}
        <div className="absolute left-1/4 top-1/3 -translate-y-1/2 h-[50vmin] w-[50vmin] rounded-full aurora gradient-wave" />
        <div className="absolute right-1/4 bottom-1/3 translate-y-1/2 h-[40vmin] w-[40vmin] rounded-full aurora gradient-wave" />
        
        {/* Floating particles */}
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        
        {/* Subtle dot grid overlay */}
        <div className="absolute inset-0 bg-dots opacity-[0.02] dark:opacity-[0.03]" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-2xl text-center">
        {/* Tagline - Static, clear, no animation */}
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
          <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
            {tagline}
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mt-4 text-base text-muted-foreground sm:text-lg max-w-lg mx-auto">
          Building secure, scalable solutions with expertise in cybersecurity, cloud infrastructure, and web development.
        </p>

        {/* Single Primary CTA */}
        <div className="mt-8">
          {primaryCta.isResume ? (
            <ResumeButton resumeUrl={primaryCta.href} className="px-8 py-3 text-base" />
          ) : (
            <Link
              href={primaryCta.href}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-base font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {primaryCta.label}
            </Link>
          )}
        </div>

        {/* Simple Social Links - Icon only on mobile */}
        <div className="mt-6 flex items-center justify-center gap-1">
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="GitHub"
              title="GitHub"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          )}
          {linkedinUrl && (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="LinkedIn"
              title="LinkedIn"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          )}
          {email && (
            <a
              href={`mailto:${email}`}
              className="inline-flex items-center justify-center rounded-lg p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Email"
              title="Send email"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </a>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground/50 hover:text-muted-foreground transition-colors animate-bounce-slow"
        aria-label="Scroll to content"
      >
        <span className="text-[10px] font-medium uppercase tracking-widest">Explore</span>
        <ChevronDown className="h-4 w-4" />
      </button>
    </section>
  );
}