/**
 * In-memory rate limiter using a token bucket algorithm.
 *
 * Suitable for single-instance deployments (e.g., a single Vercel serverless
 * function instance). For distributed deployments, replace the in-memory Map
 * with a shared store like Redis or Upstash.
 *
 * @module rate-limit
 */

/** Configuration for creating a rate limiter instance. */
export interface RateLimitConfig {
  /** Time window in milliseconds during which tokens refill. */
  interval: number;
  /** Maximum number of requests allowed within the interval. */
  maxRequests: number;
}

/** Result returned when checking a rate limit. */
export interface RateLimitResult {
  /** Whether the request is allowed. */
  allowed: boolean;
  /** Number of remaining requests in the current window. */
  remaining: number;
  /** Unix timestamp (ms) when the token bucket fully resets. */
  resetTime: number;
  /** Seconds until the client can retry (relevant when allowed is false). */
  retryAfterSeconds: number;
}

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

/**
 * Creates a rate limiter with the given configuration.
 *
 * Usage:
 * ```ts
 * const limiter = rateLimit({ interval: 60 * 60 * 1000, maxRequests: 3 });
 * const result = limiter.check("127.0.0.1");
 * if (!result.allowed) {
 *   return new Response("Too Many Requests", {
 *     status: 429,
 *     headers: { "Retry-After": String(result.retryAfterSeconds) },
 *   });
 * }
 * ```
 */
export function rateLimit(config: RateLimitConfig) {
  const { interval, maxRequests } = config;
  const buckets = new Map<string, TokenBucket>();

  /**
   * Refills tokens based on elapsed time since last refill.
   * Implements a smooth token bucket: tokens accumulate proportionally
   * to elapsed time.
   */
  function refill(bucket: TokenBucket, now: number): void {
    const elapsed = now - bucket.lastRefill;
    if (elapsed <= 0) return;

    const tokensToAdd = (elapsed / interval) * maxRequests;
    bucket.tokens = Math.min(maxRequests, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  /**
   * Check if a request from the given key is allowed.
   * Consumes one token if allowed.
   */
  function check(key: string): RateLimitResult {
    const now = Date.now();
    let bucket = buckets.get(key);

    if (!bucket) {
      bucket = { tokens: maxRequests, lastRefill: now };
      buckets.set(key, bucket);
    }

    refill(bucket, now);

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      const resetTime = now + interval;
      return {
        allowed: true,
        remaining: Math.floor(bucket.tokens),
        resetTime,
        retryAfterSeconds: 0,
      };
    }

    // Not allowed — calculate when next token will be available
    const timePerToken = interval / maxRequests;
    const tokensNeeded = 1 - bucket.tokens;
    const waitMs = tokensNeeded * timePerToken;
    const retryAfterSeconds = Math.ceil(waitMs / 1000);
    const resetTime = now + interval;

    return {
      allowed: false,
      remaining: 0,
      resetTime,
      retryAfterSeconds,
    };
  }

  /**
   * Get the current state for a key without consuming a token.
   * Useful for informational headers (X-RateLimit-Remaining, etc.).
   */
  function peek(key: string): RateLimitResult {
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket) {
      return {
        allowed: true,
        remaining: maxRequests,
        resetTime: now + interval,
        retryAfterSeconds: 0,
      };
    }

    // Clone to avoid mutation
    const cloned: TokenBucket = { tokens: bucket.tokens, lastRefill: bucket.lastRefill };
    refill(cloned, now);

    const allowed = cloned.tokens >= 1;
    const remaining = Math.floor(cloned.tokens);

    if (allowed) {
      return {
        allowed: true,
        remaining,
        resetTime: now + interval,
        retryAfterSeconds: 0,
      };
    }

    const timePerToken = interval / maxRequests;
    const tokensNeeded = 1 - cloned.tokens;
    const waitMs = tokensNeeded * timePerToken;

    return {
      allowed: false,
      remaining: 0,
      resetTime: now + interval,
      retryAfterSeconds: Math.ceil(waitMs / 1000),
    };
  }

  /**
   * Reset the bucket for a specific key.
   * Useful for testing or admin overrides.
   */
  function reset(key: string): void {
    buckets.delete(key);
  }

  /**
   * Clear all stored buckets.
   * Useful for cleanup in tests.
   */
  function clear(): void {
    buckets.clear();
  }

  return { check, peek, reset, clear };
}

/** Pre-configured rate limiter for the contact form: 3 submissions per hour per IP. */
export const contactFormLimiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  maxRequests: 3,
});

/** Pre-configured rate limiter for file uploads: 10 uploads per hour per session. */
export const fileUploadLimiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,
});
