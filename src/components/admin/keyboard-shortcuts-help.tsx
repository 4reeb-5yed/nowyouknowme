"use client";

import { X, Keyboard } from "lucide-react";

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const shortcuts = [
  {
    category: "Navigation",
    items: [
      { keys: ["⌘", "K"], description: "Open command palette" },
      { keys: ["⌘", "/"], description: "Show keyboard shortcuts" },
      { keys: ["Esc"], description: "Close modal / Go back" },
    ],
  },
  {
    category: "Content Editing",
    items: [
      { keys: ["⌘", "S"], description: "Save current form" },
      { keys: ["⌘", "Enter"], description: "Save and continue editing" },
      { keys: ["⌘", "Z"], description: "Undo change" },
      { keys: ["⌘", "Shift", "Z"], description: "Redo change" },
    ],
  },
  {
    category: "General",
    items: [
      { keys: ["?"], description: "Show this help dialog" },
      { keys: ["Tab"], description: "Move to next field" },
      { keys: ["Shift", "Tab"], description: "Move to previous field" },
    ],
  },
];

export function KeyboardShortcutsHelp({
  open,
  onOpenChange,
}: KeyboardShortcutsHelpProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        className="relative w-full max-w-lg rounded-xl border border-border bg-background shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <Keyboard className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <h2
              id="shortcuts-title"
              className="text-lg font-semibold text-foreground"
            >
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          <div className="space-y-6">
            {shortcuts.map((section) => (
              <div key={section.category}>
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  {section.category}
                </h3>
                <div className="space-y-2">
                  {section.items.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-1.5"
                    >
                      <span className="text-sm text-foreground">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span key={keyIndex} className="flex items-center gap-0.5">
                            <kbd className="min-w-[1.5rem] rounded border border-border bg-muted px-2 py-1 text-center text-xs font-medium text-foreground">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-muted-foreground text-xs">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4">
          <p className="text-xs text-muted-foreground">
            Press <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium">?</kbd> anytime to show this dialog.
          </p>
        </div>
      </div>
    </div>
  );
}
