"use client";

import { useCallback, useEffect, useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Highlighter,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code2,
  Link as LinkIcon,
  Link2Off,
  Undo2,
  Redo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ToolbarProps {
  editor: Editor | null;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  isDisabled?: boolean;
  tooltip: string;
  shortcut?: string;
  children: React.ReactNode;
}

// ─── ToolbarButton ────────────────────────────────────────────────────────────

function ToolbarButton({
  onClick,
  isActive = false,
  isDisabled = false,
  tooltip,
  shortcut,
  children,
}: ToolbarButtonProps) {
  const title = shortcut ? `${tooltip} (${shortcut})` : tooltip;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Prevent the editor from losing focus when clicking toolbar buttons
      e.preventDefault();
      if (!isDisabled) onClick();
    },
    [onClick, isDisabled]
  );

  return (
    <Button
      type="button"
      variant={isActive ? "default" : "ghost"}
      size="icon"
      aria-label={title}
      title={title}
      disabled={isDisabled}
      aria-pressed={isActive}
      onMouseDown={handleMouseDown}
      className="h-8 w-8 shrink-0"
    >
      {children}
    </Button>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function Divider() {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      className="mx-1 h-6 w-px self-center bg-border"
    />
  );
}

// ─── Toolbar ──────────────────────────────────────────────────────────────────

export function Toolbar({ editor }: ToolbarProps) {
  // Force a re-render whenever the editor selection or marks change so that
  // active states stay in sync with the cursor position.
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (!editor) return;

    const update = () => forceUpdate((n) => n + 1);

    editor.on("selectionUpdate", update);
    editor.on("transaction", update);

    return () => {
      editor.off("selectionUpdate", update);
      editor.off("transaction", update);
    };
  }, [editor]);

  // ── Link helpers ────────────────────────────────────────────────────────────

  const handleLinkToggle = useCallback(() => {
    if (!editor) return;

    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    const url = window.prompt("Enter URL:", "https://");
    if (!url) return;

    editor.chain().focus().setLink({ href: url, target: "_blank" }).run();
  }, [editor]);

  // ── Guard ───────────────────────────────────────────────────────────────────

  if (!editor) return null;

  const cmd = (fn: () => void) => () => fn();

  return (
    <div
      role="toolbar"
      aria-label="Text formatting"
      className="flex flex-wrap items-center gap-0.5 border-b border-border bg-background px-2 py-1.5"
    >
      {/* ── History ─────────────────────────────────────────── */}
      <ToolbarButton
        tooltip="Undo"
        shortcut="Ctrl+Z"
        isDisabled={!editor.can().undo()}
        onClick={cmd(() => editor.chain().focus().undo().run())}
      >
        <Undo2 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        tooltip="Redo"
        shortcut="Ctrl+Y"
        isDisabled={!editor.can().redo()}
        onClick={cmd(() => editor.chain().focus().redo().run())}
      >
        <Redo2 className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      {/* ── Inline formatting ────────────────────────────────── */}
      <ToolbarButton
        tooltip="Bold"
        shortcut="Ctrl+B"
        isActive={editor.isActive("bold")}
        isDisabled={!editor.can().toggleBold()}
        onClick={cmd(() => editor.chain().focus().toggleBold().run())}
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        tooltip="Italic"
        shortcut="Ctrl+I"
        isActive={editor.isActive("italic")}
        isDisabled={!editor.can().toggleItalic()}
        onClick={cmd(() => editor.chain().focus().toggleItalic().run())}
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        tooltip="Underline"
        shortcut="Ctrl+U"
        isActive={editor.isActive("underline")}
        isDisabled={!editor.can().toggleUnderline()}
        onClick={cmd(() => editor.chain().focus().toggleUnderline().run())}
      >
        <UnderlineIcon className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        tooltip="Highlight"
        isActive={editor.isActive("highlight")}
        onClick={cmd(() => editor.chain().focus().toggleHighlight().run())}
      >
        <Highlighter className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      {/* ── Headings ─────────────────────────────────────────── */}
      <ToolbarButton
        tooltip="Heading 1"
        shortcut="Ctrl+Alt+1"
        isActive={editor.isActive("heading", { level: 1 })}
        onClick={cmd(() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        )}
      >
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        tooltip="Heading 2"
        shortcut="Ctrl+Alt+2"
        isActive={editor.isActive("heading", { level: 2 })}
        onClick={cmd(() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        )}
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      {/* ── Lists ────────────────────────────────────────────── */}
      <ToolbarButton
        tooltip="Bullet list"
        isActive={editor.isActive("bulletList")}
        onClick={cmd(() => editor.chain().focus().toggleBulletList().run())}
      >
        <List className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        tooltip="Numbered list"
        isActive={editor.isActive("orderedList")}
        onClick={cmd(() => editor.chain().focus().toggleOrderedList().run())}
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      {/* ── Blocks ───────────────────────────────────────────── */}
      <ToolbarButton
        tooltip="Blockquote"
        isActive={editor.isActive("blockquote")}
        onClick={cmd(() => editor.chain().focus().toggleBlockquote().run())}
      >
        <Quote className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        tooltip="Code block"
        isActive={editor.isActive("codeBlock")}
        onClick={cmd(() => editor.chain().focus().toggleCodeBlock().run())}
      >
        <Code2 className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      {/* ── Alignment ────────────────────────────────────────── */}
      <ToolbarButton
        tooltip="Align left"
        isActive={editor.isActive({ textAlign: "left" })}
        onClick={cmd(() => editor.chain().focus().setTextAlign("left").run())}
      >
        <AlignLeft className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        tooltip="Align center"
        isActive={editor.isActive({ textAlign: "center" })}
        onClick={cmd(() => editor.chain().focus().setTextAlign("center").run())}
      >
        <AlignCenter className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        tooltip="Align right"
        isActive={editor.isActive({ textAlign: "right" })}
        onClick={cmd(() => editor.chain().focus().setTextAlign("right").run())}
      >
        <AlignRight className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      {/* ── Insert ───────────────────────────────────────────── */}
      <ToolbarButton
        tooltip={editor.isActive("link") ? "Remove link" : "Insert link"}
        shortcut="Ctrl+K"
        isActive={editor.isActive("link")}
        onClick={handleLinkToggle}
      >
        {editor.isActive("link") ? (
          <Link2Off className="h-4 w-4" />
        ) : (
          <LinkIcon className="h-4 w-4" />
        )}
      </ToolbarButton>
    </div>
  );
}