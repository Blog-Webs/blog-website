const { OAuth2Client } = require('google-auth-library');
const { User } = require('../../models');
const { signToken } = require('../../utils/jwt');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const getAdminEmailList = () =>
  (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

// POST /api/auth/google
// Body: { credential } -- the ID token from Google Identity Services on the frontend
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Missing Google credential.' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email_verified) {
      return res.status(401).json({ message: 'Google account email is not verified.' });
    }

    const { sub: googleId, email, name, picture } = payload;
    const adminEmails = getAdminEmailList();
    const shouldBeAdmin = adminEmails.includes(email.toLowerCase());

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      user.name = name || user.name;
      user.avatar = picture || user.avatar;
      user.lastLoginAt = new Date();
      // Sync admin role on every login in case ADMIN_EMAILS changed.
      if (shouldBeAdmin && user.role !== 'admin') user.role = 'admin';
      if (!shouldBeAdmin && user.role === 'admin') user.role = 'user';
      await user.save();
    } else {
      user = await User.create({
        googleId,
        email,
        name: name || email.split('@')[0],
        avatar: picture || '',
        role: shouldBeAdmin ? 'admin' : 'user',
      });
      // Fire and forget welcome event
      const eventBus = require('../../events/EventBus');
      eventBus.emit('UserRegistered', user);
    }

    const token = signToken(user);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        theme: user.theme,
      },
    });
  } catch (err) {
    console.error('[googleLogin]', err.message);
    res.status(401).json({ message: 'Google sign-in failed. Please try again.' });
  }
};

// POST /api/auth/logout
// With Bearer tokens there's no server-side cookie to clear — the frontend
// simply discards its stored token. This endpoint is kept for API
// consistency and as a hook for future server-side token revocation.
const logout = (req, res) => {
  res.status(200).json({ message: 'Signed out.' });
};

// GET /api/auth/me
const getMe = async (req, res) => {
  if (!req.user) {
    return res.status(200).json({ user: null });
  }
  res.status(200).json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      role: req.user.role,
      theme: req.user.theme,
    },
  });
};

// PATCH /api/auth/theme
const updateTheme = async (req, res) => {
  const { theme } = req.body;
  if (!['light', 'dark'].includes(theme)) {
    return res.status(400).json({ message: 'Theme must be "light" or "dark".' });
  }
  req.user.theme = theme;
  await req.user.save();
  res.status(200).json({ theme: req.user.theme });
};

module.exports = { googleLogin, logout, getMe, updateTheme };
