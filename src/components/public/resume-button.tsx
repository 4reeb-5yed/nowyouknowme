import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ResumeButtonProps {
  resumeUrl: string | null;
  className?: string;
}

/**
 * ResumeButton renders a prominent download button for the owner's resume.
 * If no active resume URL is provided, the component renders nothing.
 * Opens the PDF in a new tab with secure attributes.
 */
export function ResumeButton({ resumeUrl, className }: ResumeButtonProps) {
  if (!resumeUrl) {
    return null;
  }

  return (
    <a
      href={resumeUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Download resume (opens in new tab)"
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      <span>Download Resume</span>
    </a>
  );
}
