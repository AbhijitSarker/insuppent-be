#!/usr/bin/env node
/**
 * Redis Session Test Script
 * 
 * This script tests the Redis session functionality
 * Run with: node src/scripts/testRedisSession.js
 */

import { connectRedis } from '../db/redis.js';
import { sessionStore } from '../utils/sessionStore.js';
import { sessionManager } from '../utils/sessionManager.js';

async function testRedisSession() {
  try {
    console.log('🔄 Connecting to Redis...');
    await connectRedis();
    
    console.log('✅ Testing session storage...\n');

    // Test data
    const testUserData = {
      id: 'test-user-123',
      name: 'Test User',
      email: 'test@example.com',
      subscription: 'Premium',
      status: 'Active',
      role: 'subscriber',
      wpUserId: 'wp-123'
    };

    // Test 1: Create session
    console.log('1️⃣ Creating test session...');
    const sessionId = sessionStore.generateSessionId();
    await sessionStore.saveUserSession(sessionId, testUserData, 3600); // 1 hour
    console.log(`   ✅ Session created with ID: ${sessionId}`);

    // Test 2: Retrieve session
    console.log('\n2️⃣ Retrieving session...');
    const retrievedSession = await sessionStore.getUserSession(sessionId);
    console.log('   ✅ Session retrieved:', {
      id: retrievedSession?.id,
      email: retrievedSession?.email,
      lastAccessed: retrievedSession?.lastAccessed
    });

    // Test 3: Check session existence
    console.log('\n3️⃣ Checking session existence...');
    const exists = await sessionStore.sessionExists(sessionId);
    console.log(`   ✅ Session exists: ${exists}`);

    // Test 4: Get session stats
    console.log('\n4️⃣ Getting session statistics...');
    const stats = await sessionManager.getSessionStats();
    console.log('   ✅ Session stats:', stats);

    // Test 5: Get all active sessions
    console.log('\n5️⃣ Getting all active sessions...');
    const allSessions = await sessionManager.getAllActiveSessions();
    console.log(`   ✅ Found ${allSessions.length} active sessions`);
    allSessions.forEach((session, index) => {
      console.log(`      ${index + 1}. User: ${session.email} | TTL: ${session.ttl}s`);
    });

    // Test 6: Extend session
    console.log('\n6️⃣ Extending session TTL...');
    const extended = await sessionStore.extendSession(sessionId, 7200); // 2 hours
    console.log(`   ✅ Session extended: ${extended}`);

    // Test 7: Clean up
    console.log('\n7️⃣ Cleaning up test session...');
    const deleted = await sessionStore.deleteUserSession(sessionId);
    console.log(`   ✅ Session deleted: ${deleted}`);

    console.log('\n🎉 All tests completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testRedisSession();
