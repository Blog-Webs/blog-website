const mongoose = require('mongoose');

/**
 * Caches Google API responses to avoid hitting rate limits.
 * Each cache entry stores a JSON payload keyed by (user + cacheKey).
 * Auto-expires via MongoDB TTL index.
 */
const studentOSCacheSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Unique key for this data, e.g. "classroom:courses", "drive:files:recent"
    cacheKey: { type: String, required: true },
    // JSON-serialized data
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    // TTL: MongoDB will auto-delete expired entries
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true }
);

// Compound index to quickly find a specific user+key combination
studentOSCacheSchema.index({ user: 1, cacheKey: 1 }, { unique: true });

module.exports = mongoose.model('StudentOSCache', studentOSCacheSchema);
