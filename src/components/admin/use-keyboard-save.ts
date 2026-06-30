"use client";

import { useEffect, useCallback } from "react";

/**
 * Hook to handle Cmd/Ctrl+S keyboard shortcut for saving forms.
 * Automatically focuses on save buttons and triggers save.
 */
export function useKeyboardSave(onSave: () => void, enabled: boolean = true) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        onSave();
      }
    },
    [onSave]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, enabled]);
}

/**
 * Hook to handle Cmd/Ctrl+Enter for save and continue editing.
 */
export function useKeyboardSaveAndContinue(onSaveAndContinue: () => void, enabled: boolean = true) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        onSaveAndContinue();
      }
    },
    [onSaveAndContinue]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, enabled]);
}

/**
 * Combined hook for both save shortcuts.
 */
export function useFormShortcuts(
  onSave: () => void,
  onSaveAndContinue?: () => void,
  enabled: boolean = true
) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        onSave();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && onSaveAndContinue) {
        e.preventDefault();
        onSaveAndContinue();
      }
    },
    [onSave, onSaveAndContinue]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, enabled]);
}
