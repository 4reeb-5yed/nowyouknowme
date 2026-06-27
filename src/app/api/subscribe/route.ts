import { NextResponse } from 'next/server';

/**
 * Newsletter subscription API route handler (stub).
 *
 * This is a placeholder for future newsletter/subscription integration.
 * When implemented, this endpoint will accept an email address via POST
 * and add it to the subscribers list (e.g., via Resend, Mailchimp, or
 * the internal subscribers table).
 *
 * Currently returns 501 Not Implemented.
 */
export async function POST() {
  return NextResponse.json(
    {
      error: 'Newsletter subscription not yet implemented',
      status: 501,
    },
    { status: 501 }
  );
}
