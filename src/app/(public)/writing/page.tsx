import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Writing",
  description: "Blog and writing — coming soon.",
};

export default function WritingPage() {
  return (
    <main className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Writing
      </h1>
      <p className="mt-4 max-w-md text-lg text-muted-foreground">
        The blog is coming soon. Check back later for articles on cybersecurity,
        cloud engineering, and web development.
      </p>
    </main>
  );
}
