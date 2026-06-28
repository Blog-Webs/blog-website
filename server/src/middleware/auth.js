const { verifyToken } = require('../utils/jwt');
const { User } = require('../models');

// Reads the JWT from the Authorization header ("Bearer <token>"), attaches
// req.user if valid. Does NOT block the request if absent — use
// `requireAuth` for that.
//
// We use a header instead of a cookie because the frontend (Vercel) and
// backend (Render) live on different top-level domains. Cross-site cookies
// are increasingly blocked by browsers by default (Safari ITP, Chrome's
// third-party cookie phase-out, Brave, etc.) even with secure+SameSite=None
// set correctly, which makes them unreliable for this exact deployment
// shape. A Bearer token has no such restriction — the browser doesn't
// apply any of that policy to a normal Authorization header.
const attachUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      req.user = null;
      return next();
    }
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-__v');
    req.user = user || null;
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

// Server-side admin gate. Checks BOTH the user's stored role AND the
// live ADMIN_EMAILS env list, so revoking admin access only requires
// an env change + role sync, never trusts the client.
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
    // Deliberately a generic 404, not 403 — never confirm the admin route exists
    // to a non-admin caller.
    return res.status(404).json({ message: 'Not found.' });
  }
  next();
};

module.exports = { attachUser, requireAuth, requireAdmin };
