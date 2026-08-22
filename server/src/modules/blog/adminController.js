const { User, Blog, Newsletter, Chapter, Subject, Contact, ForumTopic } = require('../../models');
const AdminNotification = require('../admin/AdminNotification');
const mongoose = require('mongoose');

// GET /api/admin/stats  -- admin only
const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalBlogs,
      publishedBlogs,
      totalSubscribers,
      totalChapters,
      totalSubjects,
      unreadContacts,
      totalForumTopics,
      recentBlogs,
      recentTopics,
      recentContacts,
      subjectsList,
    ] = await Promise.all([
      User.countDocuments(),
      Blog.countDocuments(),
      Blog.countDocuments({ status: 'published' }),
      Newsletter.countDocuments({ isActive: true }),
      Chapter.countDocuments(),
      Subject.countDocuments(),
      Contact.countDocuments({ isRead: false }),
      ForumTopic ? ForumTopic.countDocuments().catch(() => 0) : 0,
      Blog.find()
        .select('_id title category views status slug updatedAt createdAt coverImage')
        .sort({ updatedAt: -1 })
        .limit(10)
        .lean(),
      ForumTopic ? ForumTopic.find()
        .select('_id title replyCount category isPinned createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean().catch(() => []) : [],
      Contact.find({ isRead: false })
        .select('_id name email subject type createdAt message')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Subject.find()
        .select('_id title slug icon isFree chapters')
        .lean(),
    ]);

    // Enhance subjects with real chapter count
    const courseArchitecture = await Promise.all(
      subjectsList.map(async (subj) => {
        const chapterCount = await Chapter.countDocuments({ subject: subj._id });
        return {
          _id: subj._id,
          title: subj.title,
          slug: subj.slug,
          icon: subj.icon || '🎓',
          chapterCount,
          isFree: subj.isFree,
        };
      })
    );

    res.json({
      totalUsers,
      totalBlogs,
      publishedBlogs,
      draftBlogs: totalBlogs - publishedBlogs,
      totalSubscribers,
      totalChapters,
      totalSubjects,
      unreadContacts,
      totalForumTopics,
      recentBlogs: recentBlogs.map((b) => ({
        id: b._id,
        _id: b._id,
        title: b.title,
        category: b.category || 'General',
        engagement: b.views ? `${b.views.toLocaleString()}` : '0',
        status: b.status === 'published' ? 'Published' : 'Draft',
        slug: b.slug,
        icon: b.status === 'published' ? '📝' : '📄',
        updatedAt: b.updatedAt,
      })),
      communityPulse: recentContacts.length > 0
        ? recentContacts.map((c) => ({
            id: c._id,
            title: c.subject || `${c.type.toUpperCase()} from ${c.name}`,
            subtext: c.email,
            type: c.type,
            createdAt: c.createdAt,
          }))
        : recentTopics.map((t) => ({
            id: t._id,
            title: t.title,
            subtext: `${t.replyCount || 0} replies`,
            type: 'forum',
            createdAt: t.createdAt,
          })),
      courseArchitecture,
      systemHealth: {
        nodeUptime: `${Math.floor(process.uptime() / 60)}m`,
        dbState: mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting',
        memoryUsage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
      },
    });
  } catch (err) {
    console.error('[getStats Error]', err);
    res.status(500).json({ message: 'Failed to fetch admin stats' });
  }
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
