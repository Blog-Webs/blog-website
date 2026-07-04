const StudentOSToken = require('../models/StudentOSToken');

/**
 * Middleware: ensures the user has connected Google Workspace (StudentOS).
 * Must run AFTER the existing `requireAuth` middleware.
 */
const requireStudentOS = async (req, res, next) => {
  try {
    const token = await StudentOSToken.findOne({ user: req.user._id, isActive: true });
    if (!token) {
      return res.status(401).json({
        message: 'Google Workspace not connected. Please connect via StudentOS first.',
        code: 'STUDENTOS_NOT_CONNECTED',
      });
    }
    req.studentOSToken = token;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = requireStudentOS;
