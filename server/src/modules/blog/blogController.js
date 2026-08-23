const slugify = require('slugify');
const { Blog, Comment, Newsletter } = require('../../models');
const UserNotification = require('../admin/UserNotification');
const cloudinary = require('../../config/cloudinary');
const cache = require('../../utils/cache');
const { sendBulkMail } = require('../../utils/mailer');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Emails every active subscriber and registered user that a new post is live. Fire-and-forget
// from the caller's perspective — failures are logged, never thrown.
const notifySubscribersOfNewPost = async (blog) => {
  try {
    const newsletterSubs = await Newsletter.find({ isActive: true }).select('email').lean();
    const users = await User.find({}).select('email').lean();

    const recipientSet = new Set([
      ...(newsletterSubs || []).map((s) => s.email?.toLowerCase()),
      ...(users || []).map((u) => u.email?.toLowerCase()),
    ]);

    const recipientEmails = Array.from(recipientSet).filter(
      (email) => email && /^\S+@\S+\.\S+$/.test(email)
    );

    if (recipientEmails.length === 0) {
      console.log('[notifySubscribersOfNewPost] No active subscribers found to notify.');
      return { sentCount: 0, failedCount: 0 };
    }

    console.log(`[notifySubscribersOfNewPost] Dispatching notification for "${blog.title}" to ${recipientEmails.length} recipient(s)...`);

    const postUrl = `${CLIENT_URL}/blog/${blog.slug}`;
    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #0E1015; padding: 36px; border-radius: 16px; border: 1px solid rgba(67, 117, 255, 0.3); color: #E2E8F0;">
        <div style="margin-bottom: 24px;">
          <span style="background: rgba(67, 117, 255, 0.15); color: #4375FF; border: 1px solid rgba(67, 117, 255, 0.3); font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 4px 10px; border-radius: 50px;">
            New Blog Publication
          </span>
        </div>
        <h1 style="margin: 0 0 12px; color: #FFFFFF; font-size: 22px; line-height: 1.3;">${blog.title}</h1>
        ${blog.subtitle ? `<p style="color: #8B949E; font-size: 14px; margin-bottom: 18px; line-height: 1.5;">${blog.subtitle}</p>` : ''}
        <p style="color: #C9D1D9; font-size: 14px; line-height: 1.6; margin-bottom: 28px;">${blog.excerpt || ''}</p>
        <a href="${postUrl}" style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #4375FF, #3460E0); color: #FFFFFF; border-radius: 12px; text-decoration: none; font-size: 14px; font-weight: 600;">
          Read Article on HttpTechNex &rarr;
        </a>
        <p style="color: #484F58; font-size: 12px; margin-top: 36px; border-top: 1px solid #1C202B; padding-top: 20px; text-align: center;">
          Sent to HttpTechNex Community &middot; <a href="${CLIENT_URL}" style="color: #4375FF; text-decoration: none;">httptechnex.online</a>
        </p>
      </div>
    `;

    const result = await sendBulkMail({
      recipients: recipientEmails,
      subject: `New post: ${blog.title}`,
      html,
      text: `${blog.title}\n\n${blog.excerpt || ''}\n\nRead it here: ${postUrl}`,
    });

    console.log(`[notifySubscribersOfNewPost] Email dispatch complete. Sent: ${result.sentCount}, Failed: ${result.failedCount}`);
    return result;
  } catch (err) {
    console.error('[notifySubscribersOfNewPost] Error sending emails:', err.message);
    return { error: err.message };
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
    
    // Emit event for Admin Notifications
    const eventBus = require('../../events/EventBus');
    eventBus.emit('ActionOccurred', {
      type: 'BLOG_LIKE',
      message: `${req.user.name} liked the blog post: ${blog.title}`,
      metadata: { userId: req.user._id, blogId: blog._id, blogSlug: blog.slug }
    });
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

  // Emit event for Admin Notifications
  const eventBus = require('../../events/EventBus');
  eventBus.emit('ActionOccurred', {
    type: 'COMMENT_ADDED',
    message: `${req.user.name} commented on the blog post: ${blog.title}`,
    metadata: { userId: req.user._id, blogId: blog._id, blogSlug: blog.slug, commentId: comment._id }
  });

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
    UserNotification.create({
      type: 'BLOG_PUBLISHED',
      title: 'Admin published a new blog',
      message: `Admin published a new blog: '${blog.title}'`,
      link: `/blog/${blog.slug}`
    }).catch(err => console.error('Failed to create user notification:', err));
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

  if (blog.status === 'published') {
    notifySubscribersOfNewPost(blog);
    UserNotification.create({
      type: 'BLOG_PUBLISHED',
      title: 'Admin published a new blog',
      message: `Admin published a new blog: '${blog.title}'`,
      link: `/blog/${blog.slug}`
    }).catch(err => console.error('Failed to create user notification:', err));
  }
};

// DELETE /api/blogs/:id  -- admin only
const deleteBlog = async (req, res) => {
  const blog = await Blog.findByIdAndDelete(req.params.id);
  if (!blog) return res.status(404).json({ message: 'Post not found.' });
  await Comment.deleteMany({ blog: blog._id });
  res.json({ message: 'Post deleted.' });
};

// DELETE /api/blogs/comments/:commentId
const deleteComment = async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) return res.status(404).json({ message: 'Comment not found' });
  
  // Must be admin or author
  if (req.user.role !== 'admin' && req.user._id.toString() !== comment.user.toString()) {
    return res.status(403).json({ message: 'Not authorized to delete this comment' });
  }

  // Find blog so we can clear its cache
  const blogId = comment.blog;
  await Comment.findByIdAndDelete(req.params.commentId);
  
  // Also delete child comments
  await Comment.deleteMany({ parentComment: req.params.commentId });
  
  const blog = await Blog.findById(blogId);
  if (blog) {
    await cache.del(`blog:${blog.slug}`);
  }

  res.json({ message: 'Comment deleted successfully' });
};

// POST /api/blogs/admin/:id/notify  -- admin only, manually trigger email notification for a blog post
const triggerNotification = async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.status(404).json({ message: 'Post not found.' });

  const result = await notifySubscribersOfNewPost(blog);
  res.json({ message: 'Email notifications triggered successfully!', result });
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
  deleteComment,
  triggerNotification,
};
