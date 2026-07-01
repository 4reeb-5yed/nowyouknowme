"use client";

import { useState } from "react";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2, AlertCircle, Send } from "lucide-react";

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

export function ContactSection() {
  const { ref, isVisible } = useScrollReveal();
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formState.name.trim()) newErrors.name = "Name is required";
    if (!formState.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formState.message.trim()) newErrors.message = "Message is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setStatus("submitting");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setStatus("success");
      setSubmitted(true);
      setFormState({ name: "", email: "", message: "" });

      // Reset after 5 seconds
      setTimeout(() => {
        setStatus("idle");
        setSubmitted(false);
        setErrorMessage("");
      }, 5000);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <section id="contact" className="section section--surface">
      <div className="container">
        <div className="section-header section-header--centered reveal">
          <p className="section-kicker">// 05 — Contact</p>
          <h2 className="section-title">Let&apos;s Work Together</h2>
          <p className="section-description">
            Available for interesting problems. Typical response time: within a few days.
          </p>
        </div>

        <form 
          ref={ref}
          className={`contact-form reveal ${isVisible ? "visible" : ""}`} 
          onSubmit={handleSubmit} 
          noValidate
        >
          <div className="form-field">
            <input
              type="text"
              id="contact-name"
              name="name"
              className="form-input"
              placeholder=" "
              value={formState.name}
              onChange={(e) => setFormState({ ...formState, name: e.target.value })}
              disabled={status === "submitting"}
              aria-describedby={errors.name ? "name-error" : undefined}
              aria-required="true"
            />
            <label htmlFor="contact-name" className="form-label">Name</label>
            {errors.name && <p id="name-error" className="form-error">{errors.name}</p>}
          </div>

          <div className="form-field">
            <input
              type="email"
              id="contact-email"
              name="email"
              className="form-input"
              placeholder=" "
              value={formState.email}
              onChange={(e) => setFormState({ ...formState, email: e.target.value })}
              disabled={status === "submitting"}
              aria-describedby={errors.email ? "email-error" : undefined}
              aria-required="true"
            />
            <label htmlFor="contact-email" className="form-label">Email</label>
            {errors.email && <p id="email-error" className="form-error">{errors.email}</p>}
          </div>

          <div className="form-field form-field--textarea">
            <textarea
              id="contact-message"
              name="message"
              className="form-input"
              placeholder=" "
              rows={5}
              value={formState.message}
              onChange={(e) => setFormState({ ...formState, message: e.target.value })}
              disabled={status === "submitting"}
              aria-describedby={errors.message ? "message-error" : undefined}
              aria-required="true"
            />
            <label htmlFor="contact-message" className="form-label">Message</label>
            {errors.message && <p id="message-error" className="form-error">{errors.message}</p>}
          </div>

          {/* Status Messages */}
          {status === "success" && (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 mb-4">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <p>Message sent successfully! I&apos;ll get back to you soon.</p>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 mb-4">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>{errorMessage}</p>
            </div>
          )}

          <button
            type="submit"
            className={`btn btn--primary form-submit flex items-center justify-center gap-2`}
            disabled={status === "submitting"}
          >
            {status === "submitting" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : status === "success" ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Sent!
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Message
              </>
            )}
          </button>

          <div className="mt-6 text-center">
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              or visit the contact page →
            </Link>
          </div>

          <div className="form-alternative">
            <p className="form-alternative__text">Prefer email?</p>
            <a href="mailto:hello@example.com" className="form-alternative__email">
              hello@example.com
            </a>
            <div className="form-alternative__links">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="form-alternative__link" aria-label="GitHub profile">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="form-alternative__link" aria-label="LinkedIn profile">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
