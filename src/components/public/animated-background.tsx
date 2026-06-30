"use client";

import { useEffect, useState } from "react";

interface Particle {
  id: number;
  left: string;
  top: string;
  delay: number;
  duration: number;
}

const generateParticles = (count: number): Particle[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: Math.random() * -20,
    duration: 15 + Math.random() * 10,
  }));
};

/**
 * Animated background component that adds aurora effects and floating particles.
 * Use this wrapper on any page or section to add premium animated backgrounds.
 */
export function AnimatedBackground({ 
  children, 
  enableParticles = true,
  particleCount = 8,
  className = ""
}: { 
  children: React.ReactNode;
  enableParticles?: boolean;
  particleCount?: number;
  className?: string;
}) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setParticles(generateParticles(particleCount));
  }, [particleCount]);

  return (
    <div className={`relative ${className}`}>
      {/* Background gradient layer */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        {/* Main gradient */}
        <div className="absolute inset-0 bg-gradient-hero" />
        
        {/* Aurora effects */}
        <div className="aurora aurora-1" />
        <div className="aurora aurora-2" />
        <div className="aurora aurora-3" />
        
        {/* Subtle dot grid */}
        <div 
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* Floating particles */}
      {mounted && enableParticles && (
        <div className="absolute inset-0 -z-5 overflow-hidden pointer-events-none" aria-hidden="true">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="particle"
              style={{
                left: particle.left,
                top: particle.top,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      {children}
    </div>
  );
}

/**
 * Section wrapper with animated background.
 * Use this for individual sections that need aurora effects.
 */
export function AnimatedSection({ 
  children, 
  className = "",
  enableParticles = false
}: { 
  children: React.ReactNode;
  className?: string;
  enableParticles?: boolean;
}) {
  return (
    <AnimatedBackground 
      enableParticles={enableParticles} 
      particleCount={enableParticles ? 6 : 0}
      className={className}
    >
      {children}
    </AnimatedBackground>
  );
}
