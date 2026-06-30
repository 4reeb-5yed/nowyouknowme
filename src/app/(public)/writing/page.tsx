import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Writing",
  description: "Blog and writing — coming soon.",
};

export default function WritingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Premium animated background */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-section" />
        <div className="aurora aurora-1" />
        <div className="aurora aurora-2" />
        <div className="aurora aurora-3" />
      </div>

      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Writing
        </h1>
        <p className="mt-4 max-w-md text-lg text-muted-foreground">
          The blog is coming soon. Check back later for articles on cybersecurity,
          cloud engineering, and web development.
        </p>
      </div>
    </main>
  );
}
