const slugify = require('slugify');
const { Subject, Chapter, Progress, Bookmark, IconOption } = require('../../models');
const cache = require('../../utils/cache');

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
  
  await cache.del('subjects:all');
  
  res.status(201).json({ subject });
};

const updateSubject = async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  if (!subject) return res.status(404).json({ message: 'Subject not found.' });

  const { name, description, icon, coverImage, color, order, hasRoadmap, hasCheatsheet } = req.body;

  let oldSlug = null;
  if (name && name !== subject.name) {
    oldSlug = subject.slug;
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

  await cache.del('subjects:all');
  await cache.del(`subject:${subject.slug}`);
  if (oldSlug && oldSlug !== subject.slug) {
    await cache.del(`subject:${oldSlug}`);
  }

  res.json({ subject });
};

const deleteSubject = async (req, res) => {
  const subject = await Subject.findByIdAndDelete(req.params.id);
  if (!subject) return res.status(404).json({ message: 'Subject not found.' });

  const chapterIds = (await Chapter.find({ subject: subject._id }).select('_id')).map((c) => c._id);
  await cleanupChapterReferences(chapterIds);
  await Chapter.deleteMany({ subject: subject._id });

  await cache.del('subjects:all');
  await cache.del(`subject:${subject.slug}`);

  res.json({ message: 'Subject and all related content deleted.' });
};


// ---------- Chapters ----------
const createChapter = async (req, res) => {
  const {
    subject, chapterNumber, title, content, contentBlocks, headings,
    codeSnippets, isFreePreview, estimatedMinutes, order, externalLinks,
  } = req.body;
  
  if (!subject || !chapterNumber || !title || !content) {
    return res.status(400).json({ message: 'subject, chapterNumber, title and content are required.' });
  }

  const slug = slugify(title, { lower: true, strict: true });
  const chapter = await Chapter.create({
    subject, chapterNumber, title, slug, content,
    contentBlocks: contentBlocks || null,
    headings: Array.isArray(headings) ? headings : [],
    codeSnippets, isFreePreview, estimatedMinutes, order, externalLinks,
  });
  
  await cache.del(`subject:${subject}:chapters`); // Updates chapter count
  
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
  await cache.del(`chapter:${chapter._id}`);
  await cache.del(`subject:${chapter.subject}:chapters`); // Updates chapter titles/order
  res.json({ chapter });
};

const deleteChapter = async (req, res) => {
  const chapter = await Chapter.findByIdAndDelete(req.params.id);
  if (!chapter) return res.status(404).json({ message: 'Chapter not found.' });

  await cleanupChapterReferences([chapter._id]);

  await cache.del(`chapter:${chapter._id}`);
  await cache.del(`subject:${chapter.subject}:chapters`);

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
  createChapter, updateChapter, deleteChapter,
  getIconOptions, createIconOption, updateIconOption, deleteIconOption,
};
