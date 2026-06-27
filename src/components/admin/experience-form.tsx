"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import { experienceCreateSchema } from "@/lib/validators/experience";
import { Button } from "@/components/ui/button";
import { type ExperienceItem } from "@/components/admin/experience-table";

export interface ExperienceFormProps {
  /** The experience entry being edited, or undefined when creating a new one. */
  experience?: ExperienceItem;
  /** Called after a successful create or update mutation. */
  onSuccess: () => void;
  /** The create mutation owned by the parent page. */
  createMutation: ReturnType<typeof trpc.experience.create.useMutation>;
  /** The update mutation owned by the parent page. */
  updateMutation: ReturnType<typeof trpc.experience.update.useMutation>;
}

/**
 * ExperienceForm renders the create/edit form for a work experience entry.
 *
 * It manages local field state and performs client-side validation against the
 * shared {@link experienceCreateSchema} before invoking the create/update
 * mutations passed in by the parent page. The parent owns the mutations (and
 * their cache invalidation / toasts), keeping data-flow concerns out of this
 * component.
 */
export function ExperienceForm({
  experience,
  onSuccess,
  createMutation,
  updateMutation,
}: ExperienceFormProps) {
  const [companyName, setCompanyName] = useState(experience?.companyName ?? "");
  const [roleTitle, setRoleTitle] = useState(experience?.roleTitle ?? "");
  const [startDate, setStartDate] = useState(experience?.startDate ?? "");
  const [endDate, setEndDate] = useState(experience?.endDate ?? "");
  const [description, setDescription] = useState(experience?.description ?? "");
  const [techStack, setTechStack] = useState(experience?.techStack?.join(", ") ?? "");
  const [isVisible, setIsVisible] = useState(experience?.isVisible ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!experience;
  const isPending = createMutation.isPending || updateMutation.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const techStackArray = techStack
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const formData = {
      companyName,
      roleTitle,
      startDate,
      endDate: endDate || null,
      description: description || null,
      techStack: techStackArray,
      isVisible,
    };

    // Client-side validation mirrors the server-side schema.
    const result = experienceCreateSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join(".");
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    if (isEditing && experience) {
      updateMutation.mutate(
        { id: experience.id, ...result.data },
        { onSuccess }
      );
    } else {
      createMutation.mutate(result.data, { onSuccess });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Company Name */}
      <div>
        <label htmlFor="companyName" className="block text-sm font-medium text-foreground">
          Company Name <span className="text-destructive">*</span>
        </label>
        <input
          id="companyName"
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="e.g. Google"
          aria-required="true"
          aria-invalid={errors.companyName ? true : undefined}
          aria-describedby={errors.companyName ? "companyName-error" : undefined}
        />
        {errors.companyName && (
          <p id="companyName-error" role="alert" className="mt-1 text-xs text-destructive">
            {errors.companyName}
          </p>
        )}
      </div>

      {/* Role Title */}
      <div>
        <label htmlFor="roleTitle" className="block text-sm font-medium text-foreground">
          Role Title <span className="text-destructive">*</span>
        </label>
        <input
          id="roleTitle"
          type="text"
          value={roleTitle}
          onChange={(e) => setRoleTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="e.g. Senior Software Engineer"
          aria-required="true"
          aria-invalid={errors.roleTitle ? true : undefined}
          aria-describedby={errors.roleTitle ? "roleTitle-error" : undefined}
        />
        {errors.roleTitle && (
          <p id="roleTitle-error" role="alert" className="mt-1 text-xs text-destructive">
            {errors.roleTitle}
          </p>
        )}
      </div>

      {/* Date fields */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-foreground">
            Start Date <span className="text-destructive">*</span>
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            aria-required="true"
            aria-invalid={errors.startDate ? true : undefined}
            aria-describedby={errors.startDate ? "startDate-error" : undefined}
          />
          {errors.startDate && (
            <p id="startDate-error" role="alert" className="mt-1 text-xs text-destructive">
              {errors.startDate}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-foreground">
            End Date <span className="text-muted-foreground">(optional)</span>
          </label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            aria-invalid={errors.endDate ? true : undefined}
            aria-describedby={errors.endDate ? "endDate-error" : undefined}
          />
          {errors.endDate && (
            <p id="endDate-error" role="alert" className="mt-1 text-xs text-destructive">
              {errors.endDate}
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-foreground">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring resize-y"
          placeholder="Describe your role and achievements..."
          aria-invalid={errors.description ? true : undefined}
          aria-describedby={errors.description ? "description-error" : undefined}
        />
        {errors.description && (
          <p id="description-error" role="alert" className="mt-1 text-xs text-destructive">
            {errors.description}
          </p>
        )}
      </div>

      {/* Tech Stack */}
      <div>
        <label htmlFor="techStack" className="block text-sm font-medium text-foreground">
          Tech Stack <span className="text-muted-foreground">(comma-separated)</span>
        </label>
        <input
          id="techStack"
          type="text"
          value={techStack}
          onChange={(e) => setTechStack(e.target.value)}
          className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="e.g. React, TypeScript, AWS"
          aria-invalid={errors.techStack ? true : undefined}
          aria-describedby={errors.techStack ? "techStack-error" : undefined}
        />
        {errors.techStack && (
          <p id="techStack-error" role="alert" className="mt-1 text-xs text-destructive">
            {errors.techStack}
          </p>
        )}
      </div>

      {/* Visibility */}
      <div className="flex items-center gap-2">
        <input
          id="isVisible"
          type="checkbox"
          checked={isVisible}
          onChange={(e) => setIsVisible(e.target.checked)}
          className="size-4 rounded border-border text-primary focus:ring-ring"
        />
        <label htmlFor="isVisible" className="text-sm font-medium text-foreground">
          Visible on public site
        </label>
      </div>

      {/* Server error */}
      {(createMutation.error || updateMutation.error) && (
        <div
          role="alert"
          className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          {createMutation.error?.message || updateMutation.error?.message}
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="size-3 animate-spin" aria-hidden="true" />
              <span className="ml-1">Saving...</span>
            </>
          ) : isEditing ? (
            "Update Experience"
          ) : (
            "Create Experience"
          )}
        </Button>
      </div>
    </form>
  );
}
