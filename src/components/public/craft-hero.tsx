"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./craft-hero.module.css";

interface CraftHeroProps {
  tagline: string;
}

export function CraftHero({ tagline }: CraftHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    // Staggered load animation
    const timer = setTimeout(() => setIsLoaded(true), 100);
    
    // Scroll listener for parallax
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Mouse parallax
    const container = containerRef.current;
    if (!container) return;

    const handleMouse = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { width, height, left, top } = container.getBoundingClientRect();
      const x = (clientX - left - width / 2) / (width / 2);
      const y = (clientY - top - height / 2) / (height / 2);
      container.style.setProperty("--mouse-x", `${50 + x * 15}%`);
      container.style.setProperty("--mouse-y", `${50 + y * 15}%`);
    };

    container.addEventListener("mousemove", handleMouse);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
      container.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  // Parallax values
  const heroScale = 1 - scrollY * 0.0003;
  const heroOpacity = Math.max(0, 1 - scrollY * 0.001);
  const titleY = scrollY * 0.4;

  return (
    <section ref={containerRef} className={styles.hero}>
      {/* Atmospheric background */}
      <div className={styles.background}>
        {/* Ambient glow following mouse */}
        <div className={styles.ambientGlow} />
        
        {/* Floating orbs */}
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.orb3} />
        
        {/* Grid pattern */}
        <div className={styles.gridPattern} />
      </div>

      {/* Content */}
      <div 
        className={styles.content}
        style={{
          transform: `scale(${heroScale}) translateY(${titleY}px)`,
          opacity: heroOpacity
        }}
      >
        {/* Label */}
        <div className={`${styles.label} ${isLoaded ? styles.visible : ""}`}>
          <span className={styles.labelDot} />
          <span>Creative Developer</span>
        </div>

        {/* Main headline - asymmetric composition */}
        <h1 className={`${styles.headline} ${isLoaded ? styles.visible : ""}`}>
          <span className={styles.headlineLine1}>Building</span>
          <span className={styles.headlineLine2}>
            <span className={styles.headlineAccent}>Digital</span>
          </span>
          <span className={styles.headlineLine3}>Experiences</span>
        </h1>

        {/* Tagline */}
        <p className={`${styles.tagline} ${isLoaded ? styles.visible : ""}`}>
          {tagline}
        </p>

        {/* CTA */}
        <div className={`${styles.cta} ${isLoaded ? styles.visible : ""}`}>
          <Link href="/projects" className={styles.buttonPrimary}>
            View Projects
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
          <Link href="/contact" className={styles.buttonSecondary}>
            Get in Touch
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className={`${styles.scrollIndicator} ${isLoaded ? styles.visible : ""}`}>
          <div className={styles.scrollLine} />
          <span>Scroll</span>
        </div>
      </div>

      {/* Floating decorative elements */}
      <div className={styles.decorative}>
        <div className={styles.decorCircle} />
        <div className={styles.decorLine} />
        <div className={styles.decorDots} />
      </div>
    </section>
  );
}
