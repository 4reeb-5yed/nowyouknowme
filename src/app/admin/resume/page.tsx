"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function ResumePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();

  // Queries
  const {
    data: activeResume,
    isLoading: isLoadingActive,
    isError: isActiveError,
    error: activeError,
  } = trpc.resume.getActive.useQuery();

  const {
    data: allResumes,
    isLoading: isLoadingAll,
    isError: isAllError,
    error: allError,
  } = trpc.resume.listAll.useQuery();

  // Mutations
  const createMutation = trpc.resume.create.useMutation({
    onSuccess: () => {
      utils.resume.getActive.invalidate();
      utils.resume.listAll.invalidate();
      toast.success("Resume uploaded and activated");
    },
    onError: (err) => {
      toast.error("Failed to save resume", { description: err.message });
    },
  });

  const setActiveMutation = trpc.resume.setActive.useMutation({
    onSuccess: () => {
      utils.resume.getActive.invalidate();
      utils.resume.listAll.invalidate();
      toast.success("Resume activated successfully");
    },
    onError: (err) => {
      toast.error("Failed to activate resume", { description: err.message });
    },
  });

  // Handlers
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValidationError(null);

    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (file.type !== "application/pdf") {
      setValidationError("Only PDF files are accepted.");
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setValidationError(
        `File size exceeds ${MAX_FILE_SIZE_MB}MB limit. Selected file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`
      );
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  }

  async function handleUpload() {
    if (!selectedFile) return;

    setIsUploading(true);

    try {
      // 1. Upload file to R2 via the API route
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("folder", "resumes");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Upload failed");
      }

      const { url } = (await res.json()) as { url: string };

      // 2. Save the URL to the database and mark as active
      await createMutation.mutateAsync({ fileUrl: url });

      // 3. Reset form
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      toast.error("Upload failed", { description: message });
    } finally {
      setIsUploading(false);
    }
  }

  function handleSetActive(id: string) {
    setActiveMutation.mutate({ id });
  }

  function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Loading state
  if (isLoadingActive || isLoadingAll) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden="true" />
        <p className="mt-3 text-sm text-muted-foreground">
          Loading resume data...
        </p>
      </div>
    );
  }

  // Error state
  if (isActiveError || isAllError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <AlertCircle className="mx-auto size-6 text-destructive" aria-hidden="true" />
        <p className="mt-2 text-sm font-medium text-destructive">
          Failed to load resume data
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {activeError?.message ?? allError?.message ?? "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Resume
        </h1>
        <p className="mt-2 text-muted-foreground">
          Upload and manage your resume file. Set which version is active for
          public download.
        </p>
      </div>

      {/* Active Resume Section */}
      <section className="rounded-lg border border-border bg-background p-6">
        <h2 className="text-lg font-semibold text-foreground">
          Active Resume
        </h2>
        {activeResume ? (
          <div className="mt-4 flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
              <FileText className="size-5 text-primary" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {activeResume.fileUrl}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Uploaded: {formatDate(activeResume.uploadedAt)}
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 dark:bg-green-900/30">
              <CheckCircle2 className="size-3.5 text-green-600 dark:text-green-400" aria-hidden="true" />
              <span className="text-xs font-medium text-green-700 dark:text-green-300">
                Active
              </span>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            No active resume. Upload one below to get started.
          </p>
        )}
      </section>

      {/* Upload Section */}
      <section className="rounded-lg border border-border bg-background p-6">
        <h2 className="text-lg font-semibold text-foreground">
          Upload New Resume
        </h2>
        <p className="mt-1 text-sm text-muted-foreground" id="resume-file-help">
          Accepts PDF files up to {MAX_FILE_SIZE_MB}MB.
        </p>

        <div className="mt-4 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label
                htmlFor="resume-file-input"
                className="block text-sm font-medium text-foreground"
              >
                Select PDF file
              </label>
              <input
                ref={fileInputRef}
                id="resume-file-input"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                disabled={isUploading}
                className="mt-1.5 block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20 disabled:opacity-50"
                aria-invalid={validationError ? true : undefined}
                aria-describedby={
                  validationError ? "resume-file-error resume-file-help" : "resume-file-help"
                }
              />
            </div>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              size="default"
            >
              {isUploading ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  <span className="ml-1.5">Uploading…</span>
                </>
              ) : (
                <>
                  <Upload className="size-4" aria-hidden="true" />
                  <span className="ml-1.5">Upload</span>
                </>
              )}
            </Button>
          </div>

          {/* Validation error */}
          {validationError && (
            <div id="resume-file-error" role="alert" className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
              <AlertCircle className="size-4 shrink-0 text-destructive" aria-hidden="true" />
              <p className="text-sm text-destructive">{validationError}</p>
            </div>
          )}

          {/* Selected file preview */}
          {selectedFile && !isUploading && (
            <p className="text-sm text-muted-foreground">
              Selected: <span className="font-medium">{selectedFile.name}</span>{" "}
              ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
            </p>
          )}
        </div>
      </section>

      {/* All Resumes Section */}
      <section className="rounded-lg border border-border bg-background p-6">
        <h2 className="text-lg font-semibold text-foreground">
          Resume History
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          All uploaded resumes. You can re-activate any previous version.
        </p>

        {allResumes && allResumes.length > 0 ? (
          <div className="mt-4 divide-y divide-border rounded-md border border-border">
            {allResumes.map((resume) => (
              <div
                key={resume.id}
                className="flex items-center gap-4 px-4 py-3"
              >
                <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">
                    {resume.fileUrl}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(resume.uploadedAt)}
                  </p>
                </div>
                {resume.isActive ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    <CheckCircle2 className="size-3" aria-hidden="true" />
                    Active
                  </span>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetActive(resume.id)}
                    disabled={setActiveMutation.isPending}
                  >
                    {setActiveMutation.isPending ? (
                      <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                    ) : (
                      "Set Active"
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            No resumes uploaded yet.
          </p>
        )}
      </section>
    </div>
  );
}