"use client";

import { useState, useEffect, useRef } from "react";
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
    // Typing animation
    let charIndex = 0;
    const typeText = () => {
      if (charIndex < fullText.length) {
        setTypedText(fullText.slice(0, charIndex + 1));
        charIndex++;
        typingRef.current = setTimeout(typeText, 50 + Math.random() * 30);
      } else {
        setIsTyping(false);
        // Pause then restart
        setTimeout(() => {
          setTypedText("");
          charIndex = 0;
          setIsTyping(true);
          typeText();
        }, 3000);
      }
    };

    // Start typing after a brief delay
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
      className="relative flex min-h-[90vh] items-center justify-center overflow-hidden px-4"
      aria-label="Hero"
    >
      {/* Animated gradient background - CSS only, GPU accelerated */}
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        {/* Primary gradient orb */}
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-r from-primary/30 via-purple-500/20 to-blue-500/30 blur-[100px] will-change-transform animate-float-slow" />
        {/* Secondary gradient orb */}
        <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-primary/30 blur-[80px] will-change-transform animate-float-medium" />
        {/* Accent orb */}
        <div className="absolute right-1/3 top-1/2 h-[300px] w-[300px] rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 blur-[60px] will-change-transform animate-float-fast" />
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Floating decorative icons - SSR safe, CSS animated */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <FloatingIcon icon={<Shield className="h-6 w-6" />} className="top-[15%] left-[10%] animate-float-delayed-1" delay={0} />
        <FloatingIcon icon={<Code className="h-8 w-8" />} className="top-[25%] right-[15%] animate-float-delayed-2" delay={1} />
        <FloatingIcon icon={<Cloud className="h-5 w-5" />} className="bottom-[30%] left-[20%] animate-float-delayed-3" delay={2} />
        <FloatingIcon icon={<Sparkles className="h-7 w-7" />} className="bottom-[20%] right-[25%] animate-float-delayed-4" delay={3} />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary animate-fade-in">
          <Sparkles className="h-4 w-4" />
          <span>Welcome to my portfolio</span>
        </div>

        {/* Main headline with typing effect */}
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl min-h-[1.1em]">
          <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
            {typedText}
          </span>
          <span className={cn(
            "inline-block w-[3px] h-[0.9em] ml-1 bg-primary align-middle",
            isTyping ? "animate-pulse" : "opacity-0"
          )} />
        </h1>

        {/* Subheadline */}
        <p className="mt-6 text-lg text-muted-foreground sm:text-xl md:text-2xl max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          Explore my work, experience, and what drives me to build exceptional digital experiences.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          {resumeUrl && (
            <ResumeButton resumeUrl={resumeUrl} className="px-8 py-3 text-base" />
          )}
          <a
            href="#projects"
            className="group inline-flex items-center gap-2 rounded-full border-2 border-foreground/20 px-6 py-2.5 text-sm font-medium transition-all hover:border-foreground/40 hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            View Projects
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
        </div>

        {/* Stats (optional quick impact) */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <StatItem number="5+" label="Years Experience" />
          <StatItem number="20+" label="Projects Built" />
          <StatItem number="10+" label="Technologies" />
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/60 hover:text-foreground transition-colors animate-bounce-slow"
        aria-label="Scroll to content"
      >
        <span className="text-xs font-medium uppercase tracking-widest">Scroll</span>
        <ChevronDown className="h-5 w-5" />
      </button>
    </section>
  );
}

// Floating icon component - pure CSS animation
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
        "absolute rounded-xl border border-foreground/5 bg-background/50 backdrop-blur-sm p-3 text-foreground/30",
        className
      )}
      style={{ animationDelay: `${delay * 0.5}s` }}
    >
      {icon}
    </div>
  );
}

// Stats counter component
function StatItem({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold tracking-tight">{number}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}