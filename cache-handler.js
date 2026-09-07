const { CacheHandler } = require("@neshca/cache-handler");
const createRedisHandler = require("@neshca/cache-handler/redis-strings").default;
const { Redis } = require("ioredis");

CacheHandler.onCreation(async () => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn("[Redis Cache Handler] REDIS_URL is not set; Redis-backed cache is disabled.");
    return { handlers: [] };
  }

  const client = new Redis(redisUrl);
  client.on("error", (err) => {
    console.error("[Redis Cache Handler Error]", err);
  });

  return {
    handlers: [
      createRedisHandler({ client }),
    ],
  };
});

module.exports = CacheHandler;
