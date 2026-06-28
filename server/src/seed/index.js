require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { mkSlug } = require('./helpers');
const { Subject, Topic, Track, Chapter, Blog, User } = require('../models');

const dsa = require('./content/dsa');
const java = require('./content/java');
const aptitude = require('./content/aptitude');

const SUBJECTS = [dsa, java, aptitude];

const seedSubjectTree = async (subjectData) => {
  const slug = mkSlug(subjectData.subject.name);

  const subject = await Subject.findOneAndUpdate(
    { slug },
    { ...subjectData.subject, slug },
    { upsert: true, new: true }
  );
  console.log(`  Subject: ${subject.name}`);

  for (const topicData of subjectData.topics) {
    const topicSlug = mkSlug(topicData.name);
    const topic = await Topic.findOneAndUpdate(
      { subject: subject._id, slug: topicSlug },
      {
        subject: subject._id,
        slug: topicSlug,
        name: topicData.name,
        description: topicData.description,
        order: topicData.order,
        difficulty: topicData.difficulty,
        estimatedMinutes: topicData.estimatedMinutes,
        hasVisualizer: topicData.hasVisualizer || false,
        visualizerType: topicData.visualizerType || 'none',
      },
      { upsert: true, new: true }
    );
    console.log(`    Topic: ${topic.name}`);

    for (let trackIdx = 0; trackIdx < topicData.tracks.length; trackIdx++) {
      const trackData = topicData.tracks[trackIdx];
      const trackSlug = mkSlug(trackData.name);
      const track = await Track.findOneAndUpdate(
        { topic: topic._id, slug: trackSlug },
        { topic: topic._id, slug: trackSlug, name: trackData.name, order: trackIdx },
        { upsert: true, new: true }
      );
      console.log(`      Track: ${track.name}`);

      for (let chapIdx = 0; chapIdx < trackData.chapters.length; chapIdx++) {
        const chapData = trackData.chapters[chapIdx];
        const chapterNumber = chapIdx + 1;
        const chapSlug = mkSlug(chapData.title);
        await Chapter.findOneAndUpdate(
          { track: track._id, chapterNumber },
          {
            track: track._id,
            chapterNumber,
            title: chapData.title,
            slug: chapSlug,
            content: chapData.content,
            codeSnippets: chapData.codeSnippets || [],
            isFreePreview: !!chapData.isFreePreview,
            estimatedMinutes: chapData.estimatedMinutes || 10,
            order: chapIdx,
            externalLinks: chapData.externalLinks || [],
          },
          { upsert: true, new: true }
        );
      }
      console.log(`        ${trackData.chapters.length} chapters`);
    }
  }
};

const seedSampleBlog = async () => {
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  let author = await User.findOne({ email: { $in: adminEmails } });

  if (!author) {
    console.log('  No admin user found yet (sign in with Google once first) — skipping sample blog seed.');
    return;
  }

  const existing = await Blog.findOne({ slug: 'why-most-dsa-prep-fails' });
  if (existing) {
    console.log('  Sample blog post already exists, skipping.');
    return;
  }

  await Blog.create({
    title: 'Why Most DSA Prep Fails (And What Actually Works)',
    subtitle: 'Grinding 300 LeetCode problems is not a strategy. Pattern recognition is.',
    slug: 'why-most-dsa-prep-fails',
    excerpt: 'Most candidates memorize solutions instead of recognizing the dozen or so patterns that cover 90% of interview questions. Here is how to fix that.',
    content: `## The grinding trap

Most people preparing for technical interviews fall into the same trap: they solve problem after problem, hoping volume alone will build intuition. It doesn't, not reliably. What actually transfers from one problem to a completely different one you've never seen is **pattern recognition** — noticing "oh, this is a sliding window problem" or "this is a two-pointer problem in disguise" within the first thirty seconds of reading it.

## The patterns that actually cover most interview questions

A surprisingly small set of patterns covers the large majority of array, string, and tree/graph problems asked in real interviews:

- Two pointers (sorted array problems, palindrome checks)
- Sliding window (substring/subarray problems with a size or sum constraint)
- Fast & slow pointers (cycle detection in linked lists)
- BFS/DFS traversal (tree and graph problems)
- Dynamic programming via recurrence relations (optimization problems with overlapping subproblems)
- Binary search on the answer (not just on a sorted array, but on a *range of possible answers*)

## How to actually practice

Instead of solving 300 random problems, solve 8-10 problems *per pattern*, deliberately, until you can identify that pattern instantly. Then move to mixed practice. This is exactly the structure behind the DSA tracks on this platform — each topic separates **Deep Analysis** (the underlying theory, so the pattern actually makes sense) from **Data Research** (where you go to drill the pattern against real problems).

## The metric that matters

Stop counting problems solved. Start counting patterns you can recognize cold, from a fresh problem statement, without having seen that exact problem before. That's the actual skill being tested in an interview — not whether you've memorized this specific problem's solution.`,
    tags: ['DSA', 'Interview Prep', 'Career'],
    category: 'DSA',
    author: author._id,
    status: 'published',
    publishedAt: new Date(),
    readTimeMinutes: 4,
  });
  console.log('  Sample blog post created.');
};

const run = async () => {
  await connectDB();
  console.log('Seeding HttpTechNex content...\n');

  for (const subjectData of SUBJECTS) {
    await seedSubjectTree(subjectData);
  }

  console.log('\nSeeding sample blog post...');
  await seedSampleBlog();

  console.log('\nDone. Disconnecting.');
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('[Seed Error]', err);
  process.exit(1);
});
