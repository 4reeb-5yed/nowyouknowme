"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    setMounted(true);
  }, []);

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

      {/* Typographic watermark - static, fixed behind content */}
      <div 
        className="hero__watermark"
        aria-hidden="true"
      >
        <span>Areeb Syed</span>
      </div>

      {/* Content */}
      <div className="hero__content container">
        <div className="hero__content-inner">
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
