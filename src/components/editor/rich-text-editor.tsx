"use client";

import { Toolbar } from "./toolbar";
import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect } from "react";

import { editorExtensions } from "./extensions";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function RichTextEditor({
  value,
  onChange,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: editorExtensions,
    content: value,
    immediatelyRender: false,

    editorProps: {
      attributes: {
        class:
          "min-h-[450px] rounded-lg border border-border bg-background px-4 py-3 focus:outline-none prose dark:prose-invert max-w-none",
      },
    },

    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    if (editor.getHTML() !== value) {
      editor.commands.setContent(value, {
        emitUpdate: false,
      });
    }
  }, [editor, value]);

  if (!editor) return null;

 return (
  <div className="overflow-hidden rounded-lg border border-border bg-background">
    <Toolbar editor={editor} />

    <EditorContent editor={editor} />
  </div>
);
}