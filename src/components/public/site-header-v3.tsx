"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLink {
  href: string;
  label: string;
  sectionId?: string;
}

const navLinks: NavLink[] = [
  { href: "/#work", label: "Work", sectionId: "work" },
  { href: "/#experience", label: "Experience", sectionId: "experience" },
  { href: "/#skills", label: "Skills", sectionId: "skills" },
  { href: "/#about", label: "About", sectionId: "about" },
  { href: "/#contact", label: "Contact", sectionId: "contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial state
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer for active section tracking
  useEffect(() => {
    const sectionIds = navLinks
      .map((link) => link.sectionId)
      .filter((id): id is string => id !== undefined);

    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        {
          rootMargin: "-50% 0px -50% 0px",
          threshold: 0,
        }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  // Focus trap for mobile menu
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }

      if (e.key === "Tab") {
        const menu = mobileMenuRef.current;
        if (!menu) return;

        const focusableElements = menu.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0]!;
        const lastElement = focusableElements[focusableElements.length - 1]!;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={`site-header ${isScrolled ? "site-header--scrolled" : ""}`}
      >
        <div className="site-header__inner container">
          {/* Wordmark */}
          <Link href="/" className="site-header__wordmark">
            NowYouKnowMe
          </Link>

          {/* Desktop Navigation */}
          <nav className="site-header__nav" aria-label="Primary navigation">
            <ul className="site-header__nav-list">
              {navLinks.map(({ href, label, sectionId }) => {
                const isActive = sectionId && activeSection === sectionId;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`site-header__nav-link ${isActive ? "site-header__nav-link--active" : ""}`}
                      aria-current={isActive ? "true" : undefined}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* CTA */}
          <Link href="/#contact" className="site-header__cta">
            Let&apos;s Talk
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            ref={menuButtonRef}
            type="button"
            className="site-header__menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <span className="site-header__menu-icon">
              {mobileMenuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          id="mobile-navigation"
          className="mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <nav aria-label="Mobile navigation">
            <ul className="mobile-nav__list">
              {navLinks.map(({ href, label, sectionId }) => {
                const isActive = sectionId && activeSection === sectionId;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`mobile-nav__link ${isActive ? "mobile-nav__link--active" : ""}`}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
              <li>
                <Link
                  href="/#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mobile-nav__cta"
                >
                  Let&apos;s Talk
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
