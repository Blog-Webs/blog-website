const UserNotification = require('./UserNotification');

const getNotifications = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    
    // Get all global notifications + specific notifications for the user
    const query = {
      $or: [
        { user: null },
      ]
    };
    if (userId) {
      query.$or.push({ user: userId });
    }

    const list = await UserNotification.find(query).sort({ createdAt: -1 }).limit(10);
    
    // If no notifications exist yet, we seed a dynamic default announcement
    if (list.length === 0) {
      const defaultNotification = await UserNotification.create({
        type: 'SYSTEM',
        title: 'Welcome Alert',
        message: 'Stay updated! Join 1,248 other developers.',
        link: '/forum'
      });
      list.push(defaultNotification);
    }
    
    // Map notifications to include isRead status for the current user
    const mapped = list.map(item => {
      const doc = item.toObject();
      if (!item.user) {
        doc.isRead = userId ? item.readBy.some(id => id.toString() === userId.toString()) : false;
      } else {
        doc.isRead = item.isRead;
      }
      return doc;
    });

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const readAllNotifications = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // For global notifications, add userId to readBy if not already present
    await UserNotification.updateMany(
      { user: null, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );

    // For user-specific notifications, set isRead to true
    await UserNotification.updateMany(
      { user: userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getNotifications, readAllNotifications };
