import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock the email service ─────────────────────────────────────────────────
// The route delegates delivery to sendContactEmail. We mock it so the
// integration test exercises validation + rate limiting without touching
// Resend or requiring server env vars. Each test controls the resolved value.

const mockSendContactEmail = vi.fn();

vi.mock('@/server/services/email.service', () => ({
  sendContactEmail: (...args: unknown[]) => mockSendContactEmail(...args),
}));

import { POST } from '@/app/api/contact/route';
import { contactFormLimiter } from '@/lib/rate-limit';

// ─── Helpers ────────────────────────────────────────────────────────────────

const validBody = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  message: 'Hello, I would like to discuss a collaboration opportunity.',
};

/**
 * Builds a POST request to the contact endpoint with the given JSON body and
 * client IP (set via x-forwarded-for, matching the route's IP extraction).
 */
function makeRequest(body: unknown, ip: string): Request {
  return new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

// Each test uses a unique IP so the per-IP token bucket does not bleed across
// tests. Rate-limit tests reset their own IP explicitly for determinism.
let ipCounter = 0;
function nextIp(): string {
  ipCounter += 1;
  return `203.0.113.${ipCounter}`;
}

describe('POST /api/contact (integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendContactEmail.mockResolvedValue({ success: true });
  });

  // ─── Valid submissions are accepted (Req 8.1) ─────────────────────────────

  describe('valid submissions', () => {
    it('accepts a valid submission and delivers the email', async () => {
      const ip = nextIp();
      const response = await POST(makeRequest(validBody, ip) as never);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.message).toBe('Message sent successfully');
      expect(mockSendContactEmail).toHaveBeenCalledTimes(1);
      expect(mockSendContactEmail).toHaveBeenCalledWith(validBody);
    });

    it('includes rate-limit headers on a successful submission', async () => {
      const ip = nextIp();
      const response = await POST(makeRequest(validBody, ip) as never);

      expect(response.headers.get('X-RateLimit-Remaining')).not.toBeNull();
      expect(response.headers.get('X-RateLimit-Reset')).not.toBeNull();
    });
  });

  // ─── Invalid submissions return field-level errors (Req 8.2, 8.4) ─────────

  describe('invalid submissions', () => {
    it('returns 400 with field-level errors when fields are missing', async () => {
      const ip = nextIp();
      const response = await POST(makeRequest({}, ip) as never);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Validation failed');
      expect(json.fieldErrors).toBeDefined();
      expect(json.fieldErrors.name).toBeDefined();
      expect(json.fieldErrors.email).toBeDefined();
      expect(json.fieldErrors.message).toBeDefined();
      expect(mockSendContactEmail).not.toHaveBeenCalled();
    });

    it('returns a field-level error for an invalid email', async () => {
      const ip = nextIp();
      const response = await POST(
        makeRequest({ ...validBody, email: 'not-an-email' }, ip) as never
      );
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.fieldErrors.email).toBeDefined();
      expect(json.fieldErrors.name).toBeUndefined();
      expect(json.fieldErrors.message).toBeUndefined();
      expect(mockSendContactEmail).not.toHaveBeenCalled();
    });

    it('returns a field-level error for a too-short message', async () => {
      const ip = nextIp();
      const response = await POST(
        makeRequest({ ...validBody, message: 'short' }, ip) as never
      );
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.fieldErrors.message).toBeDefined();
      expect(mockSendContactEmail).not.toHaveBeenCalled();
    });

    it('returns 400 when the request body is not valid JSON', async () => {
      const ip = nextIp();
      const response = await POST(makeRequest('{ not json', ip) as never);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Invalid request body');
      expect(mockSendContactEmail).not.toHaveBeenCalled();
    });
  });

  // ─── Rate limiting rejects after threshold exceeded (Req 8.5) ─────────────

  describe('rate limiting', () => {
    it('rejects with 429 after exceeding the 3-per-hour threshold', async () => {
      const ip = nextIp();
      contactFormLimiter.reset(ip);

      // First 3 requests succeed (the configured threshold).
      for (let i = 0; i < 3; i++) {
        const response = await POST(makeRequest(validBody, ip) as never);
        expect(response.status).toBe(200);
      }

      // The 4th request from the same IP is rejected.
      const blocked = await POST(makeRequest(validBody, ip) as never);
      const json = await blocked.json();

      expect(blocked.status).toBe(429);
      expect(json.error).toMatch(/too many submissions/i);
      expect(blocked.headers.get('Retry-After')).not.toBeNull();
      expect(blocked.headers.get('X-RateLimit-Remaining')).toBe('0');
    });

    it('does not consume a token or send email once rate limited', async () => {
      const ip = nextIp();
      contactFormLimiter.reset(ip);

      for (let i = 0; i < 3; i++) {
        await POST(makeRequest(validBody, ip) as never);
      }
      mockSendContactEmail.mockClear();

      const blocked = await POST(makeRequest(validBody, ip) as never);

      expect(blocked.status).toBe(429);
      expect(mockSendContactEmail).not.toHaveBeenCalled();
    });

    it('rate limits independently per IP address', async () => {
      const ipA = nextIp();
      const ipB = nextIp();
      contactFormLimiter.reset(ipA);
      contactFormLimiter.reset(ipB);

      // Exhaust ipA's budget.
      for (let i = 0; i < 3; i++) {
        await POST(makeRequest(validBody, ipA) as never);
      }
      const blockedA = await POST(makeRequest(validBody, ipA) as never);
      expect(blockedA.status).toBe(429);

      // ipB still has its full budget.
      const allowedB = await POST(makeRequest(validBody, ipB) as never);
      expect(allowedB.status).toBe(200);
    });
  });
});
