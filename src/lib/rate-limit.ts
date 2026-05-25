/**
 * Simple in-memory rate limiter for Vercel serverless
 * Note: Resets on cold start, but sufficient for basic spam protection
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 5 * 60 * 1000);

interface RateLimitConfig {
  maxRequests: number; // Max requests allowed
  windowMs: number;   // Time window in milliseconds
}

/**
 * Check if a request should be rate limited
 * @returns { limited: boolean, remaining: number, resetIn: number }
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { limited: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const key = identifier;
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // New window
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { limited: false, remaining: config.maxRequests - 1, resetIn: config.windowMs };
  }

  entry.count++;

  if (entry.count > config.maxRequests) {
    return { limited: true, remaining: 0, resetIn: entry.resetAt - now };
  }

  return { limited: false, remaining: config.maxRequests - entry.count, resetIn: entry.resetAt - now };
}

/**
 * Get client IP from request headers (Vercel)
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

// Preset configs
export const RATE_LIMITS = {
  // Order creation: max 5 per 10 minutes per IP
  ORDER: { maxRequests: 5, windowMs: 10 * 60 * 1000 },
  // Login attempts: max 5 per 5 minutes per IP
  LOGIN: { maxRequests: 5, windowMs: 5 * 60 * 1000 },
  // General API: max 60 per minute per IP
  GENERAL: { maxRequests: 60, windowMs: 60 * 1000 },
  // Bot integration: max 30 per minute per API key
  BOT_INTEGRATION: { maxRequests: 30, windowMs: 60 * 1000 },
} as const;
