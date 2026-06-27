import { PageTransition } from "@/components/page-transition";

/**
 * Template for the (public) route group.
 * Unlike layout.tsx, template.tsx re-mounts on every navigation,
 * which triggers the entry animation on each page change.
 */
export default function PublicTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageTransition>{children}</PageTransition>;
}
