const { User, Blog, Newsletter, Chapter, Topic, Subject } = require('../models');

// GET /api/admin/stats  -- admin only
const getStats = async (req, res) => {
  const [totalUsers, totalBlogs, publishedBlogs, totalSubscribers, totalChapters, totalTopics, totalSubjects] =
    await Promise.all([
      User.countDocuments(),
      Blog.countDocuments(),
      Blog.countDocuments({ status: 'published' }),
      Newsletter.countDocuments({ isActive: true }),
      Chapter.countDocuments(),
      Topic.countDocuments(),
      Subject.countDocuments(),
    ]);

  res.json({
    totalUsers,
    totalBlogs,
    publishedBlogs,
    draftBlogs: totalBlogs - publishedBlogs,
    totalSubscribers,
    totalChapters,
    totalTopics,
    totalSubjects,
  });
};

// GET /api/admin/check  -- lets the frontend confirm admin status before rendering /admin-portal
const checkAdmin = (req, res) => {
  res.json({ isAdmin: true });
};

module.exports = { getStats, checkAdmin };
