const express = require('express');
const router = express.Router();
const { getNotes, createNote, updateNote, deleteNote, getArticleNote, upsertArticleNote } = require('./noteController');
const { requireAuth } = require('../../middleware/auth');

router.use(requireAuth);
router.get('/', getNotes);
router.post('/', createNote);
router.get('/article/:articleId', getArticleNote);
router.put('/article/:articleId', upsertArticleNote);
router.patch('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;
