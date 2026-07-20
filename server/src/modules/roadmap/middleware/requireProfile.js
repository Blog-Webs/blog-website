const AcademicProfile = require('../models/AcademicProfile');
const { User } = require('../../../models');

/**
 * requireProfile middleware — ensures the student has completed onboarding.
 * Must run AFTER requireAuth.
 * Routes that need a profile to function should use this.
 */
const requireProfile = async (req, res, next) => {
  try {
    const profile = await AcademicProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(403).json({
        message: 'Academic profile not found. Please complete onboarding first.',
        code: 'PROFILE_NOT_FOUND',
        redirectTo: '/student-os/onboarding',
      });
    }
    req.academicProfile = profile;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = requireProfile;
