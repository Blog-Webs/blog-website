const { verifyToken } = require('../utils/jwt');
const { User } = require('../models');

// Short-TTL in-memory cache for user objects (30s) to prevent redundant DB lookups on rapid parallel requests
const userCache = new Map();
const USER_CACHE_TTL_MS = 30 * 1000;

function invalidateUserCache(userId) {
  if (userId) userCache.delete(userId.toString());
}

/**
 * Reads the JWT from the Authorization header ("Bearer <token>"), attaches
 * req.user if valid.
 */
const attachUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      req.user = null;
      return next();
    }
    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      req.user = null;
      return next();
    }

    const userIdStr = decoded.id.toString();
    const cached = userCache.get(userIdStr);
    const now = Date.now();

    if (cached && now < cached.expiresAt) {
      req.user = cached.user;
      return next();
    }

    const user = await User.findById(decoded.id).select('-__v').lean();
    req.user = user || null;

    if (user) {
      userCache.set(userIdStr, {
        user,
        expiresAt: now + USER_CACHE_TTL_MS,
      });
    }

    next();
  } catch (err) {
    req.user = null;
    next();
  }
};

// Blocks unauthenticated requests. Use after attachUser.
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Please sign in with Google to continue.' });
  }
  next();
};

// Server-side admin gate.
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(404).json({ message: 'Not found.' });
  }
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const isAdmin = req.user.role === 'admin' && adminEmails.includes(req.user.email.toLowerCase());

  if (!isAdmin) {
    return res.status(404).json({ message: 'Not found.' });
  }
  next();
};

module.exports = { attachUser, requireAuth, requireAdmin, invalidateUserCache };
