import type { Metadata } from "next";
import { CraftHero } from "@/components/public/craft-hero";
import { CraftProjects } from "@/components/public/craft-projects";
import "@/app/craft.css";

export const metadata: Metadata = {
  title: "Creative Developer Portfolio",
  description: "Building digital experiences at the intersection of security, cloud, and web development.",
};

export default async function CraftPage() {
  const projects = [
    {
      id: "1",
      title: "SecureVault",
      description: "Enterprise-grade security platform with zero-trust architecture and real-time threat detection capabilities.",
      slug: "securevault",
      category: "cybersecurity",
      techStack: ["React", "Go", "Kubernetes", "AWS"],
    },
    {
      id: "2",
      title: "CloudSync",
      description: "Multi-cloud synchronization solution with intelligent load balancing and disaster recovery.",
      slug: "cloudsync",
      category: "cloud",
      techStack: ["TypeScript", "Terraform", "GCP", "Azure"],
    },
    {
      id: "3",
      title: "DevFlow",
      description: "Developer productivity platform with AI-powered code review and automated deployment pipelines.",
      slug: "devflow",
      category: "web",
      techStack: ["Next.js", "Python", "PostgreSQL"],
    },
  ];

  return (
    <main className="craft">
      <CraftHero tagline="Building secure, scalable, and elegant solutions." />
      <CraftProjects projects={projects} />
      
      <section className="craft-cta">
        <div className="craft-cta-container">
          <h2 className="craft-cta-title">
            Let&apos;s create something<br />
            <span className="craft-gradient-text">extraordinary</span>
          </h2>
          <p className="craft-cta-text">Have a project in mind? I&apos;d love to hear about it.</p>
          <a href="/contact" className="craft-button craft-button-primary">
            Get in Touch
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </section>
    </main>
  );
}
