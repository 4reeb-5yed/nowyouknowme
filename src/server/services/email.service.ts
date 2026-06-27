import { Resend } from "resend";

import { serverEnv } from "@/config/env";
import type { ContactFormInput } from "@/lib/validators/contact";

const resend = new Resend(serverEnv.RESEND_API_KEY);

export interface SendEmailResult {
  success: boolean;
  error?: string;
}

/**
 * Sends a contact form submission email to the configured owner email address.
 * Uses Resend SDK for delivery.
 *
 * @param data - The contact form input (name, email, message)
 * @returns A result object indicating success or failure with an optional error message
 */
export async function sendContactEmail(
  data: ContactFormInput
): Promise<SendEmailResult> {
  const { name, email, message } = data;

  try {
    const { error } = await resend.emails.send({
      from: `Portfolio Contact <onboarding@resend.dev>`,
      to: serverEnv.CONTACT_EMAIL,
      replyTo: email,
      subject: `New Contact Form Message from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        ``,
        `Message:`,
        message,
      ].join("\n"),
    });

    if (error) {
      console.error("[email.service] Resend API error:", error);
      return {
        success: false,
        error: "Failed to deliver email. Please try again later.",
      };
    }

    return { success: true };
  } catch (err) {
    console.error("[email.service] Unexpected error sending email:", err);
    return {
      success: false,
      error: "Email service is currently unavailable. Please try again later.",
    };
  }
}
