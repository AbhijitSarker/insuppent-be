import { redisClient } from '../db/redis.js';

/**
 * Simple Redis utility functions
 */
export class RedisUtil {
  /**
   * Set a key-value pair with optional expiration
   * @param {string} key - The key
   * @param {string} value - The value
   * @param {number} expiration - Expiration time in seconds (optional)
   */
  static async set(key, value, expiration = null) {
    try {
      if (expiration) {
        await redisClient.setEx(key, expiration, value);
      } else {
        await redisClient.set(key, value);
      }
    } catch (error) {
      console.error('Redis SET error:', error);
      throw error;
    }
  }

  /**
   * Get a value by key
   * @param {string} key - The key
   * @returns {string|null} The value or null if not found
   */
  static async get(key) {
    try {
      return await redisClient.get(key);
    } catch (error) {
      console.error('Redis GET error:', error);
      throw error;
    }
  }

  /**
   * Delete a key
   * @param {string} key - The key
   */
  static async delete(key) {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error('Redis DELETE error:', error);
      throw error;
    }
  }

  /**
   * Check if a key exists
   * @param {string} key - The key
   * @returns {boolean} True if key exists
   */
  static async exists(key) {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      throw error;
    }
  }

  /**
   * Set expiration time for a key
   * @param {string} key - The key
   * @param {number} seconds - Expiration time in seconds
   */
  static async expire(key, seconds) {
    try {
      await redisClient.expire(key, seconds);
    } catch (error) {
      console.error('Redis EXPIRE error:', error);
      throw error;
    }
  }

  /**
   * Store JSON data
   * @param {string} key - The key
   * @param {object} data - The data to store
   * @param {number} expiration - Expiration time in seconds (optional)
   */
  static async setJSON(key, data, expiration = null) {
    try {
      const jsonString = JSON.stringify(data);
      await this.set(key, jsonString, expiration);
    } catch (error) {
      console.error('Redis SET JSON error:', error);
      throw error;
    }
  }

  /**
   * Get JSON data
   * @param {string} key - The key
   * @returns {object|null} Parsed JSON data or null
   */
  static async getJSON(key) {
    try {
      const jsonString = await this.get(key);
      return jsonString ? JSON.parse(jsonString) : null;
    } catch (error) {
      console.error('Redis GET JSON error:', error);
      throw error;
    }
  }
}
