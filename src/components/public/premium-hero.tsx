"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

interface PremiumHeroProps {
  tagline: string;
  resumeUrl?: string | null;
  githubUrl?: string;
  linkedinUrl?: string;
}

export function PremiumHero({ tagline, resumeUrl }: PremiumHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { width, height, left, top } = container.getBoundingClientRect();
      const x = (clientX - left - width / 2) / width;
      const y = (clientY - top - height / 2) / height;
      
      container.style.setProperty("--mouse-x", `${50 + x * 20}%`);
      container.style.setProperty("--mouse-y", `${50 + y * 20}%`);
    };

    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/30" />
        
        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }} />

        {/* Floating orbs - mouse reactive */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full blur-[150px] transition-transform duration-[2000ms] ease-out"
          style={{
            background: "radial-gradient(circle, oklch(0.70 0.12 280 / 0.2) 0%, transparent 70%)",
            top: "var(--mouse-y, 30%)",
            left: "var(--mouse-x, 50%)",
            transform: "translate(-50%, -50%)",
          }}
        />
        <div 
          className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-60"
          style={{
            background: "radial-gradient(circle, oklch(0.60 0.10 180 / 0.15) 0%, transparent 70%)",
            top: "10%",
            right: "5%",
            animation: "float-delayed 10s ease-in-out infinite",
          }}
        />
        <div 
          className="absolute w-[300px] h-[300px] rounded-full blur-[80px] opacity-40"
          style={{
            background: "radial-gradient(circle, oklch(0.68 0.10 280 / 0.12) 0%, transparent 70%)",
            bottom: "15%",
            left: "10%",
            animation: "float-slow 12s ease-in-out infinite",
          }}
        />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Floating decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-[10%] w-1 h-1 rounded-full bg-primary/40 animate-float" />
        <div className="absolute top-1/3 right-[15%] w-2 h-2 rounded-full bg-accent/30 animate-float-delayed" />
        <div className="absolute bottom-1/3 left-[20%] w-1.5 h-1.5 rounded-full bg-primary/50 animate-float-slow" />
        <div className="absolute top-1/2 right-[25%] w-1 h-1 rounded-full bg-accent/40 animate-float-slow-delayed" />
        
        <svg className="absolute top-[15%] right-[20%] w-32 h-32 text-primary/5 animate-fade-in" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="2 4" />
        </svg>
        <svg className="absolute bottom-[25%] left-[8%] w-24 h-24 text-accent/5 animate-fade-in-delayed" viewBox="0 0 100 100">
          <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="0.3" transform="rotate(30 50 50)" />
        </svg>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Pre-heading */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Welcome to my portfolio</span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 animate-fade-in-up">
            <span className="block text-foreground">{tagline}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 animate-fade-in-up stagger-1">
            Building elegant solutions at the intersection of cybersecurity, cloud architecture, and web development.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up stagger-2">
            {resumeUrl && (
              <Link
                href={resumeUrl}
                className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
              >
                <span>Download Resume</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
            <Link
              href="/projects"
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl border border-border bg-card/50 backdrop-blur-sm font-medium transition-all duration-300 hover:bg-card hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span>View Projects</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in stagger-4">
            <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
              <span className="text-xs tracking-widest uppercase">Scroll</span>
              <div className="w-px h-12 bg-gradient-to-b from-muted-foreground/50 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
