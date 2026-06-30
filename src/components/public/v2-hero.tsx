"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Download, ChevronDown } from "lucide-react";

interface V2HeroProps {
  tagline: string;
  resumeUrl?: string | null;
}

export function V2Hero({ tagline, resumeUrl }: V2HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = window.innerHeight;
      setScrollProgress(Math.min(scrollY / maxScroll, 1));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { width, height, left, top } = container.getBoundingClientRect();
      const x = (clientX - left - width / 2) / (width / 2);
      const y = (clientY - top - height / 2) / (height / 2);
      
      container.style.setProperty("--mouse-x", `${50 + x * 30}%`);
      container.style.setProperty("--mouse-y", `${50 + y * 30}%`);
      container.style.setProperty("--mouse-x-neg", `${-x * 20}px`);
      container.style.setProperty("--mouse-y-neg", `${-y * 20}px`);
    };

    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Parallax transform based on scroll
  const heroOpacity = 1 - scrollProgress * 0.5;
  const heroScale = 1 - scrollProgress * 0.1;

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ opacity: heroOpacity, transform: `scale(${heroScale})` }}
    >
      {/* Multi-layered atmospheric background */}
      <div className="absolute inset-0 -z-10">
        {/* Deep base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/40" />
        
        {/* Noise texture */}
        <div 
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Primary ambient glow - large, soft */}
        <div 
          className="absolute pointer-events-none"
          style={{
            width: "70vw",
            height: "70vw",
            maxWidth: "900px",
            maxHeight: "900px",
            top: "var(--mouse-y, 50%)",
            left: "var(--mouse-x, 50%)",
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, oklch(0.72 0.14 280 / 0.25) 0%, transparent 50%)",
            filter: "blur(80px)",
            transition: "all 2.5s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />

        {/* Secondary glow - warm accent */}
        <div 
          className="absolute pointer-events-none"
          style={{
            width: "40vw",
            height: "40vw",
            maxWidth: "500px",
            maxHeight: "500px",
            top: "10%",
            right: "0%",
            background: "radial-gradient(circle, oklch(0.65 0.12 180 / 0.12) 0%, transparent 50%)",
            filter: "blur(60px)",
            animation: "float-slow 15s ease-in-out infinite",
          }}
        />

        {/* Tertiary glow - bottom warmth */}
        <div 
          className="absolute pointer-events-none"
          style={{
            width: "60vw",
            height: "30vw",
            bottom: "0%",
            left: "20%",
            background: "radial-gradient(ellipse, oklch(0.68 0.10 280 / 0.08) 0%, transparent 60%)",
            filter: "blur(100px)",
            animation: "float-delayed 18s ease-in-out infinite",
          }}
        />

        {/* Edge vignette */}
        <div 
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at center, transparent 0%, transparent 40%, oklch(0 0 0 / 0.3) 100%)",
          }}
        />

        {/* Subtle grid for depth */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `
              linear-gradient(var(--foreground) 1px, transparent 1px),
              linear-gradient(90deg, var(--foreground) 1px, transparent 1px)
            `,
            backgroundSize: "100px 100px",
            transform: `translate(var(--mouse-x-neg, 0), var(--mouse-y-neg, 0))`,
            transition: "transform 3s ease-out",
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              background: i % 2 === 0 ? "oklch(0.70 0.14 280 / 0.5)" : "oklch(0.65 0.12 180 / 0.4)",
              top: `${15 + i * 12}%`,
              left: `${8 + i * 14}%`,
              animation: `float ${6 + i * 2}s ease-in-out infinite ${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Decorative geometry */}
      <div 
        className="absolute pointer-events-none"
        style={{
          top: "12%",
          right: "8%",
          animation: "float-delayed 12s ease-in-out infinite",
          transform: `translate(var(--mouse-x-neg, 0), var(--mouse-y-neg, 0))`,
          transition: "transform 3s ease-out",
        }}
      >
        <svg width="80" height="80" viewBox="0 0 80 80" className="text-primary/8">
          <circle cx="40" cy="40" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="40" cy="40" r="25" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="2 4" />
        </svg>
      </div>

      <div 
        className="absolute pointer-events-none"
        style={{
          bottom: "20%",
          left: "5%",
          animation: "float-slow 14s ease-in-out infinite",
          transform: `translate(var(--mouse-x-neg, 0), var(--mouse-y-neg, 0))`,
          transition: "transform 3s ease-out",
        }}
      >
        <svg width="60" height="60" viewBox="0 0 60 60" className="text-accent/6">
          <rect x="5" y="5" width="50" height="50" fill="none" stroke="currentColor" strokeWidth="0.5" transform="rotate(30 30 30)" />
        </svg>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Pre-heading badge */}
          <div 
            className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-border/40 bg-card/30 backdrop-blur-md mb-10 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: "100ms" }}
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Portfolio</span>
          </div>

          {/* Main headline */}
          <h1 
            className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: "200ms" }}
          >
            <span className="block text-foreground mb-2">{tagline}</span>
          </h1>

          {/* Subtitle */}
          <p 
            className={`text-lg sm:text-xl md:text-2xl text-muted-foreground/80 max-w-2xl mx-auto mb-14 leading-relaxed transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: "300ms" }}
          >
            Crafting elegant solutions at the intersection of security, cloud, and web development.
          </p>

          {/* CTA buttons */}
          <div 
            className={`flex flex-col sm:flex-row items-center justify-center gap-5 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: "400ms" }}
          >
            {resumeUrl && (
              <a
                href={resumeUrl}
                className="group relative inline-flex items-center gap-3 px-8 py-4.5 rounded-2xl bg-primary text-primary-foreground font-medium text-base shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0"
              >
                <Download className="w-5 h-5" />
                <span>Download Resume</span>
              </a>
            )}
            <Link
              href="/projects"
              className="group relative inline-flex items-center gap-3 px-8 py-4.5 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm font-medium text-base transition-all duration-300 hover:bg-card/70 hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
            >
              <span>Explore Projects</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div 
        className={`absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ transitionDelay: "800ms" }}
      >
        <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground/50">Scroll</span>
        <div className="relative w-6 h-10 rounded-full border border-border/40 flex items-start justify-center p-1.5">
          <div 
            className="w-1.5 h-3 rounded-full bg-primary"
            style={{
              animation: "scroll-dot 2s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-dot {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(12px); opacity: 0.3; }
        }
      `}</style>
    </section>
  );
}
