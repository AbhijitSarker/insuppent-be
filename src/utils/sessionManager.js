import { sessionStore } from '../utils/sessionStore.js';
import { redisClient } from '../db/redis.js';

class SessionManager {
  constructor() {
    this.store = sessionStore;
  }

  // Get all active sessions
  async getAllActiveSessions() {
    try {
      const pattern = 'session:*';
      const keys = await redisClient.keys(pattern);
      const sessions = [];

      for (const key of keys) {
        const data = await redisClient.get(key);
        if (data) {
          const sessionData = JSON.parse(data);
          const ttl = await redisClient.ttl(key);
          sessions.push({
            sessionId: key.replace('session:', ''),
            userId: sessionData.id,
            email: sessionData.email,
            name: sessionData.name,
            loginAt: sessionData.loginAt,
            lastAccessed: sessionData.lastAccessed,
            ttl: ttl,
            expiresIn: ttl > 0 ? new Date(Date.now() + ttl * 1000).toISOString() : 'Never'
          });
        }
      }

      return sessions.sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed));
    } catch (error) {
      console.error('Error getting all active sessions:', error);
      return [];
    }
  }

  // Get sessions by user ID
  async getSessionsByUserId(userId) {
    try {
      return await this.store.getUserSessions(userId);
    } catch (error) {
      console.error('Error getting sessions by user ID:', error);
      return [];
    }
  }

  // Clean expired sessions manually (Redis handles this automatically)
  async cleanExpiredSessions() {
    try {
      const allSessions = await this.getAllActiveSessions();
      let cleanedCount = 0;

      for (const session of allSessions) {
        if (session.ttl <= 0) {
          await this.store.deleteUserSession(session.sessionId);
          cleanedCount++;
        }
      }

      return cleanedCount;
    } catch (error) {
      console.error('Error cleaning expired sessions:', error);
      return 0;
    }
  }

  // Get session statistics
  async getSessionStats() {
    try {
      const allSessions = await this.getAllActiveSessions();
      const now = new Date();
      
      const stats = {
        totalActiveSessions: allSessions.length,
        uniqueUsers: new Set(allSessions.map(s => s.userId)).size,
        recentSessions: allSessions.filter(s => 
          new Date(s.lastAccessed) > new Date(now - 24 * 60 * 60 * 1000)
        ).length,
        oldestSession: allSessions.length > 0 ? allSessions[allSessions.length - 1].loginAt : null,
        newestSession: allSessions.length > 0 ? allSessions[0].loginAt : null
      };

      return stats;
    } catch (error) {
      console.error('Error getting session stats:', error);
      return null;
    }
  }

  // Force logout user (clear all their sessions)
  async forceLogoutUser(userId) {
    try {
      return await this.store.clearUserSessions(userId);
    } catch (error) {
      console.error('Error force logging out user:', error);
      return 0;
    }
  }
}

// Create singleton instance
const sessionManager = new SessionManager();

export { sessionManager, SessionManager };
