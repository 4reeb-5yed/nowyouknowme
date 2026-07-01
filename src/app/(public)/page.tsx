import type { Metadata } from "next";
import { getConfig } from "@/server/services/site-config.service";
import { Hero } from "@/components/public/hero-v3";
import { FeaturedProjects } from "@/components/public/featured-projects";
import { ExperienceSection } from "@/components/public/experience-section";
import { SkillsSection } from "@/components/public/skills-section";
import { AboutSection } from "@/components/public/about-section";
import { ContactSection } from "@/components/public/contact-section";

export const metadata: Metadata = {
  title: "NowYouKnowMe — Portfolio",
  description: "Software engineer building systems that work. Specializing in distributed systems, developer tooling, and reliable infrastructure.",
};

const DEFAULT_SECTION_ORDER = [
  "hero",
  "featured-projects", 
  "experience",
  "skills",
  "about",
  "contact",
] as const;

export default async function HomePage() {
  // Fetch site config for section visibility and order
  let siteConfig = null;
  try {
    siteConfig = await getConfig();
  } catch {
    // Use defaults if DB unavailable
  }

  const sectionOrder = siteConfig?.sectionOrder ?? DEFAULT_SECTION_ORDER;
  
  // Section visibility settings
  const visibility = {
    "hero": true, // Hero is always shown
    "featured-projects": siteConfig?.showFeaturedProjects ?? true,
    "experience": siteConfig?.showExperience ?? true,
    "skills": siteConfig?.showSkills ?? true,
    "about": siteConfig?.showAbout ?? true,
    "contact": siteConfig?.showContact ?? true,
  };

  // Render sections based on order and visibility
  const renderSection = (key: string) => {
    if (!visibility[key]) return null;
    
    switch (key) {
      case "hero":
        return <Hero key="hero" />;
      case "featured-projects":
        return <FeaturedProjects key="featured-projects" />;
      case "experience":
        return <ExperienceSection key="experience" />;
      case "skills":
        return <SkillsSection key="skills" />;
      case "about":
        return <AboutSection key="about" />;
      case "contact":
        return <ContactSection key="contact" />;
      default:
        return null;
    }
  };

  return (
    <>
      {sectionOrder.map(renderSection)}
    </>
  );
}
