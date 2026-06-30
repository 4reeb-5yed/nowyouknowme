"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface HeroProps {
  tagline?: string;
  headline?: string;
  subhead?: string;
  resumeUrl?: string | null;
  emphasisWord?: string;
}

export function Hero({
  tagline = "SOFTWARE ENGINEER — SYSTEMS & PRODUCT",
  headline = "I build software that <em>disappears</em> into the right answer.",
  subhead = "Currently focused on systems that stay quiet when they're working and loud when they shouldn't.",
  resumeUrl,
  emphasisWord = "disappears",
}: HeroProps) {
  const [mounted, setMounted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const watermarkRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    // Scroll progress tracking
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(scrollTop / docHeight, 1);
      setScrollProgress(progress);
    };

    // Mouse position for watermark tilt (throttled)
    let ticking = false;
    const handleMouseMove = (e: MouseEvent) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setMousePosition({
            x: (e.clientX / window.innerWidth - 0.5) * 2,
            y: (e.clientY / window.innerHeight - 0.5) * 2,
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Watermark parallax and tilt
  useEffect(() => {
    if (!mounted || !watermarkRef.current) return;

    const watermark = watermarkRef.current;
    const maxRotation = 2;
    const maxTranslate = 20;

    // Calculate transforms based on scroll and mouse
    const scrollOffset = scrollProgress * 0.4;
    const mouseRotationX = mousePosition.y * maxRotation;
    const mouseRotationY = mousePosition.x * maxRotation;
    const mouseTranslateX = mousePosition.x * maxTranslate;
    const mouseTranslateY = mousePosition.y * maxTranslate;

    // Parallax offset (0.4x scroll speed)
    const parallaxY = scrollOffset * 100;
    
    // Combined transforms
    const rotateX = -mouseRotationX;
    const rotateY = mouseRotationY;
    const translateX = mouseTranslateX;
    const translateY = -parallaxY + mouseTranslateY;

    watermark.style.transform = `translateY(calc(-50% + ${translateY}px)) translateX(${translateX}px) rotate(-90deg) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    watermark.style.opacity = String(Math.max(0.02, 0.08 - scrollProgress * 0.06));
  }, [mounted, scrollProgress, mousePosition]);

  // Content fade on scroll
  useEffect(() => {
    if (!mounted || !contentRef.current) return;

    const content = contentRef.current;
    const opacity = Math.max(0, 1 - scrollProgress * 1.67);
    const translateY = scrollProgress * 67; // -40px at 60%
    const progress60 = Math.min(scrollProgress / 0.6, 1);
    
    content.style.opacity = String(opacity);
    content.style.transform = `translateY(-${translateY}px)`;
  }, [mounted, scrollProgress]);

  // Format headline with emphasis
  const formatHeadline = (text: string, emphasis: string) => {
    const parts = text.split("<em>");
    if (parts.length < 2) return <>{text}</>;
    
    return parts.map((part, i) => {
      if (i === 0) return <span key={i}>{part}</span>;
      const [content, ...rest] = part.split("</em>");
      return (
        <span key={i}>
          <em>{content}</em>
          {rest.join("")}
        </span>
      );
    });
  };

  return (
    <section className="hero" aria-labelledby="hero-headline">
      {/* Background gradient */}
      <div className="hero__gradient" aria-hidden="true" />

      {/* Typographic watermark */}
      <div 
        ref={watermarkRef}
        className="hero__watermark"
        aria-hidden="true"
        role="presentation"
      >
        <span>NowYouKnowMe</span>
      </div>

      {/* Content */}
      <div ref={contentRef} className="hero__content container">
        <div style={{ maxWidth: "calc(7/12 * 100%)" }}>
          {/* Kicker */}
          <div className={`hero__kicker kicker ${mounted ? "animate-fade-in-up" : "will-animate"} stagger-1`}>
            {tagline}
          </div>

          {/* Headline */}
          <h1 
            id="hero-headline"
            className={`hero__headline ${mounted ? "animate-fade-in-up" : "will-animate"} stagger-2`}
          >
            {formatHeadline(headline, emphasisWord)}
          </h1>

          {/* Subhead */}
          <p className={`hero__subhead body-lg text-secondary ${mounted ? "animate-fade-in-up" : "will-animate"} stagger-3`}>
            {subhead}
          </p>

          {/* Actions */}
          <div className={`hero__actions ${mounted ? "animate-fade-in-up" : "will-animate"} stagger-4`}>
            <Link href="/#work" className="btn btn--primary">
              View Projects
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            
            {resumeUrl ? (
              <a href={resumeUrl} className="btn btn--secondary" download>
                Download Résumé
              </a>
            ) : (
              <Link href="/#contact" className="btn btn--secondary">
                Get in Touch
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
