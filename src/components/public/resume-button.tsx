import { Download } from "lucide-react";

export interface ResumeButtonProps {
  resumeUrl: string | null;
}

/**
 * ResumeButton renders a prominent download button for the owner's resume.
 * If no active resume URL is provided, the component renders nothing.
 * Opens the PDF in a new tab with secure attributes.
 */
export function ResumeButton({ resumeUrl }: ResumeButtonProps) {
  if (!resumeUrl) {
    return null;
  }

  return (
    <a
      href={resumeUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Download resume (opens in new tab)"
      className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      <span>Download Resume</span>
    </a>
  );
}
