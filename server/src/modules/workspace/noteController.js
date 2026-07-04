const { Note } = require('../../models');

// GET /api/notes
const getNotes = async (req, res) => {
  const notes = await Note.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ notes });
};

// POST /api/notes  Body: { title, content, subject?, color? }
const createNote = async (req, res) => {
  const { title, content, subject, color } = req.body;
  if (!title?.trim() || !content?.trim()) {
    return res.status(400).json({ message: 'Title and content are required.' });
  }
  const note = await Note.create({
    user: req.user._id,
    title: title.trim(),
    content: content.trim(),
    subject: subject?.trim() || '',
    color: color || '#5EEAD4',
  });
  res.status(201).json({ note });
};

// PATCH /api/notes/:id  Body: { title?, content?, subject?, color? }
const updateNote = async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
  if (!note) return res.status(404).json({ message: 'Note not found.' });

  const { title, content, subject, color } = req.body;
  if (title !== undefined) note.title = title.trim();
  if (content !== undefined) note.content = content.trim();
  if (subject !== undefined) note.subject = subject.trim();
  if (color !== undefined) note.color = color;

  await note.save();
  res.json({ note });
};

// DELETE /api/notes/:id
const deleteNote = async (req, res) => {
  const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!note) return res.status(404).json({ message: 'Note not found.' });
  res.json({ message: 'Note deleted.' });
};

// GET /api/notes/article/:articleId
const getArticleNote = async (req, res) => {
  const note = await Note.findOne({ user: req.user._id, articleId: req.params.articleId });
  res.json({ note });
};

// PUT /api/notes/article/:articleId
const upsertArticleNote = async (req, res) => {
  const { content } = req.body;
  if (!content && content !== '') return res.status(400).json({ message: 'Content is required.' });

  const note = await Note.findOneAndUpdate(
    { user: req.user._id, articleId: req.params.articleId },
    { content: content.trim(), title: 'Article Note' },
    { new: true, upsert: true }
  );
  res.json({ note });
};

module.exports = { getNotes, createNote, updateNote, deleteNote, getArticleNote, upsertArticleNote };
