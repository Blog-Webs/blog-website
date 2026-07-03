const Redis = require('ioredis');

// Ensure Redis connection doesn't crash the server if URL is missing
const client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const get = async (key) => {
  try {
    const val = await client.get(key);
    return val ? JSON.parse(val) : null;
  } catch (error) {
    console.error(`[Redis] Error getting key ${key}:`, error);
    return null;
  }
};

const set = async (key, value, ttlMs = 300000) => {
  try {
    await client.set(key, JSON.stringify(value), 'PX', ttlMs);
  } catch (error) {
    console.error(`[Redis] Error setting key ${key}:`, error);
  }
};

const del = async (keyOrPrefix) => {
  try {
    if (keyOrPrefix.endsWith('*')) {
      const keys = await client.keys(keyOrPrefix);
      if (keys.length) await client.del(...keys);
    } else {
      await client.del(keyOrPrefix);
    }
  } catch (error) {
    console.error(`[Redis] Error deleting key ${keyOrPrefix}:`, error);
  }
};

const flush = async () => {
  try {
    await client.flushdb();
  } catch (error) {
    console.error('[Redis] Error flushing DB:', error);
  }
};

module.exports = { get, set, del, flush };
