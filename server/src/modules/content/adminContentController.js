const slugify = require('slugify');
const { Subject, Chapter, Progress, Bookmark, IconOption } = require('../../models');
const cache = require('../../utils/cache');
const UserNotification = require('../admin/UserNotification');

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


const autoExtractHeadings = (content) => {
  if (!content) return [];
  const headings = [];
  const lines = content.split('\n');
  for (const line of lines) {
    const match = line.match(/^(#{1,4})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const title = match[2].trim().replace(/[*_~`]/g, '');
      const id = slugify(title, { lower: true, strict: true });
      headings.push({ id, text: title, title, level });
    }
  }
  return headings;
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
  const parsedHeadings = (Array.isArray(headings) && headings.length > 0)
    ? headings
    : autoExtractHeadings(content);

  const chapter = await Chapter.create({
    subject, chapterNumber, title, slug, content,
    contentBlocks: contentBlocks || null,
    headings: parsedHeadings,
    codeSnippets, isFreePreview, estimatedMinutes, order, externalLinks,
  });
  
  await cache.del(`subject:${subject}:chapters`); // Updates chapter count
  
  // Find subject name to make the notification content descriptive
  const subjectDoc = await Subject.findById(subject);
  const subjectName = subjectDoc ? subjectDoc.name : 'Subjects';
  
  await UserNotification.create({
    type: 'CONTENT_PUBLISHED',
    title: `New Chapter added to ${subjectName}`,
    message: `New Chapter added to ${subjectName}: '${chapter.title}'`,
    link: `/learn`
  }).catch(err => console.error('Failed to create user notification:', err));
  
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
  if (content !== undefined) {
    chapter.content = content;
    chapter.headings = (Array.isArray(headings) && headings.length > 0)
      ? headings
      : autoExtractHeadings(content);
  } else if (headings !== undefined) {
    chapter.headings = Array.isArray(headings) ? headings : [];
  }

  if (contentBlocks !== undefined) chapter.contentBlocks = contentBlocks;
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

// ---------- AI Content Generator & Auto-Formatter ----------
const generateAIContent = async (req, res) => {
  const { prompt, topicTitle, subjectName } = req.body;
  if (!prompt && !topicTitle) {
    return res.status(400).json({ message: 'Prompt or topic title is required.' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY || process.env.GOOGLE_API_KEY;
  const topic = topicTitle || prompt;

  if (apiKey) {
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const systemPrompt = `You are an expert technical content writer and software engineering educator for HttpTechNex.
Generate a structured, in-depth, beautifully formatted educational chapter in Markdown format about: "${topic}" in subject: "${subjectName || 'Computer Science'}".

Format Requirements:
1. Include a single main H2 heading for each section (e.g. ## Introduction, ## Core Mechanics, ## Code Example, ## Key Takeaways).
2. Use H3 headings (e.g. ### Subtopic) for sub-sections.
3. Wrap code snippets in triple backtick fences specifying the exact language (e.g. \`\`\`java, \`\`\`js, \`\`\`sql).
4. Use clear paragraphs, bold key terms, and bullet points.
5. Provide realistic, runnable code examples with comments.

Do NOT include an H1 heading (the chapter title will be set separately). Start directly with an introduction paragraph or H2 heading.`;

      const result = await model.generateContent(systemPrompt);
      const text = result.response.text();
      const headings = autoExtractHeadings(text);

      return res.json({ content: text, headings, estimatedMinutes: Math.max(5, Math.round(text.split(/\s+/).length / 200)) });
    } catch (err) {
      console.warn('Gemini API call failed, falling back to rule-based AI generator:', err.message);
    }
  }

  const generatedText = `## Overview & Core Concepts

${topic} is an essential foundation in modern software development. Understanding its underlying mechanics allows engineers to write performant, scalable, and maintainable applications.

### Key Objectives
- Master the fundamental syntax and architectural principles of **${topic}**.
- Learn best practices, error handling, and performance optimization techniques.
- Apply practical, production-ready code patterns.

## Deep Dive & Architectural Mechanics

When building enterprise systems, **${topic}** provides the structural framework necessary for decoupling components and managing runtime state cleanly.

### Core Execution Flow
1. **Initialization**: Setting up runtime configurations and dependencies.
2. **Execution**: Processing state transformations and operational pipelines.
3. **Resource Cleanup**: Ensuring memory and connection handles are cleanly disposed of.

\`\`\`java
// Practical Code Implementation for ${topic}
public class DemoService {
    public static void main(String[] args) {
        System.out.println("Executing demonstration for: ${topic}");
    }
}
\`\`\`

## Key Takeaways
- Always enforce clean separation of concerns.
- Monitor memory footprint and asymptotic execution complexity.
- Test edge cases thoroughly before deploying to production.`;

  const headings = autoExtractHeadings(generatedText);
  res.json({ content: generatedText, headings, estimatedMinutes: 10 });
};

const formatAIContent = async (req, res) => {
  const { rawText } = req.body;
  if (!rawText) return res.status(400).json({ message: 'rawText is required.' });

  let lines = rawText.split(/\r?\n/);
  let formattedLines = [];
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) {
      formattedLines.push('');
      continue;
    }

    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      formattedLines.push(line);
      continue;
    }

    if (inCodeBlock) {
      formattedLines.push(lines[i]);
      continue;
    }

    if (line.match(/^#+\s+/)) {
      formattedLines.push(line);
    } else if (line.match(/^[A-Z0-9\s:,-]{3,50}:$/) || line.match(/^(Overview|Introduction|Core Concepts|Key Features|Implementation|Conclusion|Summary|Syntax|Example|Prerequisites|Architecture)$/i)) {
      const headingText = line.replace(/:$/, '').trim();
      formattedLines.push(`\n## ${headingText}\n`);
    } else if (line.match(/^[A-Z0-9\s:,-]{3,40}$/) && i < lines.length - 1 && lines[i+1].trim() === '') {
      formattedLines.push(`\n### ${line}\n`);
    } else {
      formattedLines.push(line);
    }
  }

  const formatted = formattedLines.join('\n').replace(/\n{3,}/g, '\n\n');
  const headings = autoExtractHeadings(formatted);
  res.json({ content: formatted, headings });
};

module.exports = {
  createSubject, updateSubject, deleteSubject,
  createChapter, updateChapter, deleteChapter,
  getIconOptions, createIconOption, updateIconOption, deleteIconOption,
  generateAIContent, formatAIContent,
};
