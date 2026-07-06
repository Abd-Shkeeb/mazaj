const windowMs = 60 * 1000 // 1 minute window
const rateLimitMap = new Map<string, number[]>()

export function isRateLimited(ip: string, limit: number): boolean {
  const now = Date.now()
  const timestamps = rateLimitMap.get(ip) || []

  // Filter out timestamps outside the current window
  const activeTimestamps = timestamps.filter(time => now - time < windowMs)

  if (activeTimestamps.length >= limit) {
    return true
  }

  activeTimestamps.push(now)
  rateLimitMap.set(ip, activeTimestamps)

  // Memory management: Prune empty/stale entries if map grows too large
  if (rateLimitMap.size > 5000) {
    const cutoff = now - windowMs
    for (const [key, val] of rateLimitMap.entries()) {
      const remaining = val.filter(time => time > cutoff)
      if (remaining.length === 0) {
        rateLimitMap.delete(key)
      } else {
        rateLimitMap.set(key, remaining)
      }
    }
  }

  return false
}

/**
 * Generic rate limiting based on an arbitrary string key.
 * Useful for limiting actions per cafe, per session creation, etc.
 */
export function isRateLimitedKey(key: string, limit: number): boolean {
  return isRateLimited(key, limit)
}

