const { CacheHandler } = require("@neshca/cache-handler");
const createRedisHandler = require("@neshca/cache-handler/redis-strings").default;
const { Redis } = require("ioredis");

CacheHandler.onCreation(async () => {
  const client = new Redis(process.env.REDIS_URL);

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
