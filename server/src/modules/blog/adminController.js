const { User, Blog, Newsletter, Chapter, Topic, Subject } = require('../../models');
const AdminNotification = require('../admin/AdminNotification');

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

// GET /api/admin/notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await AdminNotification.find()
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

// PUT /api/admin/notifications/:id/read
const markNotificationRead = async (req, res) => {
  try {
    const notification = await AdminNotification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Error marking notification read' });
  }
};

module.exports = { getStats, checkAdmin, getNotifications, markNotificationRead };
