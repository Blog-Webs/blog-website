const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/blogController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const cache = require('../middleware/cacheMiddleware');

// --- Specific/static paths FIRST, before the /:slug catch-all ---
router.get('/meta/tags-categories', cache('blogs:tags', 600), getTagsAndCategories);
router.get('/admin/all', requireAuth, requireAdmin, getAllBlogsAdmin);
router.get('/admin/:id', requireAuth, requireAdmin, getBlogByIdAdmin);
router.post('/upload-image', requireAuth, requireAdmin, upload.single('image'), uploadImage);

// --- Admin write operations (operate on :id, not :slug, so no ordering conflict) ---
router.post('/', requireAuth, requireAdmin, createBlog);
router.patch('/:id', requireAuth, requireAdmin, updateBlog);
router.delete('/:id', requireAuth, requireAdmin, deleteBlog);

// --- Public reads + interactions (operate on :slug) ---
router.get('/', cache('blogs', 300), getBlogs);
router.get('/:slug', cache('blog', 300), getBlogBySlug);
router.post('/:slug/like', requireAuth, toggleLike);
router.post('/:slug/comments', requireAuth, addComment);

module.exports = router;
