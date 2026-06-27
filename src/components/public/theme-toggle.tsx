"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const themes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  // Hydration guard: only render after mount to prevent mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on outside click or escape
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-theme-toggle]")) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [open]);

  if (!mounted) {
    // Render a placeholder with the same dimensions to prevent layout shift
    return (
      <Button
        variant="ghost"
        size="icon"
        disabled
        aria-label="Toggle theme"
      >
        <span className="size-4" />
      </Button>
    );
  }

  const currentIcon = resolvedTheme === "dark" ? Moon : Sun;
  const CurrentIcon = currentIcon;

  return (
    <div className="relative" data-theme-toggle>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Toggle theme"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <CurrentIcon className="size-4" aria-hidden="true" />
      </Button>

      {open && (
        <div
          role="menu"
          aria-label="Theme options"
          className={cn(
            "absolute right-0 top-full z-50 mt-2 min-w-[8rem] overflow-hidden rounded-lg border border-border bg-background p-1 shadow-md",
            "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95"
          )}
        >
          {themes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              role="menuitem"
              onClick={() => {
                setTheme(value);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors",
                "hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
                theme === value && "bg-muted font-medium"
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
