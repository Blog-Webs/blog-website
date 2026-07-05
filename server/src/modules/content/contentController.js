const { Subject, Chapter, Progress } = require('../../models');
const cache = require('../../utils/cache');

const SUBJECTS_TTL = 5 * 60 * 1000;  // 5 min
const SUBJECT_TTL  = 5 * 60 * 1000;

// GET /api/content/subjects
const getSubjects = async (req, res) => {
  const cacheKey = 'subjects:all';
  const cached = await cache.get(cacheKey);
  if (cached) return res.json(cached);

  const subjects = await Subject.find().sort({ order: 1 }).lean();
  const payload = { subjects };
  await cache.set(cacheKey, payload, SUBJECTS_TTL);
  res.json(payload);
};

// GET /api/content/subjects/:slug
const getSubjectBySlug = async (req, res) => {
  const cacheKey = `subject:${req.params.slug}`;
  let payload = await cache.get(cacheKey);

  if (!payload) {
    const subject = await Subject.findOne({ slug: req.params.slug }).lean();
    if (!subject) return res.status(404).json({ message: 'Subject not found.' });

    const chapters = await Chapter.find({ subject: subject._id })
      .select('-content -codeSnippets -contentBlocks')
      .sort({ chapterNumber: 1 })
      .lean();

    payload = { subject, chapters };
    await cache.set(cacheKey, payload, SUBJECT_TTL);
  }

  const { subject, chapters } = payload;

  let studiedChapterIds = new Set();
  if (req.user) {
    const progress = await Progress.find({
      user: req.user._id,
      chapter: { $in: chapters.map((c) => c._id) },
    }).select('chapter');
    studiedChapterIds = new Set(progress.map((p) => p.chapter.toString()));
  }

  const chaptersWithStatus = chapters.map((c) => ({
    ...c,
    studied: studiedChapterIds.has(c._id.toString()),
  }));

  res.json({ subject, chapters: chaptersWithStatus });
};

// GET /api/content/subjects/:subjectId/chapters (for Admin usage mainly)
const getChaptersForSubject = async (req, res) => {
  const cacheKey = `subject:${req.params.subjectId}:chapters`;
  let payload = await cache.get(cacheKey);

  if (!payload) {
    const subject = await Subject.findById(req.params.subjectId).lean();
    if (!subject) return res.status(404).json({ message: 'Subject not found.' });

    const chapters = await Chapter.find({ subject: subject._id })
      .select('-content -codeSnippets -contentBlocks')
      .sort({ chapterNumber: 1 })
      .lean();
      
    payload = { subject, chapters };
    await cache.set(cacheKey, payload, SUBJECT_TTL);
  }

  const { subject, chapters } = payload;

  let studiedChapterIds = new Set();
  if (req.user) {
    const progress = await Progress.find({
      user: req.user._id,
      chapter: { $in: chapters.map((c) => c._id) },
    }).select('chapter');
    studiedChapterIds = new Set(progress.map((p) => p.chapter.toString()));
  }

  const chaptersWithStatus = chapters.map((c) => ({
    ...c,
    studied: studiedChapterIds.has(c._id.toString()),
  }));

  res.json({ subject, chapters: chaptersWithStatus });
};

// GET /api/content/chapters/:chapterId
const getChapterContent = async (req, res) => {
  const cacheKey = `chapter:${req.params.chapterId}`;
  let chapter = await cache.get(cacheKey);

  if (!chapter) {
    chapter = await Chapter.findById(req.params.chapterId).populate({
      path: 'subject',
      select: 'name slug color',
    }).lean();
    if (!chapter) return res.status(404).json({ message: 'Chapter not found.' });
    await cache.set(cacheKey, chapter, SUBJECT_TTL);
  }

  if (!chapter.isFreePreview && !req.user) {
    return res.status(401).json({
      message: 'Sign in with Google to keep reading this chapter.',
      locked: true,
      preview: chapter.content.slice(0, 280) + '…',
      chapter: {
        _id: chapter._id,
        title: chapter.title,
        chapterNumber: chapter.chapterNumber,
        estimatedMinutes: chapter.estimatedMinutes,
      },
    });
  }

  let studied = false;
  if (req.user) {
    const progress = await Progress.findOne({ user: req.user._id, chapter: chapter._id });
    studied = !!progress;
  }

  res.json({ chapter, studied, locked: false });
};

module.exports = {
  getSubjects,
  getSubjectBySlug,
  getChaptersForSubject,
  getChapterContent,
};
