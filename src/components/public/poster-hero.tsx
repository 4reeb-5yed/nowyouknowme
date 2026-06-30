"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./poster-hero.module.css";

interface PosterHeroProps {
  tagline: string;
}

export function PosterHero({ tagline }: PosterHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    setIsLoaded(true);
    
    const handleMouse = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { width, height, left, top } = containerRef.current?.getBoundingClientRect() || { width: 0, height: 0, left: 0, top: 0 };
      setMousePos({
        x: (clientX - left) / width,
        y: (clientY - top) / height
      });
    };

    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  return (
    <section ref={containerRef} className={styles.hero}>
      {/* Background gradient that responds to mouse */}
      <div 
        className={styles.ambientGlow}
        style={{
          background: `radial-gradient(ellipse at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)`
        }}
      />
      
      {/* Decorative lines - poster art style */}
      <div className={styles.decorLines}>
        <div className={styles.line1} />
        <div className={styles.line2} />
        <div className={styles.line3} />
      </div>

      {/* Main content - poster layout */}
      <div className={styles.content}>
        {/* Category label - top left, small */}
        <div className={`${styles.label} ${isLoaded ? styles.visible : ""}`}>
          <span>Creative Developer</span>
          <span className={styles.labelDot} />
          <span>Portfolio 2024</span>
        </div>

        {/* The hero word - MASSIVE typography */}
        <div className={`${styles.heroWord} ${isLoaded ? styles.visible : ""}`}>
          <span className={styles.wordLine1}>SECURE</span>
          <span className={styles.wordLine2}>
            <span className={styles.wordAccent}>BY</span>
            <span className={styles.wordDesign}>DESIGN</span>
          </span>
        </div>

        {/* Subtitle - tiny, refined */}
        <div className={`${styles.subtitle} ${isLoaded ? styles.visible : ""}`}>
          <span className={styles.subtitleLine1} />
          <span className={styles.subtitleText}>Building digital experiences</span>
        </div>

        {/* CTA - bottom right, floating */}
        <div className={`${styles.cta} ${isLoaded ? styles.visible : ""}`}>
          <Link href="/projects" className={styles.ctaButton}>
            <span>View Work</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>

        {/* Geometric accent - poster art element */}
        <div className={styles.geometric}>
          <div className={styles.geomCircle} />
          <div className={styles.geomLine} />
        </div>
      </div>

      {/* Bottom info bar - poster style */}
      <div className={`${styles.infoBar} ${isLoaded ? styles.visible : ""}`}>
        <div className={styles.infoLeft}>
          <span>Specializing in</span>
          <span className={styles.infoAccent}>Security · Cloud · Web</span>
        </div>
        <div className={styles.infoRight}>
          <span>Available for work</span>
          <span className={styles.infoDot} />
        </div>
      </div>
    </section>
  );
}
