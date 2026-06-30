"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {}
) {
  const { threshold = 0.1, rootMargin = "0px 0px -50px 0px", once = true } = options;
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, once]);

  return { ref, isVisible };
}

// Wrapper component for scroll-revealed children
interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 600,
}: ScrollRevealProps) {
  const { ref, isVisible } = useScrollReveal();
  
  const getTransform = () => {
    switch (direction) {
      case "up": return "translateY(30px)";
      case "down": return "translateY(-30px)";
      case "left": return "translateX(30px)";
      case "right": return "translateX(-30px)";
      case "none": return "none";
    }
  };

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "none" : getTransform(),
        transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// Staggered reveal for lists/groups
interface StaggeredRevealProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}

export function StaggeredReveal({
  children,
  className = "",
  staggerDelay = 100,
  direction = "up",
}: StaggeredRevealProps) {
  const { ref, isVisible } = useScrollReveal();
  
  const getTransform = () => {
    switch (direction) {
      case "up": return "translateY(30px)";
      case "down": return "translateY(-30px)";
      case "left": return "translateX(30px)";
      case "right": return "translateX(-30px)";
      case "none": return "none";
    }
  };

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={className}>
      {Array.isArray(children) ? (
        children.map((child, index) => (
          <div
            key={index}
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "none" : getTransform(),
              transition: `opacity 600ms ease-out, transform 600ms ease-out`,
              transitionDelay: isVisible ? `${index * staggerDelay}ms` : "0ms",
            }}
          >
            {child}
          </div>
        ))
      ) : (
        <div
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "none" : getTransform(),
            transition: "opacity 600ms ease-out, transform 600ms ease-out",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
