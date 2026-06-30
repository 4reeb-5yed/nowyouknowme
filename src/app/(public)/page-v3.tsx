import type { Metadata } from "next";
import { SiteHeader } from "@/components/public/site-header-v3";
import { SiteFooter } from "@/components/public/site-footer-v3";
import { Hero } from "@/components/public/hero-v3";
import { FeaturedProjects } from "@/components/public/featured-projects";
import { ExperienceSection } from "@/components/public/experience-section";
import { SkillsSection } from "@/components/public/skills-section";
import { AboutSection } from "@/components/public/about-section";
import { ContactSection } from "@/components/public/contact-section";
import { ScrollProgress } from "@/components/public/scroll-progress";
import { GrainOverlay } from "@/components/public/grain-overlay";

export const metadata: Metadata = {
  title: "NowYouKnowMe — Portfolio",
  description: "Software engineer building systems that work. Specializing in distributed systems, developer tooling, and reliable infrastructure.",
};

export default function PortfolioPage() {
  return (
    <>
      <ScrollProgress />
      <GrainOverlay />
      <SiteHeader />
      <main>
        <Hero />
        <FeaturedProjects />
        <ExperienceSection />
        <SkillsSection />
        <AboutSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </>
  );
}

// Sample data - in production this would come from CMS/database
const projects = [
  {
    id: "1",
    title: "Distributed Task Queue",
    category: "SYSTEMS ENGINEERING",
    description: "A high-throughput task processing system handling 50k+ jobs per second with sub-millisecond latency and zero-downtime deployments.",
    techStack: ["Go", "Redis", "Kubernetes", "gRPC"],
    imageUrl: "https://picsum.photos/seed/project1/1200/750",
    liveUrl: "#",
    codeUrl: "#",
  },
  {
    id: "2",
    title: "Real-time Analytics Pipeline",
    category: "DATA ENGINEERING",
    description: "Stream processing architecture that transforms billions of events daily into actionable business intelligence with under 5-second data freshness.",
    techStack: ["Apache Kafka", "ClickHouse", "Rust", "React"],
    imageUrl: "https://picsum.photos/seed/project2/1200/750",
    liveUrl: "#",
    codeUrl: "#",
  },
  {
    id: "3",
    title: "API Gateway Platform",
    category: "INFRASTRUCTURE",
    description: "Multi-tenant API management layer with automatic rate limiting, circuit breakers, and comprehensive observability built in from day one.",
    techStack: ["Node.js", "TypeScript", "PostgreSQL", "Prometheus"],
    imageUrl: "https://picsum.photos/seed/project3/1200/750",
    liveUrl: "#",
    codeUrl: "#",
  },
];

const experiences = [
  {
    id: "1",
    role: "Senior Software Engineer",
    company: "Acme Systems",
    startDate: "2022",
    endDate: "Present",
    description: "Leading the platform team, focusing on developer experience and system reliability. Reduced p99 latency by 60% through targeted optimization work.",
    isCurrent: true,
  },
  {
    id: "2",
    role: "Software Engineer",
    company: "TechCorp",
    startDate: "2019",
    endDate: "2022",
    description: "Built and maintained core backend services processing millions of daily transactions. Introduced automated testing practices that cut production incidents by 40%.",
    isCurrent: false,
  },
  {
    id: "3",
    role: "Junior Developer",
    company: "StartupXYZ",
    startDate: "2017",
    endDate: "2019",
    description: "Full-stack development on a rapidly growing e-commerce platform. Wrote the inventory sync system that became the foundation for future scaling efforts.",
    isCurrent: false,
  },
];

const skillClusters = [
  {
    name: "Languages",
    skills: ["Go", "Rust", "TypeScript", "Python", "SQL"],
  },
  {
    name: "Infrastructure",
    skills: ["Kubernetes", "Docker", "Terraform", "AWS", "GCP"],
  },
  {
    name: "Data",
    skills: ["PostgreSQL", "Redis", "Kafka", "ClickHouse"],
  },
  {
    name: "Craft",
    skills: ["System Design", "API Design", "Observability", "Testing"],
  },
];

// Scroll Reveal Hook
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

// Scroll Progress Bar
function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress((scrollTop / docHeight) * 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="scroll-progress"
      style={{ width: `${progress}%` }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Page scroll progress"
    />
  );
}

// Film Grain Overlay
function GrainOverlay() {
  return <div className="grain-overlay" aria-hidden="true" />;
}

// Featured Projects Section
function FeaturedProjects() {
  return (
    <section id="work" className="section section--canvas">
      <div className="container">
        <div className="section-header">
          <p className="section-kicker">// 01 — Selected Work</p>
          <h2 className="section-title">Featured Projects</h2>
        </div>

        {projects.map((project, index) => (
          <article
            key={project.id}
            className={`projects-spread reveal ${index % 2 === 0 ? "projects-spread--image-left" : "projects-spread--image-right"}`}
          >
            <div className="projects-spread__content">
              <p className="projects-spread__kicker">// {String(index + 1).padStart(2, "0")} — {project.category}</p>
              <h3 className="projects-spread__title">{project.title}</h3>
              <p className="projects-spread__description">{project.description}</p>
              <div className="projects-spread__tags">
                {project.techStack.map((tech) => (
                  <span key={tech} className="projects-spread__tag">{tech}</span>
                ))}
              </div>
              <div className="projects-spread__links">
                <a href={project.liveUrl} className="btn btn--text link-draw">
                  View Case Study
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M7 17L17 7M17 7H7M17 7V17"/>
                  </svg>
                </a>
                <a href={project.codeUrl} className="btn btn--text link-draw">
                  View Code
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </a>
              </div>
            </div>
            <div className="projects-spread__image">
              <img
                src={project.imageUrl}
                alt={`${project.title} project screenshot`}
                loading="lazy"
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// Experience Timeline Section
function ExperienceSection() {
  return (
    <section id="experience" className="section section--surface">
      <div className="container">
        <div className="section-header" style={{ maxWidth: "calc(10/12 * 100%)", margin: "0 auto var(--space-16)" }}>
          <p className="section-kicker">// 02 — Experience</p>
          <h2 className="section-title">Where I&apos;ve Worked</h2>
          <p className="section-description">
            A path through building systems at scale. Each role built on the last.
          </p>
        </div>

        <div 
          className="experience-timeline reveal"
          style={{ maxWidth: "calc(8/12 * 100%)", margin: "0 auto" }}
        >
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className={`experience-entry ${exp.isCurrent ? "experience-entry--current" : ""}`}
            >
              <div className="experience-entry__header">
                <span className="experience-entry__date">{exp.startDate} — {exp.endDate}</span>
              </div>
              <h3 className="experience-entry__role">{exp.role}</h3>
              <p className="experience-entry__company">{exp.company}</p>
              <p className="experience-entry__description">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Skills Section
function SkillsSection() {
  return (
    <section id="skills" className="section section--canvas">
      <div className="container">
        <div className="section-header">
          <p className="section-kicker">// 03 — Skills</p>
          <h2 className="section-title">What I Work With</h2>
        </div>

        <div className="skills-grid reveal">
          {skillClusters.map((cluster) => (
            <div key={cluster.name} className="skills-cluster">
              <p className="skills-cluster__label">{cluster.name}</p>
              <ul className="skills-cluster__list">
                {cluster.skills.map((skill) => (
                  <li key={skill}>
                    <span className="skill-pill">{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// About Section
function AboutSection() {
  return (
    <section id="about" className="section section--surface">
      <div className="container">
        <div className="about-content reveal">
          <div className="about-photo">
            <img
              src="https://picsum.photos/seed/portrait/400/400"
              alt="Portrait"
              loading="lazy"
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

// Contact Section
function ContactSection() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
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

    // In production, this would submit to an API
    setSubmitted(true);
    setFormState({ name: "", email: "", message: "" });
    
    // Reset after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setErrors({});
    }, 3000);
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

        <form className="contact-form reveal" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              placeholder=" "
              value={formState.name}
              onChange={(e) => setFormState({ ...formState, name: e.target.value })}
              aria-describedby={errors.name ? "name-error" : undefined}
              aria-required="true"
            />
            <label htmlFor="name" className="form-label">Name</label>
            {errors.name && <p id="name-error" className="form-error">{errors.name}</p>}
          </div>

          <div className="form-field">
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder=" "
              value={formState.email}
              onChange={(e) => setFormState({ ...formState, email: e.target.value })}
              aria-describedby={errors.email ? "email-error" : undefined}
              aria-required="true"
            />
            <label htmlFor="email" className="form-label">Email</label>
            {errors.email && <p id="email-error" className="form-error">{errors.email}</p>}
          </div>

          <div className="form-field form-field--textarea">
            <textarea
              id="message"
              name="message"
              className="form-input"
              placeholder=" "
              rows={5}
              value={formState.message}
              onChange={(e) => setFormState({ ...formState, message: e.target.value })}
              aria-describedby={errors.message ? "message-error" : undefined}
              aria-required="true"
            />
            <label htmlFor="message" className="form-label">Message</label>
            {errors.message && <p id="message-error" className="form-error">{errors.message}</p>}
          </div>

          <button
            type="submit"
            className={`btn btn--primary form-submit ${submitted ? "btn--success" : ""}`}
            style={submitted ? { backgroundColor: "var(--signal-success)" } : undefined}
          >
            {submitted ? "Sent — Thank you!" : "Send Message"}
          </button>

          <div className="form-alternative">
            <p className="form-alternative__text">Prefer email?</p>
            <a href="mailto:hello@example.com" className="form-alternative__email">
              hello@example.com
            </a>
            <div className="form-alternative__links">
              <a href="#" className="form-alternative__link" aria-label="GitHub profile">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a href="#" className="form-alternative__link" aria-label="LinkedIn profile">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
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

// Footer
function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <p className="site-footer__wordmark">NowYouKnowMe</p>
            <p className="site-footer__tagline">Software engineer building systems that work.</p>
          </div>
          
          <div>
            <p className="site-footer__nav-title">Navigation</p>
            <ul className="site-footer__nav-list">
              <li><a href="/#work" className="site-footer__nav-link">Work</a></li>
              <li><a href="/#experience" className="site-footer__nav-link">Experience</a></li>
              <li><a href="/#skills" className="site-footer__nav-link">Skills</a></li>
              <li><a href="/#about" className="site-footer__nav-link">About</a></li>
              <li><a href="/#contact" className="site-footer__nav-link">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <p className="site-footer__nav-title">Connect</p>
            <div className="site-footer__social">
              <a href="#" className="site-footer__social-link" aria-label="GitHub">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a href="#" className="site-footer__social-link" aria-label="LinkedIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="site-footer__bottom">
          <p className="site-footer__copyright">© {currentYear} NowYouKnowMe</p>
          <p className="site-footer__credits">Built with Next.js. Set in Fraunces & Inter.</p>
        </div>
      </div>
    </footer>
  );
}

// Main Page Component
export default function PortfolioPageV3() {
  return (
    <>
      <ScrollProgress />
      <GrainOverlay />
      <Hero />
      <FeaturedProjects />
      <ExperienceSection />
      <SkillsSection />
      <AboutSection />
      <ContactSection />
      <Footer />
    </>
  );
}
