"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink, Shield, Cloud, Code, Box } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const categoryConfig = {
  cybersecurity: {
    icon: Shield,
    gradient: "from-emerald-500/20 to-teal-500/10",
    iconBg: "bg-emerald-500/20 text-emerald-400",
  },
  cloud: {
    icon: Cloud,
    gradient: "from-blue-500/20 to-indigo-500/10",
    iconBg: "bg-blue-500/20 text-blue-400",
  },
  web: {
    icon: Code,
    gradient: "from-violet-500/20 to-purple-500/10",
    iconBg: "bg-violet-500/20 text-violet-400",
  },
  other: {
    icon: Box,
    gradient: "from-gray-500/20 to-gray-500/10",
    iconBg: "bg-gray-500/20 text-gray-400",
  },
};

interface Project {
  id: string;
  title: string;
  description: string;
  slug: string;
  thumbnailUrl?: string;
  category: string;
  techStack: string[];
  isFeatured?: boolean;
  liveUrl?: string;
}

interface PremiumProjectCardProps {
  project: Project;
  index?: number;
  featured?: boolean;
}

export function PremiumProjectCard({ project, index = 0, featured = false }: PremiumProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);

  const categoryVariant = project.category as keyof typeof categoryConfig;
  const config = categoryConfig[categoryVariant] || categoryConfig.other;
  const Icon = config.icon;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePosition({ x, y });
    
    cardRef.current.style.setProperty("--mouse-x", `${x * 100}%`);
    cardRef.current.style.setProperty("--mouse-y", `${y * 100}%`);
  };

  return (
    <div
      ref={cardRef}
      className="group relative"
      style={{
        ["--mouse-x" as string]: "50%",
        ["--mouse-y" as string]: "50%",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/projects/${project.slug}`} className="block">
        <article
          className={cn(
            "relative overflow-hidden rounded-3xl border border-border/50",
            "bg-gradient-to-br from-card to-card/80",
            "transition-all duration-500 ease-out",
            "hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10"
          )}
          style={{
            transform: isHovered 
              ? `perspective(1000px) rotateX(${-(mousePosition.y - 0.5) * 5}deg) rotateY(${(mousePosition.x - 0.5) * 5}deg) scale(1.02)` 
              : "perspective(1000px) rotateX(0) rotateY(0) scale(1)",
          }}
        >
          {/* Animated gradient overlay */}
          <div 
            className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), oklch(0.70 0.12 280 / 0.15) 0%, transparent 50%)`,
            }}
          />

          {/* Image container */}
          <div className={cn("relative overflow-hidden", featured ? "aspect-[16/10]" : "aspect-[4/3]")}>
            {project.thumbnailUrl ? (
              <Image
                src={project.thumbnailUrl}
                alt={project.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className={cn("absolute inset-0 flex items-center justify-center bg-gradient-to-br", config.gradient)}>
                <div className={cn("rounded-2xl p-6", config.iconBg)}>
                  <Icon className="h-12 w-12" />
                </div>
              </div>
            )}
            
            {/* Overlay gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            
            {/* Featured badge */}
            {project.isFeatured && (
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium backdrop-blur-sm border border-amber-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Featured
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="relative p-6 space-y-4">
            {/* Category & Icon */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn("rounded-lg p-1.5", config.iconBg)}>
                  <Icon className="h-4 w-4" />
                </span>
                <Badge variant={categoryVariant as "cybersecurity" | "cloud" | "web" | "other"} className="capitalize">
                  {project.category}
                </Badge>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition-all duration-300 group-hover:text-primary group-hover:translate-x-1 group-hover:scale-110" />
            </div>

            {/* Title */}
            <h3 className={cn(
              "font-semibold text-foreground transition-colors duration-300 group-hover:text-primary",
              featured ? "text-xl" : "text-lg"
            )}>
              {project.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {project.description}
            </p>

            {/* Tech Stack */}
            {project.techStack.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {project.techStack.slice(0, 4).map((tech) => (
                  <span
                    key={tech}
                    className="px-2.5 py-1 rounded-full bg-muted/50 text-xs font-medium text-muted-foreground backdrop-blur-sm"
                  >
                    {tech}
                  </span>
                ))}
                {project.techStack.length > 4 && (
                  <span className="px-2.5 py-1 rounded-full bg-muted/50 text-xs font-medium text-muted-foreground">
                    +{project.techStack.length - 4}
                  </span>
                )}
              </div>
            )}

            {/* Live link indicator */}
            {project.liveUrl && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 pt-2 border-t border-border/30">
                <ExternalLink className="h-3 w-3" />
                <span>Live project available</span>
              </div>
            )}
          </div>

          {/* Animated border glow on hover */}
          <div className="absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none">
            <div className="absolute inset-0 rounded-3xl border border-primary/50" />
            <div className="absolute inset-[-1px] rounded-3xl bg-gradient-to-r from-primary/20 via-transparent to-primary/20 animate-shimmer" />
          </div>
        </article>
      </Link>
    </div>
  );
}
