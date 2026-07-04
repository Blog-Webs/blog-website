const slugify = require('slugify');
const { Series, Blog } = require('../../models');

// GET /api/series  -- public, list all series with their post counts
const getAllSeries = async (req, res) => {
  const series = await Series.find().sort({ createdAt: -1 });

  const withCounts = await Promise.all(
    series.map(async (s) => {
      const postCount = await Blog.countDocuments({ series: s._id, status: 'published' });
      return { ...s.toObject(), postCount };
    })
  );

  res.json({ series: withCounts });
};

// GET /api/series/:slug  -- public, a series with its ordered posts
const getSeriesBySlug = async (req, res) => {
  const series = await Series.findOne({ slug: req.params.slug });
  if (!series) return res.status(404).json({ message: 'Series not found.' });

  const posts = await Blog.find({ series: series._id, status: 'published' })
    .select('title subtitle slug coverImage readTimeMinutes seriesOrder publishedAt')
    .sort({ seriesOrder: 1 });

  res.json({ series, posts });
};

// POST /api/series  -- admin only
const createSeries = async (req, res) => {
  const { title, description, coverImage } = req.body;
  if (!title?.trim()) return res.status(400).json({ message: 'Title is required.' });

  let slug = slugify(title, { lower: true, strict: true });
  const existingCount = await Series.countDocuments({ slug: new RegExp(`^${slug}`) });
  if (existingCount > 0) slug = `${slug}-${existingCount + 1}`;

  const series = await Series.create({ title, slug, description, coverImage });
  res.status(201).json({ series });
};

// PATCH /api/series/:id  -- admin only
const updateSeries = async (req, res) => {
  const series = await Series.findById(req.params.id);
  if (!series) return res.status(404).json({ message: 'Series not found.' });

  const { title, description, coverImage } = req.body;
  if (title && title !== series.title) {
    series.title = title;
    let slug = slugify(title, { lower: true, strict: true });
    const existingCount = await Series.countDocuments({ slug: new RegExp(`^${slug}`), _id: { $ne: series._id } });
    series.slug = existingCount > 0 ? `${slug}-${existingCount + 1}` : slug;
  }
  if (description !== undefined) series.description = description;
  if (coverImage !== undefined) series.coverImage = coverImage;

  await series.save();
  res.json({ series });
};

// DELETE /api/series/:id  -- admin only. Posts in the series are NOT deleted,
// just detached (their `series` reference is cleared).
const deleteSeries = async (req, res) => {
  const series = await Series.findByIdAndDelete(req.params.id);
  if (!series) return res.status(404).json({ message: 'Series not found.' });

  await Blog.updateMany({ series: series._id }, { series: null, seriesOrder: 0 });

  res.json({ message: 'Series deleted. Posts that were in it remain published, just no longer grouped.' });
};

module.exports = { getAllSeries, getSeriesBySlug, createSeries, updateSeries, deleteSeries };
