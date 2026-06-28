const { Blog, Chapter, Topic } = require('../models');

// GET /api/search?q=...
// Searches blog posts and learning chapters/topics in parallel, and returns
// just enough breadcrumb data (subject + topic slugs) for the frontend to
// build a working link straight to the result.
const globalSearch = async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q || q.length < 2) {
    return res.json({ blogs: [], chapters: [], topics: [] });
  }

  const [blogs, chapters, topics] = await Promise.all([
    Blog.find({ status: 'published', $text: { $search: q } })
      .select('title subtitle slug coverImage category')
      .limit(5),

    Chapter.find({ $text: { $search: q } })
      .select('title chapterNumber track')
      .populate({
        path: 'track',
        select: 'name slug topic',
        populate: { path: 'topic', select: 'name slug subject', populate: { path: 'subject', select: 'name slug color' } },
      })
      .limit(6),

    Topic.find({ name: { $regex: q, $options: 'i' } })
      .select('name slug subject description')
      .populate('subject', 'name slug color')
      .limit(5),
  ]);

  res.json({ blogs, chapters, topics });
};

module.exports = { globalSearch };
