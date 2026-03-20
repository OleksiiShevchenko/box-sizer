type RateLimitResult = {
  allowed: boolean;
  retryAfterMs?: number;
  remaining: number;
};

const RATE_LIMIT_BUCKETS = Symbol.for("box-sizer.api-rate-limit");

type BucketStore = Map<string, number[]>;

function getStore(): BucketStore {
  const globalWithBuckets = globalThis as typeof globalThis & {
    [RATE_LIMIT_BUCKETS]?: BucketStore;
  };

  if (!globalWithBuckets[RATE_LIMIT_BUCKETS]) {
    globalWithBuckets[RATE_LIMIT_BUCKETS] = new Map<string, number[]>();
  }

  return globalWithBuckets[RATE_LIMIT_BUCKETS];
}

export function checkRateLimit(
  key: string,
  limit = 100,
  windowMs = 60_000
): RateLimitResult {
  const now = Date.now();
  const store = getStore();
  const timestamps = store.get(key) ?? [];
  const recent = timestamps.filter((timestamp) => now - timestamp < windowMs);

  if (recent.length >= limit) {
    const retryAfterMs = Math.max(0, windowMs - (now - recent[0]!));
    store.set(key, recent);
    return {
      allowed: false,
      retryAfterMs,
      remaining: 0,
    };
  }

  recent.push(now);
  store.set(key, recent);

  return {
    allowed: true,
    remaining: Math.max(0, limit - recent.length),
  };
}
