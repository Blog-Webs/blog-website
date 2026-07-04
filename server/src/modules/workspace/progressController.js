const { Progress, Chapter, Track, Topic } = require('../../models');

// POST /api/progress/:chapterId  -- toggle studied state
const toggleStudied = async (req, res) => {
  const { chapterId } = req.params;
  const chapter = await Chapter.findById(chapterId);
  if (!chapter) return res.status(404).json({ message: 'Chapter not found.' });

  const existing = await Progress.findOne({ user: req.user._id, chapter: chapterId });

  if (existing) {
    await existing.deleteOne();
    return res.json({ studied: false });
  }

  await Progress.create({ user: req.user._id, chapter: chapterId, studied: true });
  res.json({ studied: true });
};

// GET /api/progress/summary -- overall progress per subject for dashboard
const getProgressSummary = async (req, res) => {
  const progress = await Progress.find({ user: req.user._id }).populate({
    path: 'chapter',
    select: 'track',
    populate: { path: 'track', select: 'topic', populate: { path: 'topic', select: 'subject name' } },
  });

  const totalChapters = await Chapter.countDocuments();
  const studiedCount = progress.length;

  const bySubject = {};
  progress.forEach((p) => {
    const subjectId = p.chapter?.track?.topic?.subject?.toString();
    if (!subjectId) return;
    bySubject[subjectId] = (bySubject[subjectId] || 0) + 1;
  });

  res.json({
    totalChapters,
    studiedCount,
    percentComplete: totalChapters ? Math.round((studiedCount / totalChapters) * 100) : 0,
    bySubject,
  });
};

module.exports = { toggleStudied, getProgressSummary };
