const fs = require('fs');
const { User, AcademicProfile } = require('../../../models');
const cloudinary = require('../../../config/cloudinary');

const profileController = {
  // POST /api/studentos/profile/avatar — Upload avatar to Cloudinary
  async uploadAvatar(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      let avatarUrl = '';

      // Check if Cloudinary is configured
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        const uploadRes = await cloudinary.uploader.upload(req.file.path, {
          folder: 'studentos/avatars',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
        });
        avatarUrl = uploadRes.secure_url;
      } else {
        // Fallback: create base64 data URI if cloudinary not configured in current environment
        const fileData = fs.readFileSync(req.file.path);
        const mime = req.file.mimetype || 'image/png';
        avatarUrl = `data:${mime};base64,${fileData.toString('base64')}`;
      }

      // Clean up local temp file
      try {
        fs.unlinkSync(req.file.path);
      } catch {}

      // Update User document in MongoDB
      const user = await User.findById(req.user._id);
      if (user) {
        user.avatar = avatarUrl;
        await user.save();
      }

      // Also update AcademicProfile profilePhotoUrl
      await AcademicProfile.findOneAndUpdate(
        { user: req.user._id },
        { profilePhotoUrl: avatarUrl },
        { upsert: true }
      );

      res.json({
        success: true,
        message: 'Profile photo uploaded to Cloudinary successfully',
        avatarUrl,
      });
    } catch (err) {
      console.error('[uploadAvatar error]', err);
      if (req.file?.path) {
        try { fs.unlinkSync(req.file.path); } catch {}
      }
      res.status(500).json({ message: 'Failed to upload profile photo', error: err.message });
    }
  },
  // GET /api/studentos/profile — Get full student profile
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user._id).select('name email avatar role theme');
      let academic = await AcademicProfile.findOne({ user: req.user._id });

      if (!academic) {
        academic = await AcademicProfile.create({
          user: req.user._id,
          careerGoal: 'Software Engineer',
          careerGoalLabel: 'Full Stack Software Engineer',
        });
      }

      res.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
        academic,
      });
    } catch (err) {
      console.error('[getProfile error]', err);
      res.status(500).json({ message: 'Failed to fetch student profile', error: err.message });
    }
  },

  // PUT /api/studentos/profile — Update student profile
  async updateProfile(req, res) {
    try {
      const {
        name,
        avatar,
        collegeName,
        degree,
        branch,
        yearOfStudy,
        semester,
        percentageOrCgpa,
        areaOfInterest,
        targetGraduationYear,
        phone,
        address,
        location,
        linkedInUrl,
        githubUrl,
        bio,
        careerGoal,
        careerGoalLabel,
        learningStyle,
        studyHoursPerDay,
        selfSkillRatings,
      } = req.body;

      // 1. Update User basic info
      const user = await User.findById(req.user._id);
      if (name) user.name = name.trim();
      if (avatar !== undefined) user.avatar = avatar.trim();
      await user.save();

      // 2. Update or create AcademicProfile
      const updateData = {
        collegeName: collegeName !== undefined ? collegeName.trim() : '',
        degree: degree !== undefined ? degree.trim() : '',
        branch: branch !== undefined ? branch.trim() : '',
        yearOfStudy: Number(yearOfStudy) || 1,
        semester: Number(semester) || 1,
        percentageOrCgpa: percentageOrCgpa !== undefined ? percentageOrCgpa.trim() : '',
        areaOfInterest: areaOfInterest !== undefined ? areaOfInterest.trim() : '',
        targetGraduationYear: Number(targetGraduationYear) || 2026,
        phone: phone !== undefined ? phone.trim() : '',
        address: address !== undefined ? address.trim() : '',
        location: location !== undefined ? location.trim() : '',
        linkedInUrl: linkedInUrl !== undefined ? linkedInUrl.trim() : '',
        githubUrl: githubUrl !== undefined ? githubUrl.trim() : '',
        bio: bio !== undefined ? bio.trim() : '',
        careerGoal: careerGoal || 'software_engineer',
        careerGoalLabel: careerGoalLabel || 'Software Engineer',
      };

      if (learningStyle) updateData.learningStyle = learningStyle;
      if (studyHoursPerDay) updateData.studyHoursPerDay = Number(studyHoursPerDay);
      if (Array.isArray(selfSkillRatings)) updateData.selfSkillRatings = selfSkillRatings;

      const academic = await AcademicProfile.findOneAndUpdate(
        { user: req.user._id },
        updateData,
        { upsert: true, new: true, runValidators: false }
      );

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
        academic,
      });
    } catch (err) {
      console.error('[updateProfile error]', err);
      res.status(500).json({ message: 'Failed to update profile', error: err.message });
    }
  },

  // GET /api/admin/studentos/students — Admin endpoint to view all student profiles
  async getAdminStudents(req, res) {
    try {
      const { q = '', page = 1, limit = 20 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      let userQuery = {};
      if (q && q.trim()) {
        const regex = new RegExp(q.trim(), 'i');
        userQuery = {
          $or: [{ name: regex }, { email: regex }],
        };
      }

      const users = await User.find(userQuery)
        .select('name email avatar role createdAt lastLoginAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const totalUsers = await User.countDocuments(userQuery);

      // Fetch academic profiles for these users
      const userIds = users.map(u => u._id);
      const profiles = await AcademicProfile.find({ user: { $in: userIds } });

      const profileMap = {};
      profiles.forEach(p => {
        profileMap[p.user.toString()] = p;
      });

      const students = users.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        role: u.role,
        createdAt: u.createdAt,
        lastLoginAt: u.lastLoginAt,
        academic: profileMap[u._id.toString()] || null,
      }));

      res.json({
        students,
        total: totalUsers,
        page: Number(page),
        totalPages: Math.ceil(totalUsers / Number(limit)),
      });
    } catch (err) {
      console.error('[getAdminStudents error]', err);
      res.status(500).json({ message: 'Failed to fetch students for admin', error: err.message });
    }
  },
};

module.exports = profileController;