const StudentOSCache = require('../models/StudentOSCache');

async function getCached(userId, key) {
  try {
    const entry = await StudentOSCache.findOne({ user: userId, cacheKey: key });
    if (entry && entry.expiresAt > new Date()) return entry.data;
    return null;
  } catch { return null; }
}

async function setCache(userId, key, data, ttlMs = 5 * 60 * 1000) {
  try {
    await StudentOSCache.findOneAndUpdate(
      { user: userId, cacheKey: key },
      { data, expiresAt: new Date(Date.now() + ttlMs) },
      { upsert: true }
    );
  } catch {}
}

module.exports = { getCached, setCache };
