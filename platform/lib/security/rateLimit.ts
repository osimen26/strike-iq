/**
 * Strike IQ — In-Memory Sliding Window Rate Limiter
 *
 * No external dependencies. Works on Vercel serverless functions.
 * Uses a sliding window algorithm to limit requests per IP per time window.
 *
 * NOTE: This is per-instance. For a distributed / multi-region setup,
 * upgrade to Upstash Redis by replacing the Map with Redis INCR + EXPIRE calls.
 * The interface below stays identical — only the store changes.
 */

interface RateLimitEntry {
  tokens: number[];     // Timestamps of recent requests (sliding window log)
  blocked?: boolean;    // True if this IP was permanently blocked this window
}

// Global store — persists across requests within the same serverless instance
const store = new Map<string, RateLimitEntry>();

// Auto-sweep expired entries every 5 minutes to prevent memory leaks
let lastSweep = Date.now();
function sweepExpiredEntries(windowMs: number) {
  const now = Date.now();
  if (now - lastSweep < 5 * 60 * 1000) return;
  lastSweep = now;
  const cutoff = now - windowMs;
  for (const [key, entry] of store.entries()) {
    const active = entry.tokens.filter((t) => t > cutoff);
    if (active.length === 0) {
      store.delete(key);
    } else {
      entry.tokens = active;
    }
  }
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAfterMs: number;
  retryAfterSec: number;
}

export interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit: number;
  /** Window size in milliseconds */
  windowMs: number;
}

/**
 * Preset rate limit configurations for different endpoint tiers.
 */
export const RATE_LIMITS = {
  /** Payment checkout: 5 attempts per minute per IP */
  PAYMENT: { limit: 5, windowMs: 60_000 } satisfies RateLimitConfig,
  /** Admin write endpoints: 20 per minute per IP */
  ADMIN_WRITE: { limit: 20, windowMs: 60_000 } satisfies RateLimitConfig,
  /** Admin read endpoints: 60 per minute per IP */
  ADMIN_READ: { limit: 60, windowMs: 60_000 } satisfies RateLimitConfig,
  /** Auth-required user endpoints: 30 per minute per IP */
  USER: { limit: 30, windowMs: 60_000 } satisfies RateLimitConfig,
  /** Public/logo endpoints: 100 per minute per IP */
  PUBLIC: { limit: 100, windowMs: 60_000 } satisfies RateLimitConfig,
} as const;

/**
 * Check if the given key (IP address or user ID) is within rate limit.
 * Uses sliding window log algorithm — fair and burst-resistant.
 *
 * @param key    - Unique identifier (IP address, or "ip:userId" for user-scoped limits)
 * @param config - Rate limit configuration (limit + windowMs)
 * @returns      - { success, remaining, resetAfterMs, retryAfterSec }
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  sweepExpiredEntries(config.windowMs);

  const now = Date.now();
  const cutoff = now - config.windowMs;

  // Get or create entry
  let entry = store.get(key);
  if (!entry) {
    entry = { tokens: [] };
    store.set(key, entry);
  }

  // Slide the window — remove timestamps older than the window
  entry.tokens = entry.tokens.filter((t) => t > cutoff);

  if (entry.tokens.length >= config.limit) {
    // Rate limit exceeded
    const oldestToken = entry.tokens[0];
    const resetAfterMs = oldestToken + config.windowMs - now;
    const retryAfterSec = Math.ceil(resetAfterMs / 1000);
    return {
      success: false,
      remaining: 0,
      resetAfterMs,
      retryAfterSec,
    };
  }

  // Add current request timestamp and allow
  entry.tokens.push(now);
  return {
    success: true,
    remaining: config.limit - entry.tokens.length,
    resetAfterMs: config.windowMs,
    retryAfterSec: 0,
  };
}

/**
 * Extracts the real client IP from a Next.js Request object.
 * Handles Vercel's forwarding headers.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    // x-forwarded-for can be a comma-separated list; take the first (real client)
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Returns a 429 Too Many Requests response with Retry-After header.
 */
import { NextResponse } from "next/server";
export function rateLimitResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    {
      error: "Too many requests. Please slow down and try again shortly.",
      retryAfterSeconds: result.retryAfterSec,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfterSec),
        "X-RateLimit-Limit": "exceeded",
        "X-RateLimit-Reset": String(Math.ceil((Date.now() + result.resetAfterMs) / 1000)),
      },
    }
  );
}
