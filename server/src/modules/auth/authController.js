const googleLoginUseCase = require('./application/useCases/GoogleLoginUseCase');

// POST /api/auth/google
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    const result = await googleLoginUseCase.execute(credential);
    return res.status(200).json(result);
  } catch (err) {
    console.error('[googleLogin]', err.message);
    return res.status(err.status || 401).json({ message: err.message || 'Google sign-in failed. Please try again.' });
  }
};

// POST /api/auth/logout
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
