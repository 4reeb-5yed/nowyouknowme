import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";

export const editorExtensions = [
  StarterKit.configure(),

  Underline,

  Highlight,

  Link.configure({
    openOnClick: false,
    autolink: true,
    defaultProtocol: "https",
  }),

  Placeholder.configure({
    placeholder: "Start writing...",
  }),

  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
];