import { redisClient } from '../db/redis.js';
import { v4 as uuidv4 } from 'uuid';
import config from '../config/index.js';

class SessionStore {
  constructor() {
    this.prefix = 'session:';
    this.defaultTTL = 24 * 60 * 60; // 24 hours in seconds
  }

  // Generate a unique session ID
  generateSessionId() {
    return uuidv4();
  }

  // Save user session to Redis
  async saveUserSession(sessionId, userData, ttl = this.defaultTTL) {
    try {
      const key = `${this.prefix}${sessionId}`;
      const sessionData = {
        ...userData,
        createdAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString()
      };
      
      await redisClient.setEx(key, ttl, JSON.stringify(sessionData));
      console.log(`Session saved for user ${userData.id} with sessionId: ${sessionId}`);
      return true;
    } catch (error) {
      console.error('Error saving session to Redis:', error);
      throw new Error('Failed to save session');
    }
  }

  // Get user session from Redis
  async getUserSession(sessionId) {
    try {
      const key = `${this.prefix}${sessionId}`;
      const data = await redisClient.get(key);
      
      if (!data) {
        return null;
      }

      const sessionData = JSON.parse(data);
      
      // Update last accessed time
      sessionData.lastAccessed = new Date().toISOString();
      await redisClient.setEx(key, this.defaultTTL, JSON.stringify(sessionData));
      
      return sessionData;
    } catch (error) {
      console.error('Error retrieving session from Redis:', error);
      return null;
    }
  }

  // Delete user session from Redis
  async deleteUserSession(sessionId) {
    try {
      const key = `${this.prefix}${sessionId}`;
      const result = await redisClient.del(key);
      console.log(`Session ${sessionId} deleted: ${result > 0 ? 'success' : 'not found'}`);
      return result > 0;
    } catch (error) {
      console.error('Error deleting session from Redis:', error);
      return false;
    }
  }

  // Check if session exists
  async sessionExists(sessionId) {
    try {
      const key = `${this.prefix}${sessionId}`;
      const exists = await redisClient.exists(key);
      return exists === 1;
    } catch (error) {
      console.error('Error checking session existence:', error);
      return false;
    }
  }

  // Extend session TTL
  async extendSession(sessionId, ttl = this.defaultTTL) {
    try {
      const key = `${this.prefix}${sessionId}`;
      const result = await redisClient.expire(key, ttl);
      return result === 1;
    } catch (error) {
      console.error('Error extending session:', error);
      return false;
    }
  }

  // Get all sessions for a user (by user ID)
  async getUserSessions(userId) {
    try {
      const pattern = `${this.prefix}*`;
      const keys = await redisClient.keys(pattern);
      const sessions = [];

      for (const key of keys) {
        const data = await redisClient.get(key);
        if (data) {
          const sessionData = JSON.parse(data);
          if (sessionData.id === userId) {
            sessions.push({
              sessionId: key.replace(this.prefix, ''),
              ...sessionData
            });
          }
        }
      }

      return sessions;
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return [];
    }
  }

  // Clear all sessions for a user
  async clearUserSessions(userId) {
    try {
      const sessions = await this.getUserSessions(userId);
      const deletePromises = sessions.map(session => 
        this.deleteUserSession(session.sessionId)
      );
      await Promise.all(deletePromises);
      console.log(`Cleared ${sessions.length} sessions for user ${userId}`);
      return sessions.length;
    } catch (error) {
      console.error('Error clearing user sessions:', error);
      return 0;
    }
  }
}

// Create singleton instance
const sessionStore = new SessionStore();

export { sessionStore, SessionStore };
