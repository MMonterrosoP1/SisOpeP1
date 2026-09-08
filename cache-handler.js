const { CacheHandler } = require("@neshca/cache-handler");
const createRedisStringsHandler = require("@neshca/cache-handler/redis-strings").default;
const { Redis } = require("ioredis");

const REDIS_URL = process.env.REDIS_URL;
const KEY_PREFIX = process.env.REDIS_CACHE_PREFIX || "nc:";

CacheHandler.onCreation(async () => {
  let client;

  if (REDIS_URL) {
    client = new Redis(REDIS_URL, {
      lazyConnect: false,
      maxRetriesPerRequest: 3,
      connectTimeout: 5000,
      commandTimeout: 5000,
      retryStrategy(times) {
        if (times > 5) return null;
        return Math.min(times * 300, 3000);
      },
    });

    client.on("connect", () =>
      console.log(
        "[RedisCacheHandler]  Conectado:",
        REDIS_URL.replace(/:([^:@]+)@/, ":***@")
      )
    );
    client.on("ready", () => console.log("[RedisCacheHandler] Redis listo"));
    client.on("error", (err) =>
      console.error("[RedisCacheHandler] ", err.message)
    );
  } else {
    console.warn(
      "[RedisCacheHandler] REDIS_URL no configurado — cache Redis deshabilitado"
    );
  }

  return {
    handlers: [
      client ? createRedisStringsHandler({ client, keyPrefix: KEY_PREFIX }) : null,
    ],
  };
});

module.exports = CacheHandler;
