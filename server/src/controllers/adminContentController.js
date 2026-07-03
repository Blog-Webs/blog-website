const slugify = require('slugify');
const { Subject, Topic, Track, Chapter, Progress, Bookmark, IconOption } = require('../models');

// Deletes Progress and Bookmark rows that reference any of the given
// chapter ids, so removing content upstream never leaves dangling
// references to chapters that no longer exist.
const cleanupChapterReferences = async (chapterIds) => {
  if (chapterIds.length === 0) return;
  await Promise.all([
    Progress.deleteMany({ chapter: { $in: chapterIds } }),
    Bookmark.deleteMany({ chapter: { $in: chapterIds } }),
  ]);
};

// ---------- Subjects ----------
const createSubject = async (req, res) => {
  const { name, description, icon, coverImage, color, order, hasRoadmap, hasCheatsheet } = req.body;
  if (!name) return res.status(400).json({ message: 'Name is required.' });

  const slug = slugify(name, { lower: true, strict: true });
  const subject = await Subject.create({ name, slug, description, icon, coverImage, color, order, hasRoadmap, hasCheatsheet });
  res.status(201).json({ subject });
};

const updateSubject = async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  if (!subject) return res.status(404).json({ message: 'Subject not found.' });

  const { name, description, icon, coverImage, color, order, hasRoadmap, hasCheatsheet } = req.body;

  if (name && name !== subject.name) {
    subject.name = name;
    let slug = slugify(name, { lower: true, strict: true });
    const existingCount = await Subject.countDocuments({ slug: new RegExp(`^${slug}`), _id: { $ne: subject._id } });
    subject.slug = existingCount > 0 ? `${slug}-${existingCount + 1}` : slug;
  }
  if (description !== undefined) subject.description = description;
  if (icon !== undefined) subject.icon = icon;
  if (coverImage !== undefined) subject.coverImage = coverImage;
  if (color !== undefined) subject.color = color;
  if (order !== undefined) subject.order = order;
  if (hasRoadmap !== undefined) subject.hasRoadmap = hasRoadmap;
  if (hasCheatsheet !== undefined) subject.hasCheatsheet = hasCheatsheet;

  await subject.save();
  res.json({ subject });
};

const deleteSubject = async (req, res) => {
  const subject = await Subject.findByIdAndDelete(req.params.id);
  if (!subject) return res.status(404).json({ message: 'Subject not found.' });

  const topicIds = (await Topic.find({ subject: subject._id }).select('_id')).map((t) => t._id);
  const trackIds = (await Track.find({ topic: { $in: topicIds } }).select('_id')).map((t) => t._id);
  const chapterIds = (await Chapter.find({ track: { $in: trackIds } }).select('_id')).map((c) => c._id);

  await cleanupChapterReferences(chapterIds);
  await Chapter.deleteMany({ track: { $in: trackIds } });
  await Track.deleteMany({ topic: { $in: topicIds } });
  await Topic.deleteMany({ subject: subject._id });

  res.json({ message: 'Subject and all of its topics, tracks, and chapters were deleted.' });
};

// ---------- Topics ----------
const createTopic = async (req, res) => {
  const { subject, name, description, order, difficulty, estimatedMinutes, hasVisualizer, visualizerType } = req.body;
  if (!subject || !name) return res.status(400).json({ message: 'subject and name are required.' });

  const slug = slugify(name, { lower: true, strict: true });
  const topic = await Topic.create({
    subject, name, slug, description, order, difficulty, estimatedMinutes, hasVisualizer, visualizerType,
  });
  res.status(201).json({ topic });
};

const updateTopic = async (req, res) => {
  const topic = await Topic.findById(req.params.id);
  if (!topic) return res.status(404).json({ message: 'Topic not found.' });

  const { name, description, order, difficulty, estimatedMinutes, hasVisualizer, visualizerType } = req.body;

  if (name && name !== topic.name) {
    topic.name = name;
    let slug = slugify(name, { lower: true, strict: true });
    const existingCount = await Topic.countDocuments({
      subject: topic.subject, slug: new RegExp(`^${slug}`), _id: { $ne: topic._id },
    });
    topic.slug = existingCount > 0 ? `${slug}-${existingCount + 1}` : slug;
  }
  if (description !== undefined) topic.description = description;
  if (order !== undefined) topic.order = order;
  if (difficulty !== undefined) topic.difficulty = difficulty;
  if (estimatedMinutes !== undefined) topic.estimatedMinutes = estimatedMinutes;
  if (hasVisualizer !== undefined) topic.hasVisualizer = hasVisualizer;
  if (visualizerType !== undefined) topic.visualizerType = visualizerType;

  await topic.save();
  res.json({ topic });
};

const deleteTopic = async (req, res) => {
  const topic = await Topic.findByIdAndDelete(req.params.id);
  if (!topic) return res.status(404).json({ message: 'Topic not found.' });

  const trackIds = (await Track.find({ topic: topic._id }).select('_id')).map((t) => t._id);
  const chapterIds = (await Chapter.find({ track: { $in: trackIds } }).select('_id')).map((c) => c._id);

  await cleanupChapterReferences(chapterIds);
  await Chapter.deleteMany({ track: { $in: trackIds } });
  await Track.deleteMany({ topic: topic._id });

  res.json({ message: 'Topic and all of its tracks and chapters were deleted.' });
};

// ---------- Tracks ----------
const createTrack = async (req, res) => {
  const { topic, name, order, icon } = req.body;
  if (!topic || !name) return res.status(400).json({ message: 'topic and name are required.' });

  const slug = slugify(name, { lower: true, strict: true });
  const track = await Track.create({ topic, name, slug, order, icon });
  res.status(201).json({ track });
};

const updateTrack = async (req, res) => {
  const track = await Track.findById(req.params.id);
  if (!track) return res.status(404).json({ message: 'Track not found.' });

  const { name, order, icon } = req.body;

  if (name && name !== track.name) {
    track.name = name;
    let slug = slugify(name, { lower: true, strict: true });
    const existingCount = await Track.countDocuments({
      topic: track.topic, slug: new RegExp(`^${slug}`), _id: { $ne: track._id },
    });
    track.slug = existingCount > 0 ? `${slug}-${existingCount + 1}` : slug;
  }
  if (order !== undefined) track.order = order;
  if (icon !== undefined) track.icon = icon;

  await track.save();
  res.json({ track });
};

const deleteTrack = async (req, res) => {
  const track = await Track.findByIdAndDelete(req.params.id);
  if (!track) return res.status(404).json({ message: 'Track not found.' });

  const chapterIds = (await Chapter.find({ track: track._id }).select('_id')).map((c) => c._id);
  await cleanupChapterReferences(chapterIds);
  await Chapter.deleteMany({ track: track._id });

  res.json({ message: 'Track and all of its chapters were deleted.' });
};

// ---------- Chapters ----------
const createChapter = async (req, res) => {
  const {
    track, chapterNumber, title, content, contentBlocks, headings,
    codeSnippets, isFreePreview, estimatedMinutes, order, externalLinks,
  } = req.body;
  if (!track || !chapterNumber || !title || !content) {
    return res.status(400).json({ message: 'track, chapterNumber, title and content are required.' });
  }

  const slug = slugify(title, { lower: true, strict: true });
  const chapter = await Chapter.create({
    track, chapterNumber, title, slug, content,
    contentBlocks: contentBlocks || null,
    headings: Array.isArray(headings) ? headings : [],
    codeSnippets, isFreePreview, estimatedMinutes, order, externalLinks,
  });
  res.status(201).json({ chapter });
};

const updateChapter = async (req, res) => {
  const chapter = await Chapter.findById(req.params.id);
  if (!chapter) return res.status(404).json({ message: 'Chapter not found.' });

  const {
    title, content, contentBlocks, headings, codeSnippets,
    isFreePreview, estimatedMinutes, order, externalLinks, chapterNumber,
  } = req.body;

  if (title && title !== chapter.title) {
    chapter.title = title;
    chapter.slug = slugify(title, { lower: true, strict: true });
  }
  if (content !== undefined) chapter.content = content;
  if (contentBlocks !== undefined) chapter.contentBlocks = contentBlocks;
  if (headings !== undefined) chapter.headings = Array.isArray(headings) ? headings : [];
  if (codeSnippets !== undefined) chapter.codeSnippets = codeSnippets;
  if (isFreePreview !== undefined) chapter.isFreePreview = isFreePreview;
  if (estimatedMinutes !== undefined) chapter.estimatedMinutes = estimatedMinutes;
  if (order !== undefined) chapter.order = order;
  if (externalLinks !== undefined) chapter.externalLinks = externalLinks;
  if (chapterNumber !== undefined) chapter.chapterNumber = chapterNumber;

  await chapter.save();
  res.json({ chapter });
};

const deleteChapter = async (req, res) => {
  const chapter = await Chapter.findByIdAndDelete(req.params.id);
  if (!chapter) return res.status(404).json({ message: 'Chapter not found.' });

  await cleanupChapterReferences([chapter._id]);

  res.json({ message: 'Chapter deleted.' });
};
// ---------- Icon Options ----------
const getIconOptions = async (req, res) => {
  const icons = await IconOption.find().sort({ label: 1 });
  res.json({ icons });
};

const createIconOption = async (req, res) => {
  const { label, iconUrl } = req.body;
  if (!label || !iconUrl) return res.status(400).json({ message: 'Label and icon URL are required.' });

  const icon = await IconOption.create({ label, iconUrl });
  res.status(201).json({ icon });
};

const updateIconOption = async (req, res) => {
  const icon = await IconOption.findById(req.params.id);
  if (!icon) return res.status(404).json({ message: 'Icon option not found.' });

  const { label, iconUrl } = req.body;
  if (label !== undefined) icon.label = label;
  if (iconUrl !== undefined) icon.iconUrl = iconUrl;

  await icon.save();
  res.json({ icon });
};

const deleteIconOption = async (req, res) => {
  const icon = await IconOption.findByIdAndDelete(req.params.id);
  if (!icon) return res.status(404).json({ message: 'Icon option not found.' });
  res.json({ message: 'Icon option deleted.' });
};

module.exports = {
  createSubject, updateSubject, deleteSubject,
  createTopic, updateTopic, deleteTopic,
  createTrack, updateTrack, deleteTrack,
  createChapter, updateChapter, deleteChapter,
  getIconOptions, createIconOption, updateIconOption, deleteIconOption,
};
