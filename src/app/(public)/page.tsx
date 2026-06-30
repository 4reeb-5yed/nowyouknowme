import type { Metadata } from "next";
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

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedProjects />
      <ExperienceSection />
      <SkillsSection />
      <AboutSection />
      <ContactSection />
    </>
  );
}
