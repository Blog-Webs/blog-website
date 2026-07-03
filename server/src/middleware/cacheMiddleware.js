const redisCache = require('../utils/cache');

/**
 * Express Middleware for caching API responses via Redis and Edge CDN (Vercel).
 * @param {string} keyPrefix - Prefix for the redis key (e.g., 'blogs')
 * @param {number} ttlSeconds - Time-To-Live in seconds for Redis and Cache-Control
 */
const cacheMiddleware = (keyPrefix, ttlSeconds = 300) => async (req, res, next) => {
  // Only cache GET requests
  if (req.method !== 'GET') return next();

  // Construct a unique key based on URL and query params
  const key = `${keyPrefix}:${req.originalUrl}`;
  
  try {
    const cachedData = await redisCache.get(key);
    
    // Set Edge Cache headers (Vercel / Cloudflare)
    // s-maxage tells the CDN to cache for ttlSeconds
    // stale-while-revalidate tells CDN to serve stale content while fetching fresh content in background
    res.setHeader('Cache-Control', `public, s-maxage=${ttlSeconds}, stale-while-revalidate=${ttlSeconds * 2}`);
    
    if (cachedData) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cachedData);
    }

    // Override res.json to capture the response and store it in Redis
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      // Store in Redis (convert TTL to ms)
      redisCache.set(key, body, ttlSeconds * 1000).catch(err => {
        console.error('[Redis] Failed to save response to cache', err);
      });
      
      res.setHeader('X-Cache', 'MISS');
      originalJson(body);
    };

    next();
  } catch (error) {
    console.error('[Cache Middleware Error]:', error);
    next(); // Fallback to normal request on Redis failure
  }
};

module.exports = cacheMiddleware;
