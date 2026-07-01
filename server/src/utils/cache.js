/**
 * Lightweight in-memory TTL cache.
 * Avoids repeated database hits for frequently-read, rarely-changed data
 * (subjects list, blog lists, individual blog/subject lookups).
 *
 * Drop-in replacement path for Redis: swap `get`/`set`/`del` with
 * ioredis equivalents and serialize values with JSON.stringify/parse.
 *
 * Usage:
 *   const cache = require('../utils/cache');
 *   const cached = cache.get('subjects');
 *   if (cached) return res.json(cached);
 *   // ... fetch from DB ...
 *   cache.set('subjects', data, 5 * 60 * 1000); // 5 min TTL
 */

const store = new Map(); // key → { value, expiresAt }

/**
 * @param {string} key
 * @returns {any|null}  null if missing or expired
 */
const get = (key) => {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
};

/**
 * @param {string} key
 * @param {any}    value
 * @param {number} ttlMs  time-to-live in milliseconds (default: 5 min)
 */
const set = (key, value, ttlMs = 5 * 60 * 1000) => {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
};

/**
 * Invalidate a specific key or a prefix (pass key ending with '*').
 * e.g. del('subject:*') clears all subject-related keys.
 */
const del = (keyOrPrefix) => {
  if (keyOrPrefix.endsWith('*')) {
    const prefix = keyOrPrefix.slice(0, -1);
    for (const k of store.keys()) {
      if (k.startsWith(prefix)) store.delete(k);
    }
  } else {
    store.delete(keyOrPrefix);
  }
};

/** Clear everything — useful in tests. */
const flush = () => store.clear();

module.exports = { get, set, del, flush };
