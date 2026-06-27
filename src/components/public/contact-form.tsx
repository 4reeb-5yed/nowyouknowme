"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  contactFormSchema,
  type ContactFormInput,
} from "@/lib/validators/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type SubmitStatus = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [serverError, setServerError] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  async function onSubmit(data: ContactFormInput) {
    setStatus("submitting");
    setServerError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setStatus("success");
        reset();
      } else if (response.status === 429) {
        setStatus("error");
        setServerError(
          "You've sent too many messages. Please try again later."
        );
      } else {
        const body = await response.json().catch(() => null);
        setStatus("error");
        setServerError(
          body?.error || "Something went wrong. Please try again later."
        );
      }
    } catch {
      setStatus("error");
      setServerError(
        "Unable to send your message. Please check your connection and try again."
      );
    }
  }

  if (status === "success") {
    return (
      <div
        className="rounded-lg border border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-950"
        role="status"
        aria-live="polite"
      >
        <h2 className="text-lg font-semibold text-green-800 dark:text-green-200">
          Message sent!
        </h2>
        <p className="mt-2 text-sm text-green-700 dark:text-green-300">
          Thank you for reaching out. I&apos;ll get back to you as soon as
          possible.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => setStatus("idle")}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-6"
      aria-label="Contact form"
    >
      {/* Server error banner */}
      {status === "error" && serverError && (
        <div
          className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
          role="alert"
          aria-live="assertive"
        >
          {serverError}
        </div>
      )}

      {/* Name field */}
      <div className="space-y-2">
        <Label htmlFor="contact-name">Name</Label>
        <Input
          id="contact-name"
          type="text"
          placeholder="Your name"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
          {...register("name")}
        />
        {errors.name && (
          <p
            id="contact-name-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Email field */}
      <div className="space-y-2">
        <Label htmlFor="contact-email">Email</Label>
        <Input
          id="contact-email"
          type="email"
          placeholder="your@email.com"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
          {...register("email")}
        />
        {errors.email && (
          <p
            id="contact-email-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Message field */}
      <div className="space-y-2">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          placeholder="How can I help you?"
          rows={5}
          aria-invalid={!!errors.message}
          aria-describedby={
            errors.message ? "contact-message-error" : undefined
          }
          {...register("message")}
        />
        {errors.message && (
          <p
            id="contact-message-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {errors.message.message}
          </p>
        )}
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        disabled={status === "submitting"}
        className="w-full sm:w-auto"
      >
        {status === "submitting" ? "Sending..." : "Send message"}
      </Button>
    </form>
  );
}
