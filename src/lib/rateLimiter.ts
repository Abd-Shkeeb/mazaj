// src/lib/rateLimiter.ts
// Wrapper around existing IP rate limiter to provide per‑cafe key based limiting

import { isRateLimited as ipRateLimited } from '@/lib/rateLimit';

/**
 * Simple per‑cafe rate limiter for kiosk session creation.
 * Uses the same sliding‑window map as `rateLimit.ts` but keys by a custom string.
 *
 * @param cafeId Unique identifier of the cafe (slug or id)
 * @param limit Maximum creations allowed per minute
 * @returns true if the request should be rejected (rate‑limited)
 */
export function isRateLimited(cafeId: string, limit: number = 5): boolean {
  const key = `kiosk-session:${cafeId}`;
  return ipRateLimited(key, limit);
}

// Alias export for compatibility
export function isRateLimitedKey(cafeId: string, limit: number = 5): boolean {
  return isRateLimited(cafeId, limit);
}
