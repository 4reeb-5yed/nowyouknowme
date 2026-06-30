"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import {
  Search,
  FolderKanban,
  FileText,
  Briefcase,
  Award,
  Link2,
  Settings,
  FileDown,
  ExternalLink,
  ArrowRight,
  Loader2,
  Image,
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NavCommand {
  id: string;
  type: "navigation";
  title: string;
  description: string;
  icon: React.ReactNode;
  url: string;
}

interface SearchResult {
  id: string;
  type: "search-result";
  title: string;
  description: string;
  url: string;
  adminUrl: string;
  sourceType: string;
}

type Command = NavCommand | SearchResult;

const NAV_COMMANDS: NavCommand[] = [
  {
    id: "nav-dashboard",
    type: "navigation",
    title: "Dashboard",
    description: "View dashboard overview",
    icon: <Search className="h-4 w-4" />,
    url: "/admin/dashboard",
  },
  {
    id: "nav-projects",
    type: "navigation",
    title: "Projects",
    description: "Manage portfolio projects",
    icon: <FolderKanban className="h-4 w-4" />,
    url: "/admin/projects",
  },
  {
    id: "nav-pages",
    type: "navigation",
    title: "Pages",
    description: "Edit page content (About, Skills, Contact)",
    icon: <FileText className="h-4 w-4" />,
    url: "/admin/pages",
  },
  {
    id: "nav-experience",
    type: "navigation",
    title: "Experience",
    description: "Manage work experience",
    icon: <Briefcase className="h-4 w-4" />,
    url: "/admin/experience",
  },
  {
    id: "nav-certifications",
    type: "navigation",
    title: "Certifications",
    description: "Manage certifications & credentials",
    icon: <Award className="h-4 w-4" />,
    url: "/admin/certifications",
  },
  {
    id: "nav-social-links",
    type: "navigation",
    title: "Social Links",
    description: "Manage social media links",
    icon: <Link2 className="h-4 w-4" />,
    url: "/admin/social-links",
  },
  {
    id: "nav-resume",
    type: "navigation",
    title: "Resume",
    description: "Manage resume uploads",
    icon: <FileDown className="h-4 w-4" />,
    url: "/admin/resume",
  },
  {
    id: "nav-media",
    type: "navigation",
    title: "Media Library",
    description: "Manage uploaded files and images",
    icon: <Image className="h-4 w-4" />,
    url: "/admin/media",
  },
  {
    id: "nav-site-config",
    type: "navigation",
    title: "Site Config",
    description: "Configure theme, SEO, and settings",
    icon: <Settings className="h-4 w-4" />,
    url: "/admin/site-config",
  },
  {
    id: "view-site",
    type: "navigation",
    title: "View Site",
    description: "Open your public portfolio site",
    icon: <ExternalLink className="h-4 w-4" />,
    url: "/",
  },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Search query
  const { data: searchResults, isLoading } = trpc.search.quick.useQuery(
    { query },
    {
      enabled: query.length >= 2,
    }
  );

  // Filter navigation commands based on query
  const filteredNavCommands = NAV_COMMANDS.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(query.toLowerCase()) ||
      cmd.description.toLowerCase().includes(query.toLowerCase())
  );

  // Combine results
  const searchResultsFormatted: SearchResult[] =
    searchResults?.results.map((result) => ({
      id: `${result.type}-${result.id}`,
      type: "search-result",
      title: result.title,
      description: result.subtitle ?? result.type,
      url: result.url ?? "",
      adminUrl: result.url,
      sourceType: result.type,
    })) ?? [];

  // All commands (navigation first, then search results)
  const allCommands: Command[] = query.length >= 2
    ? [...filteredNavCommands, ...searchResultsFormatted]
    : filteredNavCommands;

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, searchResults]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.querySelector(
        `[data-selected="true"]`
      ) as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < allCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : allCommands.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (allCommands[selectedIndex]) {
            const cmd = allCommands[selectedIndex];
            if ("url" in cmd) {
              onOpenChange(false);
              router.push(cmd.url);
            }
          }
          break;
        case "Escape":
          e.preventDefault();
          onOpenChange(false);
          break;
      }
    },
    [allCommands, selectedIndex, onOpenChange, router]
  );

  const handleSelect = useCallback(
    (cmd: Command) => {
      if ("url" in cmd) {
        onOpenChange(false);
        router.push(cmd.url);
      }
    },
    [onOpenChange, router]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        className="relative w-full max-w-xl rounded-xl border border-border bg-background shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, projects, or type a command..."
            className="h-14 w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
            aria-label="Search"
            aria-autocomplete="list"
            aria-controls="command-list"
          />
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" aria-hidden="true" />
          )}
          <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border border-border bg-muted px-2 text-xs text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          id="command-list"
          className="max-h-80 overflow-y-auto p-2"
          role="listbox"
          aria-label="Search results"
        >
          {allCommands.length === 0 && query.length >= 2 && !isLoading && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No results found for &quot;{query}&quot;
            </div>
          )}

          {filteredNavCommands.length > 0 && query.length >= 2 && (
            <>
              <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                Navigation
              </div>
              {filteredNavCommands.map((cmd, index) => (
                <CommandItem
                  key={cmd.id}
                  command={cmd}
                  isSelected={selectedIndex === index}
                  onSelect={() => handleSelect(cmd)}
                />
              ))}
            </>
          )}

          {searchResultsFormatted.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                Search Results
              </div>
              {searchResultsFormatted.map((result, index) => (
                <CommandItem
                  key={result.id}
                  command={result}
                  isSelected={selectedIndex === filteredNavCommands.length + index}
                  onSelect={() => handleSelect(result)}
                  badge={result.sourceType}
                />
              ))}
            </>
          )}

          {query.length < 2 && (
            <>
              <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                Quick Navigation
              </div>
              {filteredNavCommands.slice(0, 6).map((cmd, index) => (
                <CommandItem
                  key={cmd.id}
                  command={cmd}
                  isSelected={selectedIndex === index}
                  onSelect={() => handleSelect(cmd)}
                />
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">↑</kbd>
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">↓</kbd>
              <span className="ml-1">navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">↵</kbd>
              <span className="ml-1">select</span>
            </span>
          </div>
          <span>Type to search all content</span>
        </div>
      </div>
    </div>
  );
}

function CommandItem({
  command,
  isSelected,
  onSelect,
  badge,
}: {
  command: Command;
  isSelected: boolean;
  onSelect: () => void;
  badge?: string;
}) {
  return (
    <button
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
        isSelected
          ? "bg-accent text-accent-foreground"
          : "hover:bg-accent/50"
      }`}
      role="option"
      aria-selected={isSelected}
      data-selected={isSelected}
    >
      <span className="text-muted-foreground shrink-0">
        {"icon" in command ? command.icon : <Search className="h-4 w-4" />}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{command.title}</span>
          {badge && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {command.description}
        </p>
      </div>
      {isSelected && (
        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
      )}
    </button>
  );
}
