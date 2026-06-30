"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ResumeButton } from "@/components/public/resume-button";
import { cn } from "@/lib/utils";
import { ChevronDown, Sparkles, Shield, Cloud, Code } from "lucide-react";

export interface HeroProps {
  tagline: string;
  resumeUrl: string | null;
}

/**
 * Premium Hero section with typing animation, floating icons, and animated background.
 * Performance-optimized with CSS animations and will-change hints.
 */
export function Hero({ tagline, resumeUrl }: HeroProps) {
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const fullText = tagline;
  const typingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let charIndex = 0;
    const typeText = () => {
      if (charIndex < fullText.length) {
        setTypedText(fullText.slice(0, charIndex + 1));
        charIndex++;
        typingRef.current = setTimeout(typeText, 50 + Math.random() * 30);
      } else {
        setIsTyping(false);
        setTimeout(() => {
          setTypedText("");
          charIndex = 0;
          setIsTyping(true);
          typeText();
        }, 3000);
      }
    };

    const startTimeout = setTimeout(typeText, 500);

    return () => {
      clearTimeout(startTimeout);
      if (typingRef.current) clearTimeout(typingRef.current);
    };
  }, [fullText]);

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight - 100,
      behavior: "smooth",
    });
  };

  return (
    <section
      className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-4"
      aria-label="Hero"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-r from-primary/30 via-purple-500/20 to-blue-500/30 blur-[100px] will-change-transform animate-float-slow" />
        <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-primary/30 blur-[80px] will-change-transform animate-float-medium" />
        <div className="absolute right-1/3 top-1/2 h-[300px] w-[300px] rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 blur-[60px] will-change-transform animate-float-fast" />
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Floating decorative icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <FloatingIcon icon={<Shield className="h-5 w-5" />} className="top-[20%] left-[8%]" delay={0} />
        <FloatingIcon icon={<Code className="h-6 w-6" />} className="top-[30%] right-[12%]" delay={1} />
        <FloatingIcon icon={<Cloud className="h-4 w-4" />} className="bottom-[35%] left-[18%]" delay={2} />
        <FloatingIcon icon={<Sparkles className="h-5 w-5" />} className="bottom-[25%] right-[20%]" delay={3} />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        {/* Welcome badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary animate-fade-in">
          <Sparkles className="h-3 w-3" />
          <span>Welcome</span>
        </div>

        {/* Main headline with typing effect */}
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl min-h-[1.1em]">
          <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
            {typedText}
          </span>
          <span className={cn(
            "inline-block w-[3px] h-[0.9em] ml-1 bg-primary align-middle",
            isTyping ? "animate-pulse" : "opacity-0"
          )} />
        </h1>

        {/* Subheadline */}
        <p className="mt-6 text-base text-muted-foreground sm:text-lg max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          Building secure, scalable solutions with expertise in cybersecurity, cloud infrastructure, and web development.
        </p>

        {/* Primary CTA */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          {resumeUrl ? (
            <ResumeButton resumeUrl={resumeUrl} className="px-8 py-3 text-base" />
          ) : (
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Get in touch
            </Link>
          )}
          <Link
            href="/projects"
            className="group inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-muted-foreground transition-all hover:border-foreground/30 hover:text-foreground hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            View my work
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToContent}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-muted-foreground/50 hover:text-muted-foreground transition-colors animate-bounce-slow"
        aria-label="Scroll to content"
      >
        <span className="text-[10px] font-medium uppercase tracking-widest">Explore</span>
        <ChevronDown className="h-4 w-4" />
      </button>
    </section>
  );
}

function FloatingIcon({ 
  icon, 
  className = "",
  delay = 0 
}: { 
  icon: React.ReactNode; 
  className?: string;
  delay?: number;
}) {
  return (
    <div 
      className={cn(
        "absolute rounded-xl border border-foreground/5 bg-background/30 backdrop-blur-sm p-2.5 text-foreground/20",
        className
      )}
      style={{ animationDelay: `${delay * 0.5}s` }}
    >
      {icon}
    </div>
  );
}