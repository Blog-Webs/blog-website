const { Blog, Chapter, Subject } = require('../../models');

// GET /api/search?q=...
// Searches blog posts and learning chapters/subjects in parallel, and returns
// breadcrumb data for the frontend to build working links.
const globalSearch = async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q || q.length < 2) {
    return res.json({ blogs: [], chapters: [], topics: [] });
  }

  const [blogs, chapters, subjects] = await Promise.all([
    Blog.find({ status: 'published', $text: { $search: q } })
      .select('title subtitle slug coverImage category')
      .limit(5)
      .lean(),

    Chapter.find({ $text: { $search: q } })
      .select('title chapterNumber subject')
      .populate('subject', 'name slug color')
      .limit(6)
      .lean(),

    Subject.find({ name: { $regex: q, $options: 'i' } })
      .select('name slug description color')
      .limit(5)
      .lean(),
  ]);

  // Map subjects to "topics" key to preserve frontend API compatibility
  const mappedTopics = subjects.map(s => ({
    _id: s._id,
    name: s.name,
    slug: s.slug,
    description: s.description,
    subject: { name: s.name, slug: s.slug, color: s.color }
  }));

  res.json({ blogs, chapters, topics: mappedTopics });
};

module.exports = { globalSearch };
