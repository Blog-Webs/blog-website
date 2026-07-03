const slugify = require('slugify');
const { Blog, Comment, Newsletter } = require('../models');
const cloudinary = require('../config/cloudinary');
const cache = require('../utils/cache');
const { sendBulkMail } = require('../utils/mailer');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Emails every active subscriber that a new post is live. Fire-and-forget
// from the caller's perspective — failures are logged, never thrown, so a
// flaky SMTP provider can't block the publish action itself.
const notifySubscribersOfNewPost = async (blog) => {
  try {
    const subscribers = await Newsletter.find({ isActive: true }).select('email');
    if (subscribers.length === 0) return;

    const postUrl = `${CLIENT_URL}/blog/${blog.slug}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
        <p style="color:#5EEAD4; font-size:12px; letter-spacing:0.05em; text-transform:uppercase;">New on HttpTechNex</p>
        <h2 style="margin:8px 0;">${blog.title}</h2>
        ${blog.subtitle ? `<p style="color:#666; font-size:15px;">${blog.subtitle}</p>` : ''}
        <p style="color:#444; font-size:14px; line-height:1.6;">${blog.excerpt || ''}</p>
        <a href="${postUrl}" style="display:inline-block; margin-top:16px; padding:10px 20px; background:#0D9488; color:#fff; border-radius:8px; text-decoration:none; font-size:14px;">Read the full post</a>
        <p style="color:#999; font-size:12px; margin-top:32px;">
          You're receiving this because you subscribed to the HttpTechNex newsletter.
        </p>
      </div>
    `;

    await sendBulkMail({
      recipients: subscribers.map((s) => s.email),
      subject: `New post: ${blog.title}`,
      html,
      text: `${blog.title}\n\n${blog.excerpt || ''}\n\nRead it here: ${postUrl}`,
    });
  } catch (err) {
    console.error('[notifySubscribersOfNewPost]', err.message);
  }
};

// ---------- Public ----------

// GET /api/blogs?page=1&limit=10&tag=&category=&search=
const getBlogs = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const { tag, category, search } = req.query;

  const cacheKey = `blogs:page:${page}:limit:${limit}:tag:${tag || 'all'}:category:${category || 'all'}:search:${search || 'all'}`;
  const cached = await cache.get(cacheKey);
  if (cached) return res.json(cached);

  const filter = { status: 'published', publishedAt: { $lte: new Date() } };
  if (tag) filter.tags = tag;
  if (category) filter.category = category;
  if (search) filter.$text = { $search: search };

  const [blogs, total] = await Promise.all([
    Blog.find(filter)
      .select('title subtitle slug coverImage excerpt tags category author readTimeMinutes views likes publishedAt')
      .populate('author', 'name avatar')
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Blog.countDocuments(filter),
  ]);

  const payload = { blogs, total, page, pages: Math.ceil(total / limit) };
  await cache.set(cacheKey, payload, 5 * 60 * 1000); // 5 minutes
  res.json(payload);
};

// GET /api/blogs/:slug
const getBlogBySlug = async (req, res) => {
  const cacheKey = `blog:${req.params.slug}`;
  let payload = await cache.get(cacheKey);

  if (!payload) {
    const blog = await Blog.findOne({ slug: req.params.slug, status: 'published', publishedAt: { $lte: new Date() } })
      .populate('author', 'name avatar')
      .populate('series', 'title slug description')
      .lean();
    if (!blog) return res.status(404).json({ message: 'Post not found.' });

    const comments = await Comment.find({ blog: blog._id }).populate('user', 'name avatar').sort({ createdAt: -1 }).lean();

    const upNext = await Blog.find({ status: 'published', publishedAt: { $lte: new Date() }, _id: { $ne: blog._id } })
      .select('title subtitle slug coverImage readTimeMinutes publishedAt')
      .sort({ publishedAt: -1 })
      .limit(4)
      .lean();

    let seriesPosts = [];
    if (blog.series) {
      seriesPosts = await Blog.find({ series: blog.series._id, status: 'published', publishedAt: { $lte: new Date() } })
        .select('title slug coverImage readTimeMinutes seriesOrder')
        .sort({ seriesOrder: 1 })
        .lean();
    }

    payload = { blog, comments, likeCount: blog.likes.length, upNext, seriesPosts };
    await cache.set(cacheKey, payload, 5 * 60 * 1000); // 5 minutes

    // Update views asynchronously
    Blog.updateOne({ _id: blog._id }, { $inc: { views: 1 } }).exec();
  } else {
    // Increment view directly in DB in background if returning from cache
    Blog.updateOne({ slug: req.params.slug }, { $inc: { views: 1 } }).exec();
  }

  res.json(payload);
};

// POST /api/blogs/:slug/like  (requires auth)
const toggleLike = async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug });
  if (!blog) return res.status(404).json({ message: 'Post not found.' });

  const idx = blog.likes.findIndex((id) => id.toString() === req.user._id.toString());
  if (idx >= 0) {
    blog.likes.splice(idx, 1);
  } else {
    blog.likes.push(req.user._id);
  }
  await blog.save();
  res.json({ liked: idx < 0, likeCount: blog.likes.length });
};

// POST /api/blogs/:slug/comments  Body: { text, parentComment? }  (requires auth)
const addComment = async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug });
  if (!blog) return res.status(404).json({ message: 'Post not found.' });

  const { text, parentComment } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ message: 'Comment text is required.' });

  const comment = await Comment.create({
    blog: blog._id,
    user: req.user._id,
    text: text.trim(),
    parentComment: parentComment || null,
  });
  await comment.populate('user', 'name avatar');
  
  await cache.del(`blog:${req.params.slug}`);

  res.status(201).json({ comment });
};

// GET /api/blogs/meta/tags-categories
const getTagsAndCategories = async (req, res) => {
  const cacheKey = 'blogs:tags-categories';
  let payload = await cache.get(cacheKey);

  if (!payload) {
    const blogs = await Blog.find({ status: 'published', publishedAt: { $lte: new Date() } })
      .select('tags category')
      .lean();
    const tags = new Set();
    const categories = new Set();
    blogs.forEach((b) => {
      b.tags.forEach((t) => tags.add(t));
      categories.add(b.category);
    });
    payload = { tags: [...tags], categories: [...categories] };
    await cache.set(cacheKey, payload, 10 * 60 * 1000); // 10 minutes
  }
  res.json(payload);
};

// ---------- Admin ----------

// POST /api/blogs/upload-image  (multipart/form-data, field: image)  -- admin only
const uploadImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image file provided.' });

  try {
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'httptechnex/blogs',
      resource_type: 'image',
    });
    res.json({ url: result.secure_url });
  } catch (err) {
    console.error('[uploadImage]', err.message);
    res.status(500).json({ message: 'Image upload failed.' });
  }
};

// GET /api/blogs/admin/:id  -- admin only, fetch a single post (including drafts) for editing
const getBlogByIdAdmin = async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate('series', 'title slug');
  if (!blog) return res.status(404).json({ message: 'Post not found.' });
  res.json({ blog });
};

// GET /api/blogs/admin/all?page=1&limit=20  -- admin only, includes drafts
const getAllBlogsAdmin = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const [blogs, total] = await Promise.all([
    Blog.find()
      .populate('author', 'name avatar')
      .populate('series', 'title slug')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Blog.countDocuments(),
  ]);

  res.json({ blogs, total, page, pages: Math.ceil(total / limit) });
};

// POST /api/blogs  -- admin only, create draft or publish
const createBlog = async (req, res) => {
  const {
    title, subtitle, content, contentBlocks, headings,
    excerpt, tags, category, coverImage, status, series, seriesOrder,
  } = req.body;

  // `content` (plain text/markdown) is still required as a fallback for
  // search indexing and for any client that hasn't loaded BlockNote yet.
  // The admin UI always sends both: contentBlocks is the source of truth
  // for rendering, content is a derived plain-text version for search.
  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required.' });
  }

  let slug = slugify(title, { lower: true, strict: true });
  const existingCount = await Blog.countDocuments({ slug: new RegExp(`^${slug}`) });
  if (existingCount > 0) slug = `${slug}-${existingCount + 1}`;

  const wordCount = content.split(/\s+/).length;
  const readTimeMinutes = Math.max(1, Math.round(wordCount / 200));

  const blog = await Blog.create({
    title,
    subtitle,
    slug,
    content,
    contentBlocks: contentBlocks || null,
    headings: Array.isArray(headings) ? headings : [],
    excerpt: excerpt || content.slice(0, 200),
    tags: Array.isArray(tags) ? tags : (tags || '').split(',').map((t) => t.trim()).filter(Boolean),
    category: category || 'General',
    coverImage: coverImage || '',
    series: series || null,
    seriesOrder: seriesOrder || 0,
    author: req.user._id,
    status: status === 'published' ? 'published' : 'draft',
    publishedAt: status === 'published' ? new Date() : undefined,
    readTimeMinutes,
  });

  res.status(201).json({ blog });

  if (blog.status === 'published') {
    notifySubscribersOfNewPost(blog);
  }
};

// PATCH /api/blogs/:id  -- admin only, edit / publish / unpublish
const updateBlog = async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.status(404).json({ message: 'Post not found.' });

  const wasPublished = blog.status === 'published';

  const {
    title, subtitle, content, contentBlocks, headings,
    excerpt, tags, category, coverImage, status, series, seriesOrder,
  } = req.body;

  if (title && title !== blog.title) {
    blog.title = title;
    let slug = slugify(title, { lower: true, strict: true });
    const existingCount = await Blog.countDocuments({ slug: new RegExp(`^${slug}`), _id: { $ne: blog._id } });
    blog.slug = existingCount > 0 ? `${slug}-${existingCount + 1}` : slug;
  }
  if (subtitle !== undefined) blog.subtitle = subtitle;
  if (content !== undefined) {
    blog.content = content;
    blog.readTimeMinutes = Math.max(1, Math.round(content.split(/\s+/).length / 200));
  }
  if (contentBlocks !== undefined) blog.contentBlocks = contentBlocks;
  if (headings !== undefined) blog.headings = Array.isArray(headings) ? headings : [];
  if (excerpt !== undefined) blog.excerpt = excerpt;
  if (tags !== undefined) blog.tags = Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim()).filter(Boolean);
  if (category !== undefined) blog.category = category;
  if (coverImage !== undefined) blog.coverImage = coverImage;
  if (series !== undefined) blog.series = series || null;
  if (seriesOrder !== undefined) blog.seriesOrder = seriesOrder;
  if (status && status !== blog.status) {
    blog.status = status;
    if (status === 'published' && !blog.publishedAt) blog.publishedAt = new Date();
  }

  await blog.save();
  res.json({ blog });

  const justPublished = !wasPublished && blog.status === 'published';
  if (justPublished) {
    notifySubscribersOfNewPost(blog);
  }
};

// DELETE /api/blogs/:id  -- admin only
const deleteBlog = async (req, res) => {
  const blog = await Blog.findByIdAndDelete(req.params.id);
  if (!blog) return res.status(404).json({ message: 'Post not found.' });
  await Comment.deleteMany({ blog: blog._id });
  res.json({ message: 'Post deleted.' });
};

module.exports = {
  getBlogs,
  getBlogBySlug,
  toggleLike,
  addComment,
  getTagsAndCategories,
  uploadImage,
  getAllBlogsAdmin,
  getBlogByIdAdmin,
  createBlog,
  updateBlog,
  deleteBlog,
};
