const { Bookmark } = require('../../models');

// GET /api/bookmarks
const getBookmarks = async (req, res) => {
  const bookmarks = await Bookmark.find({ user: req.user._id })
    .populate({
      path: 'chapter',
      select: 'title chapterNumber track',
      populate: {
        path: 'track',
        select: 'name slug topic',
        populate: {
          path: 'topic',
          select: 'name slug subject',
          populate: { path: 'subject', select: 'name slug' },
        },
      },
    })
    .populate('blog', 'title subtitle slug coverImage readTimeMinutes')
    .sort({ createdAt: -1 });

  res.json({ bookmarks });
};

// POST /api/bookmarks  Body: { itemType: 'chapter'|'blog', itemId }
const toggleBookmark = async (req, res) => {
  const { itemType, itemId } = req.body;
  if (!['chapter', 'blog'].includes(itemType) || !itemId) {
    return res.status(400).json({ message: 'itemType and itemId are required.' });
  }

  const filter = {
    user: req.user._id,
    itemType,
    [itemType]: itemId,
  };

  const existing = await Bookmark.findOne(filter);
  if (existing) {
    await existing.deleteOne();
    return res.json({ bookmarked: false });
  }

  await Bookmark.create(filter);
  res.json({ bookmarked: true });
};

module.exports = { getBookmarks, toggleBookmark };
