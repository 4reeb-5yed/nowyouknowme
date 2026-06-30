import type { Metadata } from "next";
import { PosterHero } from "@/components/public/poster-hero";
import "@/app/craft.css";

export const metadata: Metadata = {
  title: "Secure by Design | Creative Developer",
  description: "Building digital experiences at the intersection of security, cloud, and web development.",
};

export default function PosterPage() {
  return (
    <main className="craft">
      <PosterHero tagline="Building digital experiences" />
    </main>
  );
}
