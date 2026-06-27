import Link from "next/link";

export default function ProjectNotFound() {
  return (
    <main className="container mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-12 text-center">
      <h1 className="mb-4 text-4xl font-bold tracking-tight">
        Project Not Found
      </h1>
      <p className="mb-8 text-lg text-muted-foreground">
        The project you&apos;re looking for doesn&apos;t exist or is not
        currently published.
      </p>
      <Link
        href="/projects"
        className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        ← Browse All Projects
      </Link>
    </main>
  );
}
