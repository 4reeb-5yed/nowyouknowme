"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import "@/styles/admin.css";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Link2,
  Briefcase,
  Award,
  FileDown,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Keyboard,
  ChevronDown,
  Image,
  History,
  Eye,
  Globe,
  Layers,
  Code2,
  Mail,
  User,
  Star,
} from "lucide-react";

import { TRPCProvider } from "@/lib/trpc/provider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { CommandPalette } from "@/components/admin/command-palette";
import { KeyboardShortcutsHelp } from "@/components/admin/keyboard-shortcuts-help";
import { LivePreview } from "@/components/admin/live-preview";

// Frequent items - commonly used content management
const frequentNavItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Overview & quick actions" },
  { href: "/admin/site-settings", label: "Site Settings", icon: Settings, description: "Homepage, Hero, SEO, Footer" },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban, description: "Portfolio projects" },
  { href: "/admin/experience", label: "Experience", icon: Briefcase, description: "Work history" },
  { href: "/admin/certifications", label: "Certifications", icon: Award, description: "Credentials & badges" },
];

// Content items - section-specific content
const contentNavItems = [
  { href: "/admin/pages", label: "Sections Content", icon: FileText, description: "About, Skills, Contact text" },
  { href: "/admin/social-links", label: "Social Links", icon: Link2, description: "Social profiles" },
];

// Advanced items - niche configuration
const advancedNavItems = [
  { href: "/admin/site-config", label: "Advanced Config", icon: Settings, description: "Theme, colors, advanced" },
  { href: "/admin/media", label: "Media Library", icon: Image, description: "Images & files" },
  { href: "/admin/resume", label: "Resume", icon: FileDown, description: "Downloadable CV" },
  { href: "/admin/revisions", label: "Revisions", icon: History, description: "Change history" },
];

// All nav items combined for breadcrumb lookup
const allNavItems = [...frequentNavItems, ...contentNavItems, ...advancedNavItems];

function getPageTitle(pathname: string): string {
  const item = allNavItems.find(nav => nav.href === pathname);
  return item?.label ?? "Page";
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);
  
  // Live preview state
  const [previewKey, setPreviewKey] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const openPreview = useCallback(() => setIsPreviewOpen(true), []);
  const closePreview = useCallback(() => setIsPreviewOpen(false), []);
  const refreshPreview = useCallback(() => setPreviewKey((k) => k + 1), []);
  const generatePreviewUrl = useCallback(() => "/", []);

  // Don't render the sidebar shell for the login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open command palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      // Cmd/Ctrl + / to show shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setShortcutsHelpOpen(true);
      }
      // Escape to close modals
      if (e.key === "Escape") {
        setCommandPaletteOpen(false);
        setShortcutsHelpOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <TRPCProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-200 lg:static lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Sidebar header */}
          <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
            <Link
              href="/admin/dashboard"
              className="text-lg font-semibold text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded-md"
            >
              CMS
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-md p-1 text-sidebar-foreground hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="CMS navigation">
            {/* Frequent Section */}
            <div className="mb-6">
              <h3 className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                Frequent
              </h3>
              <div className="space-y-1">
                {frequentNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Content Section */}
            <div className="mb-6">
              <h3 className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                Content
              </h3>
              <div className="space-y-1">
                {contentNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Advanced Section */}
            <div>
              <h3 className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                Advanced
              </h3>
              <div className="space-y-1">
                {advancedNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Keyboard shortcuts hint */}
          <div className="border-t border-sidebar-border p-3 space-y-2">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <Search className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Search...</span>
              <kbd className="ml-auto rounded bg-sidebar-accent px-1.5 py-0.5 text-[10px] font-medium">
                ⌘K
              </kbd>
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top bar */}
          <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-md p-1 text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* Desktop breadcrumb / title area */}
            <div className="hidden lg:flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Admin</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground rotate-90" aria-hidden="true" />
              <span className="font-medium">
                {getPageTitle(pathname)}
              </span>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* Search button (desktop) */}
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="hidden lg:flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                <span>Search...</span>
                <kbd className="ml-4 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                  ⌘K
                </kbd>
              </button>

              {/* Keyboard shortcuts button */}
              <button
                onClick={() => setShortcutsHelpOpen(true)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                aria-label="Keyboard shortcuts"
                title="Keyboard shortcuts"
              >
                <Keyboard className="h-5 w-5" aria-hidden="true" />
              </button>

              {/* Live Preview button */}
              <button
                onClick={openPreview}
                className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                aria-label="Live Preview"
                title="Live Preview"
              >
                <Eye className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>

        {/* Command Palette */}
        <CommandPalette 
          open={commandPaletteOpen} 
          onOpenChange={setCommandPaletteOpen} 
        />

        {/* Keyboard Shortcuts Help Modal */}
        <KeyboardShortcutsHelp 
          open={shortcutsHelpOpen} 
          onOpenChange={setShortcutsHelpOpen} 
        />

        {/* Live Preview Modal */}
        <LivePreview
          url={generatePreviewUrl()}
          isActive={isPreviewOpen}
          onClose={closePreview}
          onRefresh={refreshPreview}
          className="preview-container"
        />

        {/* Toast notifications */}
        <Toaster />
      </div>
    </TRPCProvider>
  );
}
