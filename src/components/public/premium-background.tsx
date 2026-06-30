"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface PremiumBackgroundProps {
  className?: string;
  variant?: "hero" | "section" | "subtle";
  mouseReactive?: boolean;
}

export function PremiumBackground({ 
  className, 
  variant = "subtle",
  mouseReactive = false 
}: PremiumBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mouseReactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      
      if (containerRef.current) {
        containerRef.current.style.setProperty("--mouse-x", `${x * 100}%`);
        containerRef.current.style.setProperty("--mouse-y", `${y * 100}%`);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseReactive]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "absolute inset-0 -z-10 overflow-hidden",
        variant === "hero" && "fixed",
        variant === "section" && "relative",
        className
      )}
      style={{
        ["--mouse-x" as string]: "50%",
        ["--mouse-y" as string]: "50%",
      }}
    >
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />
      
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Atmospheric glow - top left */}
      <div 
        className={cn(
          "absolute pointer-events-none",
          variant === "hero" && "animate-float-slow",
          "w-[800px] h-[800px] -top-[200px] -left-[200px]",
          "rounded-full blur-[150px]"
        )}
        style={{
          background: "radial-gradient(circle, oklch(0.70 0.12 280 / 0.15) 0%, transparent 70%)",
          transform: mouseReactive ? `translate(calc(var(--mouse-x) * 50px - 50%), calc(var(--mouse-y) * 50px - 50%))` : undefined,
          transition: "transform 2s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />

      {/* Atmospheric glow - top right */}
      <div 
        className={cn(
          "absolute pointer-events-none",
          variant === "hero" && "animate-float-slow-delayed",
          "w-[600px] h-[600px] -top-[100px] right-0",
          "rounded-full blur-[120px]"
        )}
        style={{
          background: "radial-gradient(circle, oklch(0.60 0.10 180 / 0.12) 0%, transparent 70%)",
        }}
      />

      {/* Atmospheric glow - bottom */}
      <div 
        className="absolute pointer-events-none w-[1000px] h-[400px] bottom-0 left-1/2 -translate-x-1/2 rounded-full blur-[180px]"
        style={{
          background: "radial-gradient(circle, oklch(0.65 0.08 280 / 0.08) 0%, transparent 60%)",
        }}
      />

      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/50" />

      {/* Grid lines for depth - subtle */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--foreground) 1px, transparent 1px),
            linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />
    </div>
  );
}

// Floating decorative elements
export function FloatingElements({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="absolute top-1/4 left-10 w-2 h-2 rounded-full bg-primary/30 animate-float" />
      <div className="absolute top-1/3 right-20 w-3 h-3 rounded-full bg-accent/20 animate-float-delayed" />
      <div className="absolute bottom-1/4 left-1/4 w-1.5 h-1.5 rounded-full bg-primary/40 animate-float-slow" />
      
      <svg className="absolute top-20 right-1/4 w-24 h-24 text-primary/10 animate-fade-in" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
      </svg>
      <svg className="absolute bottom-32 left-20 w-16 h-16 text-accent/10 animate-fade-in-delayed" viewBox="0 0 100 100">
        <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="0.5" transform="rotate(45 50 50)" />
      </svg>
    </div>
  );
}
