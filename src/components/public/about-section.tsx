"use client";

import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc/client";

function useScrollReveal(threshold = 0.25) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold, rootMargin: "-10% 0px -10% 0px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

const defaultAboutContent = `I'm a software engineer who finds genuine satisfaction in building systems that work so reliably you forget they're there. My background spans distributed systems, developer tooling, and the unglamorous but essential work of making complex things simple to operate.

Before engineering, I studied architecture — which explains a lot about how I approach software: the importance of structure, the discipline of restraint, and the belief that good design is mostly about knowing what to leave out.

When I'm not at a keyboard, I'm usually restoring a 1970s motorcycle, reading about soil composition for my garden, or trying to convince my sourdough starter to forgive me for the weekend I forgot to feed it.`;

export function AboutSection() {
  const { ref, isVisible } = useScrollReveal();
  const { data: aboutSection } = trpc.pages.getSection.useQuery({ key: "about" });

  // Parse paragraphs from section content (expects plain text with newlines)
  const paragraphs = aboutSection?.content 
    ? aboutSection.content.split('\n\n').filter(p => p.trim())
    : defaultAboutContent.split('\n\n').filter(p => p.trim());

  return (
    <section id="about" className="section section--surface">
      <div className="container">
        <div 
          ref={ref}
          className={`about-content reveal ${isVisible ? "visible" : ""}`}
        >
          <div className="about-photo">
            <img
              src="https://picsum.photos/seed/portrait/400/400"
              alt="Portrait of the developer"
              loading="lazy"
            />
          </div>
          <div className="about-text">
            <p className="section-kicker">// 04 — About</p>
            <h2 className="section-title" style={{ marginBottom: "var(--space-8)" }}>A Little Background</h2>
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
