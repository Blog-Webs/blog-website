const AcademicProfile = require('../models/AcademicProfile');

// 30-second in-memory cache for academic profiles per user to avoid database overhead on parallel requests
const profileCache = new Map();
const PROFILE_CACHE_TTL_MS = 30 * 1000;

function invalidateProfileCache(userId) {
  if (userId) profileCache.delete(userId.toString());
}

/**
 * requireProfile middleware — ensures the student has completed onboarding.
 * Must run AFTER requireAuth.
 */
const requireProfile = async (req, res, next) => {
  try {
    const userIdStr = req.user._id.toString();
    const cached = profileCache.get(userIdStr);
    const now = Date.now();

    if (cached && now < cached.expiresAt) {
      req.academicProfile = cached.profile;
      return next();
    }

    const profile = await AcademicProfile.findOne({ user: req.user._id }).lean();
    if (!profile) {
      return res.status(403).json({
        message: 'Academic profile not found. Please complete onboarding first.',
        code: 'PROFILE_NOT_FOUND',
        redirectTo: '/student-os/onboarding',
      });
    }

    profileCache.set(userIdStr, {
      profile,
      expiresAt: now + PROFILE_CACHE_TTL_MS,
    });

    req.academicProfile = profile;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = requireProfile;
module.exports.invalidateProfileCache = invalidateProfileCache;
