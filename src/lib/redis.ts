import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Create a single shared Redis connection (multiplexing)
// Following redis-connections skill guidelines:
// - Never open a connection per request
// - Set explicit timeouts for fail-fast
const globalForRedis = global as unknown as { redis: Redis };

export const redis =
  globalForRedis.redis ||
  new Redis(REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 3,
    connectTimeout: 5000,
    commandTimeout: 5000,
    retryStrategy(times) {
      // Exponential backoff strategy up to 3 seconds
      if (times > 5) return null;
      return Math.min(times * 300, 3000);
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}
