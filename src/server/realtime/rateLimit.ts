const buckets = new Map<string, { tokens: number; updatedAt: number }>();

export function isRateLimited(key: string, limit = 10, refillMs = 60_000) {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { tokens: limit, updatedAt: now };
  const delta = now - bucket.updatedAt;
  const refill = Math.floor(delta / refillMs) * limit;
  bucket.tokens = Math.min(limit, bucket.tokens + refill);
  bucket.updatedAt = now;
  if (bucket.tokens <= 0) {
    buckets.set(key, bucket);
    return true;
  }
  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return false;
}
