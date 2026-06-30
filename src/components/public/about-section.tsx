"use client";

import Image from "next/image";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const PLACEHOLDER_BLUR =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNGM0YxRUMiLz48L3N2Zz4=";

export function AboutSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="about" className="section section--surface">
      <div className="container">
        <div 
          ref={ref}
          className={`about-content reveal ${isVisible ? "visible" : ""}`}
        >
          <div className="about-photo">
            <Image
              src="https://picsum.photos/seed/portrait/400/400"
              alt="Portrait of the developer"
              width={400}
              height={400}
              loading="lazy"
              sizes="(max-width: 768px) 200px, 300px"
              placeholder="blur"
              blurDataURL={PLACEHOLDER_BLUR}
            />
          </div>
          <div className="about-text">
            <p className="section-kicker">// 04 — About</p>
            <h2 className="section-title" style={{ marginBottom: "var(--space-8)" }}>A Little Background</h2>
            <p>
              I&apos;m a software engineer who finds genuine satisfaction in building systems that work so reliably you forget they&apos;re there. My background spans distributed systems, developer tooling, and the unglamorous but essential work of making complex things simple to operate.
            </p>
            <p>
              Before engineering, I studied architecture — which explains a lot about how I approach software: the importance of structure, the discipline of restraint, and the belief that good design is mostly about knowing what to leave out.
            </p>
            <p>
              When I&apos;m not at a keyboard, I&apos;m usually restoring a 1970s motorcycle, reading about soil composition for my garden, or trying to convince my sourdough starter to forgive me for the weekend I forgot to feed it.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
