const { Subject, Topic, Track, Chapter, Progress } = require('../../models');
const cache = require('../../utils/cache');

const SUBJECTS_TTL = 5 * 60 * 1000;  // 5 min
const SUBJECT_TTL  = 5 * 60 * 1000;
const TRACK_TTL    = 3 * 60 * 1000;

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
  const cached = await cache.get(cacheKey);
  if (cached) return res.json(cached);

  const subject = await Subject.findOne({ slug: req.params.slug }).lean();
  if (!subject) return res.status(404).json({ message: 'Subject not found.' });

  const topics = await Topic.find({ subject: subject._id }).sort({ order: 1 }).lean();
  const payload = { subject, topics };
  await cache.set(cacheKey, payload, SUBJECT_TTL);
  res.json(payload);
};

// GET /api/content/topics/:topicId/tracks
const getTracksForTopic = async (req, res) => {
  const cacheKey = `tracks:${req.params.topicId}`;
  const cached = await cache.get(cacheKey);
  if (cached) return res.json(cached);

  const topic = await Topic.findById(req.params.topicId).populate('subject', 'name slug color').lean();
  if (!topic) return res.status(404).json({ message: 'Topic not found.' });

  const tracks = await Track.find({ topic: topic._id }).sort({ order: 1 }).lean();

  // Attach chapter count per track for the left sidebar UI
  const tracksWithCounts = await Promise.all(
    tracks.map(async (track) => {
      const chapterCount = await Chapter.countDocuments({ track: track._id });
      return { ...track, chapterCount };
    })
  );

  const payload = { topic, tracks: tracksWithCounts };
  await cache.set(cacheKey, payload, TRACK_TTL);
  res.json(payload);
};

// GET /api/content/tracks/:trackId/chapters
// Returns chapter list (titles only, not full content) + studied status if logged in
const getChaptersForTrack = async (req, res) => {
  const cacheKey = `track:${req.params.trackId}:chapters`;
  let payload = await cache.get(cacheKey);

  if (!payload) {
    const track = await Track.findById(req.params.trackId).populate({
      path: 'topic',
      select: 'name slug subject',
      populate: { path: 'subject', select: 'name slug color' },
    }).lean();
    if (!track) return res.status(404).json({ message: 'Track not found.' });

    const chapters = await Chapter.find({ track: track._id })
      .select('-content -codeSnippets -contentBlocks')
      .sort({ chapterNumber: 1 })
      .lean();
      
    payload = { track, chapters };
    await cache.set(cacheKey, payload, TRACK_TTL);
  }

  const { track, chapters } = payload;

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

  res.json({ track, chapters: chaptersWithStatus });
};

// GET /api/content/chapters/:chapterId
// Core gating logic: free preview chapters are open to everyone.
// Everything else requires a logged-in user.
const getChapterContent = async (req, res) => {
  const cacheKey = `chapter:${req.params.chapterId}`;
  let chapter = await cache.get(cacheKey);

  if (!chapter) {
    chapter = await Chapter.findById(req.params.chapterId).populate({
      path: 'track',
      select: 'name slug topic',
      populate: {
        path: 'topic',
        select: 'name slug subject',
        populate: { path: 'subject', select: 'name slug color' },
      },
    }).lean();
    if (!chapter) return res.status(404).json({ message: 'Chapter not found.' });
    await cache.set(cacheKey, chapter, TRACK_TTL);
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
  getTracksForTopic,
  getChaptersForTrack,
  getChapterContent,
};
