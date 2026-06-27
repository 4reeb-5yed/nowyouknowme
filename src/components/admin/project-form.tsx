"use client";

import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc/client";
import { slugify } from "@/lib/utils";
import {
  projectCreateSchema,
  projectCategories,
  projectStatuses,
  type ProjectCreateInput,
} from "@/lib/validators/project";
import { Button } from "@/components/ui/button";

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription?: string | null;
  techStack: string[];
  category: (typeof projectCategories)[number];
  githubUrl?: string | null;
  liveUrl?: string | null;
  thumbnailUrl?: string | null;
  isFeatured: boolean;
  status: (typeof projectStatuses)[number];
}

interface ProjectFormProps {
  project?: Project;
  onSuccess?: () => void;
}

export function ProjectForm({ project, onSuccess }: ProjectFormProps) {
  const isEditMode = Boolean(project);

  const [title, setTitle] = useState(project?.title ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [description, setDescription] = useState(project?.description ?? "");
  const [longDescription, setLongDescription] = useState(
    project?.longDescription ?? ""
  );
  const [techStack, setTechStack] = useState(
    project?.techStack.join(", ") ?? ""
  );
  const [category, setCategory] = useState<(typeof projectCategories)[number]>(
    project?.category ?? "web"
  );
  const [githubUrl, setGithubUrl] = useState(project?.githubUrl ?? "");
  const [liveUrl, setLiveUrl] = useState(project?.liveUrl ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(
    project?.thumbnailUrl ?? ""
  );
  const [isFeatured, setIsFeatured] = useState(project?.isFeatured ?? false);
  const [status, setStatus] = useState<(typeof projectStatuses)[number]>(
    project?.status ?? "draft"
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManuallyEdited && !isEditMode) {
      setSlug(slugify(title));
    }
  }, [title, slugManuallyEdited, isEditMode]);

  const handleSlugChange = useCallback((value: string) => {
    setSlugManuallyEdited(true);
    setSlug(value);
  }, []);

  const createMutation = trpc.projects.create.useMutation({
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error) => {
      setServerError(error.message);
    },
  });

  const updateMutation = trpc.projects.update.useMutation({
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error) => {
      setServerError(error.message);
    },
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;

  function buildFormData(): ProjectCreateInput {
    const techStackArray = techStack
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    return {
      title,
      slug: slug || undefined,
      description,
      longDescription: longDescription || undefined,
      techStack: techStackArray,
      category,
      githubUrl: githubUrl || null,
      liveUrl: liveUrl || null,
      thumbnailUrl: thumbnailUrl || null,
      isFeatured,
      status,
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    const data = buildFormData();

    // Client-side validation
    const result = projectCreateSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path.join(".");
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    if (isEditMode && project) {
      updateMutation.mutate({ id: project.id, ...result.data });
    } else {
      createMutation.mutate(result.data);
    }
  }

  const inputClasses =
    "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500";
  const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300";
  const errorClasses = "mt-1 text-xs text-red-600 dark:text-red-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {serverError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {serverError}
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className={labelClasses}>
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClasses}
          placeholder="My Awesome Project"
        />
        {errors.title && <p className={errorClasses}>{errors.title}</p>}
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="slug" className={labelClasses}>
          Slug
        </label>
        <input
          id="slug"
          type="text"
          value={slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          className={inputClasses}
          placeholder="my-awesome-project"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Auto-generated from title. Edit manually to override.
        </p>
        {errors.slug && <p className={errorClasses}>{errors.slug}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className={labelClasses}>
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClasses}
          rows={2}
          placeholder="A short description of the project"
        />
        {errors.description && (
          <p className={errorClasses}>{errors.description}</p>
        )}
      </div>

      {/* Long Description */}
      <div>
        <label htmlFor="longDescription" className={labelClasses}>
          Long Description
        </label>
        <textarea
          id="longDescription"
          value={longDescription}
          onChange={(e) => setLongDescription(e.target.value)}
          className={inputClasses}
          rows={5}
          placeholder="Detailed description with markdown support"
        />
        {errors.longDescription && (
          <p className={errorClasses}>{errors.longDescription}</p>
        )}
      </div>

      {/* Tech Stack */}
      <div>
        <label htmlFor="techStack" className={labelClasses}>
          Tech Stack
        </label>
        <input
          id="techStack"
          type="text"
          value={techStack}
          onChange={(e) => setTechStack(e.target.value)}
          className={inputClasses}
          placeholder="React, TypeScript, Node.js"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Comma-separated list of technologies
        </p>
        {errors.techStack && (
          <p className={errorClasses}>{errors.techStack}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className={labelClasses}>
          Category <span className="text-red-500">*</span>
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) =>
            setCategory(e.target.value as (typeof projectCategories)[number])
          }
          className={inputClasses}
        >
          {projectCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className={errorClasses}>{errors.category}</p>
        )}
      </div>

      {/* GitHub URL */}
      <div>
        <label htmlFor="githubUrl" className={labelClasses}>
          GitHub URL
        </label>
        <input
          id="githubUrl"
          type="url"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          className={inputClasses}
          placeholder="https://github.com/user/repo"
        />
        {errors.githubUrl && (
          <p className={errorClasses}>{errors.githubUrl}</p>
        )}
      </div>

      {/* Live URL */}
      <div>
        <label htmlFor="liveUrl" className={labelClasses}>
          Live URL
        </label>
        <input
          id="liveUrl"
          type="url"
          value={liveUrl}
          onChange={(e) => setLiveUrl(e.target.value)}
          className={inputClasses}
          placeholder="https://myproject.com"
        />
        {errors.liveUrl && <p className={errorClasses}>{errors.liveUrl}</p>}
      </div>

      {/* Thumbnail URL */}
      <div>
        <label htmlFor="thumbnailUrl" className={labelClasses}>
          Thumbnail URL
        </label>
        <input
          id="thumbnailUrl"
          type="url"
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
          className={inputClasses}
          placeholder="https://cdn.example.com/thumb.jpg"
        />
        {errors.thumbnailUrl && (
          <p className={errorClasses}>{errors.thumbnailUrl}</p>
        )}
      </div>

      {/* Featured & Status row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Is Featured */}
        <div className="flex items-center gap-2">
          <input
            id="isFeatured"
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isFeatured" className={labelClasses}>
            Featured Project
          </label>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className={labelClasses}>
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as (typeof projectStatuses)[number])
            }
            className={inputClasses}
          >
            {projectStatuses.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          {errors.status && (
            <p className={errorClasses}>{errors.status}</p>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? isEditMode
              ? "Updating..."
              : "Creating..."
            : isEditMode
              ? "Update Project"
              : "Create Project"}
        </Button>
      </div>
    </form>
  );
}
