/**
 * Blog Seed Script — HttpTechNex
 *
 * Creates 4 sample published blog posts tied to the admin user.
 * Run once from the server/ directory:
 *
 *   node scripts/seedBlogs.js
 *
 * It will skip posts that already exist (by slug) so it's safe to re-run.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌  MONGO_URI not set. Check server/.env');
  process.exit(1);
}

// ── Inline models (avoid loading the full app) ────────────────────────────────
const userSchema = new mongoose.Schema({ name: String, email: String, googleId: String, role: String });
const User = mongoose.models.User || mongoose.model('User', userSchema);

const blogSchema = new mongoose.Schema({
  title: String, subtitle: String, slug: String, content: String,
  contentBlocks: mongoose.Schema.Types.Mixed,
  excerpt: String, tags: [String], category: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'published' },
  publishedAt: Date, readTimeMinutes: Number, views: Number,
  coverImage: String,
}, { timestamps: true });
const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);

// ── Sample posts ──────────────────────────────────────────────────────────────
const POSTS = [
  {
    title: 'Getting Started with MERN Stack Development',
    subtitle: 'Build full-stack web apps with MongoDB, Express, React, and Node.js',
    slug: 'getting-started-with-mern-stack',
    excerpt: 'A practical guide to building production-ready applications with the MERN stack — from project setup to deployment on Render and Vercel.',
    category: 'Web Development',
    tags: ['MERN', 'React', 'Node.js', 'MongoDB'],
    readTimeMinutes: 8,
    coverImage: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=800&auto=format&fit=crop',
    content: `# Getting Started with MERN Stack Development

The MERN stack (MongoDB, Express.js, React, Node.js) is one of the most popular choices for building modern web applications.

## Why MERN?

- **MongoDB** — Flexible NoSQL database with a JSON-like document model
- **Express.js** — Minimal, fast Node.js web framework
- **React** — Component-based UI library by Meta
- **Node.js** — JavaScript runtime for the server

## Project Structure

\`\`\`
project/
├── client/          # React (Vite)
│   ├── src/
│   └── vite.config.js
└── server/          # Express
    ├── src/
    └── .env
\`\`\`

## Getting Started

\`\`\`bash
# Create the client
npm create vite@latest client -- --template react

# Set up the server
mkdir server && cd server
npm init -y
npm install express mongoose cors dotenv
\`\`\`

Deploy the frontend to **Vercel** and the backend to **Render** for a production-ready setup.`,
  },
  {
    title: 'Mastering Data Structures & Algorithms in JavaScript',
    subtitle: 'Everything you need to ace technical interviews and write efficient code',
    slug: 'dsa-javascript-guide',
    excerpt: 'From arrays and linked lists to dynamic programming — a comprehensive DSA guide with JavaScript examples and complexity analysis.',
    category: 'DSA',
    tags: ['DSA', 'JavaScript', 'Algorithms', 'Interviews'],
    readTimeMinutes: 12,
    coverImage: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop',
    content: `# Mastering DSA in JavaScript

Data structures and algorithms form the foundation of computer science and are essential for cracking technical interviews at top companies.

## Core Data Structures

### Arrays
The most fundamental structure — O(1) access, O(n) search.

\`\`\`js
const arr = [1, 2, 3, 4, 5];
// Two-pointer technique
let left = 0, right = arr.length - 1;
while (left < right) {
  // swap
  [arr[left], arr[right]] = [arr[right], arr[left]];
  left++; right--;
}
\`\`\`

### Hash Maps
O(1) average-case lookup — your best friend for most interview problems.

\`\`\`js
const freq = {};
for (const char of s) freq[char] = (freq[char] || 0) + 1;
\`\`\`

### Binary Search
O(log n) — apply whenever the input is sorted.

\`\`\`js
const binarySearch = (arr, target) => {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] === target) return mid;
    arr[mid] < target ? lo = mid + 1 : hi = mid - 1;
  }
  return -1;
};
\`\`\`

Practice daily on LeetCode, track your progress on httpTechNex!`,
  },
  {
    title: 'System Design Fundamentals: Building Scalable Applications',
    subtitle: 'Learn to architect systems that handle millions of users',
    slug: 'system-design-fundamentals',
    excerpt: 'Dive into load balancers, databases, caching, message queues, and CDNs — the building blocks of every large-scale system.',
    category: 'System Design',
    tags: ['System Design', 'Architecture', 'Scalability', 'Backend'],
    readTimeMinutes: 15,
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop',
    content: `# System Design Fundamentals

System design interviews test your ability to architect large-scale, distributed systems. Here are the key concepts you must know.

## Core Components

### Load Balancers
Distribute incoming traffic across multiple servers.
- **Round Robin** — each server gets equal requests
- **Least Connections** — route to server with fewest active connections

### Caching
Reduce database load by storing frequently accessed data in memory.

\`\`\`
Client → CDN (static assets)
       → Redis (hot data, sessions)
       → Database (cold data)
\`\`\`

### Database Scaling
- **Vertical** — add more RAM/CPU to one server (limited)
- **Horizontal** — add more servers, use sharding
- **Read Replicas** — route reads to replicas, writes to primary

### Message Queues
Decouple services and handle spikes gracefully (Kafka, RabbitMQ, Redis Pub/Sub).

## The CAP Theorem

A distributed system can only guarantee **2 of 3**:
- **Consistency** — every read gets the latest write
- **Availability** — every request gets a response
- **Partition Tolerance** — system works despite network splits

Most real systems choose **AP** or **CP** depending on requirements.`,
  },
  {
    title: 'AI Engineering: Integrating LLMs into Your Applications',
    subtitle: 'Build intelligent features using Google Gemini, LangChain, and vector databases',
    slug: 'ai-engineering-llm-integration',
    excerpt: 'A practical guide to adding AI capabilities to your Node.js and React applications — from simple chat to retrieval-augmented generation (RAG).',
    category: 'AI Engineering',
    tags: ['AI', 'LLM', 'Gemini', 'LangChain', 'RAG'],
    readTimeMinutes: 10,
    coverImage: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&auto=format&fit=crop',
    content: `# AI Engineering: Integrating LLMs into Your Apps

Large Language Models (LLMs) have transformed what's possible in software. Here's how to add them to your Node.js stack.

## Setting Up Google Gemini

\`\`\`bash
npm install @google/generative-ai
\`\`\`

\`\`\`js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const result = await model.generateContent('Explain async/await in JS');
console.log(result.response.text());
\`\`\`

## Retrieval-Augmented Generation (RAG)

RAG lets your LLM answer questions about YOUR data:

1. **Chunk** documents into small pieces
2. **Embed** each chunk into a vector (semantic fingerprint)
3. **Store** vectors in a vector DB (Pinecone, Chroma, pgvector)
4. On query: **embed** the question, **search** for similar chunks
5. **Inject** top chunks into the LLM prompt as context

\`\`\`
User question
     ↓
Embed question → Search vector DB
                        ↓
              Top 3 relevant chunks
                        ↓
              LLM prompt = chunks + question
                        ↓
              Grounded, accurate answer ✅
\`\`\`

httpTechNex's StudentOS AI uses this pattern to answer questions about your personal notes and Drive files.`,
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅  Connected to MongoDB');

    // Find the admin user to set as author
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('❌  No admin user found. Sign in with Google first to create your account, then run this script again.');
      process.exit(1);
    }
    console.log(`📝  Using admin: ${admin.name} (${admin.email})`);

    let created = 0, skipped = 0;
    for (const post of POSTS) {
      const exists = await Blog.findOne({ slug: post.slug });
      if (exists) {
        console.log(`⏭️   Skipped (already exists): "${post.title}"`);
        skipped++;
        continue;
      }
      await Blog.create({
        ...post,
        author: admin._id,
        status: 'published',
        publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // random date in last 7 days
        views: Math.floor(Math.random() * 800) + 50,
      });
      console.log(`✅  Created: "${post.title}"`);
      created++;
    }

    console.log(`\n🎉  Done — ${created} created, ${skipped} skipped.`);
    console.log('    Refresh your homepage to see the Latest Blogs section!');
  } catch (err) {
    console.error('❌  Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
