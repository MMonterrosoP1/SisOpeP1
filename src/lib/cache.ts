import { redis } from "./redis";

/**
 * Gets cached data from Redis.
 * Parses the stored JSON string back into an object.
 *
 * @param key The colon-separated Redis key
 * @returns The parsed data or null if not found
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`[Redis Cache Error] Failed to get key ${key}:`, error);
    return null; // Fail open (fallback to db)
  }
}

/**
 * Sets data into Redis cache with a TTL (Time To Live).
 * Serializes the object into a JSON string.
 *
 * @param key The colon-separated Redis key
 * @param data The data to store
 * @param ttlSeconds The time to live in seconds
 */
export async function setCachedData<T>(
  key: string,
  data: T,
  ttlSeconds: number
): Promise<void> {
  try {
    const serialized = JSON.stringify(data);
    await redis.setex(key, ttlSeconds, serialized);
  } catch (error) {
    console.error(`[Redis Cache Error] Failed to set key ${key}:`, error);
    // Don't throw, just log the error to not break the app if cache fails
  }
}

/**
 * Invalidates the Redis cache for a specific catalog type.
 * Deletes the list caches, and optionally the specific id cache.
 *
 * @param type The catalog type
 * @param id Optional id of the specific catalog item
 */
export async function invalidateCatalogCache(type: string, id?: number): Promise<void> {
  try {
    const keysToDelete = [
      `catalog:${type}:list:true`,
      `catalog:${type}:list:false`,
    ];
    if (id !== undefined) {
      keysToDelete.push(`catalog:${type}:id:${id}`);
    }
    await redis.del(...keysToDelete);
  } catch (error) {
    console.error(`[Redis Cache Error] Failed to invalidate cache for ${type}:`, error);
  }
}

