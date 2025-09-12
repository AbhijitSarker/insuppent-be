import { createClient } from 'redis';
import config from '../config/index.js';

// Create Redis client configuration
const redisConfig = {
  socket: {
    host: config.redis.host,
    port: config.redis.port,
  },
};

// Only add password if it exists and is not empty
if (config.redis.password && config.redis.password.trim() !== '') {
  redisConfig.password = config.redis.password;
}

const redisClient = createClient(redisConfig);

// Handle Redis events
redisClient.on('error', err => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Redis Client Connected');
});

redisClient.on('ready', () => {
  console.log('Redis Client Ready');
});

// Connect to Redis
const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('✅ Redis connected successfully');
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
  }
};

export { redisClient, connectRedis };
