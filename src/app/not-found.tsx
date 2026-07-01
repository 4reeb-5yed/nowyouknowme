import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      {/* Large 404 watermark */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none" aria-hidden="true">
        <span 
          className="text-[20rem] font-bold text-muted-foreground/5 select-none"
          style={{ transform: 'rotate(-12deg)' }}
        >
          404
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Animated code block decoration */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-medium">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-muted-foreground">Error 404</span>
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
          Page not found
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist, has been moved, 
          or you might have a typo in the URL.
        </p>

        {/* Code snippet decoration */}
        <div className="mb-10 text-left max-w-md mx-auto">
          <div className="rounded-lg border bg-card overflow-hidden">
            <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="ml-2 text-xs text-muted-foreground">console.log</span>
            </div>
            <div className="p-4 font-mono text-sm">
              <p className="text-muted-foreground">// Trying to find page...</p>
              <p className="text-foreground"><span className="text-blue-500">const</span> page = <span className="text-amber-500">await</span> findPage(url);</p>
              <p className="text-red-500">✗ Page not found</p>
              <p className="text-muted-foreground mt-2">// Maybe try the homepage?</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/" className={buttonVariants({ variant: "default" })}>
            <Home className="mr-2 h-4 w-4" />
            Go to Homepage
          </Link>
          <Link href="/" className={buttonVariants({ variant: "ghost" })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Take me back
          </Link>
        </div>
      </div>
    </div>
  );
}
