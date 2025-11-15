/**
 * CropWise - Redis Configuration
 */

const redis = require('redis');
const logger = require('../utils/logger');

let redisClient = null;

const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        reconnectStrategy: false // Disable auto-reconnect for optional Redis
      },
      password: process.env.REDIS_PASSWORD || undefined,
      legacyMode: false
    });

    // Only log errors if connection was initially successful
    let connected = false;

    redisClient.on('error', (err) => {
      // Only log ongoing errors if we were previously connected
      if (connected) {
        logger.error('Redis error:', err);
      }
    });

    redisClient.on('connect', () => {
      connected = true;
      logger.info('Redis connected');
    });

    await redisClient.connect();
    
    return redisClient;
  } catch (error) {
    // Clean up client on failed connection
    if (redisClient) {
      try {
        await redisClient.quit();
      } catch (e) {
        // Ignore cleanup errors
      }
      redisClient = null;
    }
    // Re-throw to let caller handle
    throw error;
  }
};

const getRedisClient = () => {
  // Return null if Redis is not available (optional service)
  return redisClient;
};

module.exports = {
  connectRedis,
  getRedisClient
};

