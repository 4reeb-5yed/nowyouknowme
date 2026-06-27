import { NextRequest, NextResponse } from "next/server";

import { contactFormSchema } from "@/lib/validators/contact";
import { contactFormLimiter } from "@/lib/rate-limit";
import { sendContactEmail } from "@/server/services/email.service";

/**
 * Extracts the client IP address from the request.
 * Falls back to "unknown" if no IP can be determined.
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs; take the first (client IP)
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  // 1. Rate limiting
  const rateLimitResult = contactFormLimiter.check(ip);

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: "Too many submissions. Please try again later.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimitResult.retryAfterSeconds),
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
          "X-RateLimit-Reset": String(rateLimitResult.resetTime),
        },
      }
    );
  }

  // 2. Parse request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      {
        status: 400,
        headers: {
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
          "X-RateLimit-Reset": String(rateLimitResult.resetTime),
        },
      }
    );
  }

  // 3. Server-side validation
  const validation = contactFormSchema.safeParse(body);

  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    return NextResponse.json(
      {
        error: "Validation failed",
        fieldErrors,
      },
      {
        status: 400,
        headers: {
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
          "X-RateLimit-Reset": String(rateLimitResult.resetTime),
        },
      }
    );
  }

  // 4. Send email
  try {
    const result = await sendContactEmail(validation.data);

    if (!result.success) {
      return NextResponse.json(
        {
          error:
            result.error ??
            "Failed to send message. Please try again later.",
        },
        {
          status: 503,
          headers: {
            "X-RateLimit-Remaining": String(rateLimitResult.remaining),
            "X-RateLimit-Reset": String(rateLimitResult.resetTime),
          },
        }
      );
    }

    return NextResponse.json(
      { message: "Message sent successfully" },
      {
        status: 200,
        headers: {
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
          "X-RateLimit-Reset": String(rateLimitResult.resetTime),
        },
      }
    );
  } catch (error) {
    console.error("[api/contact] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred. Please try again later.",
      },
      {
        status: 500,
        headers: {
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
          "X-RateLimit-Reset": String(rateLimitResult.resetTime),
        },
      }
    );
  }
}
