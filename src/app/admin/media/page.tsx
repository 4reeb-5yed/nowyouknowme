"use client";

import { MediaLibrary } from "@/components/admin/media-library";

export default function MediaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Media Library
        </h1>
        <p className="mt-2 text-muted-foreground">
          Upload and manage images, documents, and other files for your portfolio.
        </p>
      </div>
      <MediaLibrary />
    </div>
  );
}
