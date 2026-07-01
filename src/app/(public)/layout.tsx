"use client";

import { SiteHeader } from "@/components/public/site-header-v3";
import { SiteFooter } from "@/components/public/site-footer-v3";
import { ScrollProgress } from "@/components/public/scroll-progress";
import { GrainOverlay } from "@/components/public/grain-overlay";
import { TRPCProvider } from "@/lib/trpc/provider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TRPCProvider>
      <ScrollProgress />
      <GrainOverlay />
      <div className="flex min-h-screen flex-col">
        {/* Skip to main content link for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-md focus:ring-2 focus:ring-ring"
        >
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </div>
    </TRPCProvider>
  );
}
