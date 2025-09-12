import { RedisUtil } from '../../utils/redis.js';
import { redisClient } from '../../db/redis.js';

/**
 * Simple caching middleware using Redis
 * @param {number} duration - Cache duration in seconds (default: 300 = 5 minutes)
 * @returns {Function} Express middleware
 */
export const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    try {
      // Create cache key from route and query parameters
      const cacheKey = `cache:${req.method}:${req.originalUrl || req.url}`;
      
      // Try to get cached response
      const cachedResponse = await RedisUtil.getJSON(cacheKey);
      
      if (cachedResponse) {
        console.log(`Cache HIT for key: ${cacheKey}`);
        return res.status(cachedResponse.statusCode).json(cachedResponse.data);
      }
      
      console.log(`Cache MISS for key: ${cacheKey}`);
      
      // Store original res.json method
      const originalJson = res.json;
      
      // Override res.json to cache the response
      res.json = function (data) {
        // Cache the response
        const responseToCache = {
          statusCode: res.statusCode,
          data: data,
        };
        
        // Store in cache (fire and forget - don't wait)
        RedisUtil.setJSON(cacheKey, responseToCache, duration).catch(error =>
          console.error('Cache SET error:', error),
        );
        
        // Call original json method
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      // Continue without caching on error
      next();
    }
  };
};

/**
 * Invalidate cache by pattern
 * @param {string} pattern - Cache key pattern to invalidate
 */
export const invalidateCache = async pattern => {
  try {
    // Note: In production, consider using Redis SCAN instead of KEYS for better performance
    const keys = (await redisClient?.keys(`cache:*${pattern}*`)) || [];
    if (keys.length > 0) {
      await Promise.all(keys.map(key => RedisUtil.delete(key)));
      console.log(
        `Invalidated ${keys.length} cache entries for pattern: ${pattern}`,
      );
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
};
