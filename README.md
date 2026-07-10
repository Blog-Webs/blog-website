# HttpTechNex 🚀

A full-stack MERN learning platform for **DSA**, **Java & Advanced Java**, and **Aptitude** — built around chapter-by-chapter progress tracking, a Medium-style blog, Google-only authentication, and a hidden admin portal.

HttpTechNex combines the capabilities of a modern tech blog, a structured learning management system (LMS), and a personal productivity suite (StudentOS with an AI assistant) into a single unified platform.

***

## Table of contents

1. [What's inside](#whats-inside)
2. [Technology stack](#technology-stack)
3. [Architecture overview](#architecture-overview)
4. [Prerequisites](#prerequisites)
5. [Step 1 — Clone & install](#step-1--clone--install)
6. [Step 2 — Set up MongoDB](#step-2--set-up-mongodb)
7. [Step 3 — Set up Google OAuth (Sign in with Google)](#step-3--set-up-google-oauth-sign-in-with-google)
8. [Step 4 — Set up Cloudinary (image uploads)](#step-4--set-up-cloudinary-image-uploads)
9. [Step 5 — Set up SMTP (newsletter emails)](#step-5--set-up-smtp-newsletter-emails)
10. [Step 6 — Configure environment variables](#step-6--configure-environment-variables)
11. [Step 7 — Seed the database](#step-7--seed-the-database)
12. [Step 7.5 — Migrate content to the rich-text editor](#step-75--migrate-content-to-the-rich-text-editor-run-once)
13. [Step 8 — Run the project](#step-8--run-the-project)
14. [Becoming the Admin](#becoming-the-admin)
15. [Project structure](#project-structure)
16. [API reference (quick overview)](#api-reference-quick-overview)
17. [Performance & caching](#performance--caching)
18. [Recent feature additions](#recent-feature-additions)
19. [Upgrading StudentOS AI to a real RAG agent](#upgrading-studentos-ai-to-a-real-rag-agent)
20. [Deployment notes](#deployment-notes)
21. [Troubleshooting](#troubleshooting)

***

## What's inside

- **No visible admin login.** The only sign-in method on the public site is **Sign in with Google**. Some content (the first chapter of every track) is readable by anyone; everything past that requires a Google session.
- **DSA / Java & Advanced Java / Aptitude** learning tracks, each structured as: `Subject → Topic → Track ("Deep Analysis" / "Data Research") → Chapter 1, 2, 3…` with a left sidebar (tracks), a middle pane (chapter list + studied checkboxes), and a right reading pane.
- **Per-chapter progress tracking** — a checkbox per chapter, persisted per user.
- **Bookmarks** for both chapters and blog posts, with a dropdown in the header.
- **Blog & Newsletter**, Medium-style: cover image upload, title/subtitle/body, tags, categories, drafts vs published, likes, comments, a rich-text toolbar (bold, italic, headings, links, quotes, dividers, code blocks, inline images), a "what's covered" outline rail, and "up next" recommendations. Only the Admin can write posts.
- **Newsletter email notifications** — every active subscriber gets emailed automatically the moment the Admin publishes a new post (via any SMTP provider — see Step 5).
- **Site-wide search** on the homepage across blog posts, topics, and chapters, with results grouped and deep-linked straight to the right page.
- **Help / Contact widget** on the homepage — Bug report, Support, and Review forms, viewable by the Admin in a dedicated Contact Inbox.
- **Dark / light theme toggle**, persisted locally and synced to the user's account.
- **Live user counter** via Socket.io, shown in the header and on the admin dashboard.
- **A personal to-do list** (plus a Notes tab) for logged-in users.
- **Expandable content tree** — the Admin isn't limited to the seeded DSA / Java / Aptitude subjects; new subjects (e.g. "System Design"), topics, and tracks can all be created directly from the admin portal, with the same rich-text + image-upload chapter editor used in the blog.
- **Hidden Admin Portal** at `/admin-portal` — invisible in all navigation, gated **server-side** by a list of admin emails, and returns a generic 404 (not a 401/403) to anyone who isn't an admin, so the route's existence is never confirmed to outsiders.
- **StudentOS** — a personal productivity suite with calendar/email/drive integration and an AI assistant (see [Upgrading StudentOS AI](#upgrading-studentos-ai-to-a-real-rag-agent) for the roadmap toward a full RAG agent).

***

## Technology stack

**Frontend**
- React 18 (Vite bundler)
- React Router v6
- BlockNote (Notion-style rich-text editor for blogs and chapters)
- Lucide React (icons)
- Tailwind CSS v4 / CSS Modules for styling, glassmorphism, and animations

**Backend**
- Node.js & Express.js
- MongoDB & Mongoose
- Socket.io (live user counter)
- In-memory TTL cache, upgradeable to Redis (see [Performance & caching](#performance--caching))
- NodeMailer (SMTP email delivery)
- Cloudinary (image hosting/CDN)
- Google OAuth 2.0 (`google-auth-library`) for authentication
- `@google/generative-ai` (current StudentOS AI), with a roadmap to LangChain/LangGraph + a vector database

**DevOps**
- GitHub Actions (CI: dependency install, syntax checks, production build validation)
- Vercel (frontend hosting) / Render (backend hosting)

***

## Architecture overview

```
httptechnex/
├── server/      Express + MongoDB (Mongoose) + Socket.io API
└── client/      React (Vite) + Tailwind CSS v4 frontend
```

- **Auth model:** Google Identity Services on the frontend produces a Google ID token → sent to `/api/auth/google` → backend verifies it with `google-auth-library` → backend issues its **own** JWT in an `httpOnly` cookie. The frontend never sees or stores any token directly; all API calls are cookie-authenticated (`withCredentials: true`).
- **Admin gating:** a user is promoted to `role: 'admin'` automatically on login **only if** their email is in the server's `ADMIN_EMAILS` environment variable. The `/admin-portal` route checks this server-side on every request; an unauthenticated or non-admin request gets an indistinguishable `404`.
- **Real-time live users:** a raw `http.Server` (not just Express) is created in `server.js` so Socket.io can attach to it. Every connected browser tab counts as one "live user."

***

## Prerequisites

Install these before starting:

| Tool | Why | Check with |
| --- | --- | --- |
| [Node.js](https://nodejs.org/) v18+ | Runs both server and client | `node -v` |
| [npm](https://www.npmjs.com/) v9+ | Package manager (comes with Node) | `npm -v` |
| [MongoDB](https://www.mongodb.com/try/download/community) (local) **or** a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster | Database | — |
| A [Google account](https://accounts.google.com/) | To create OAuth credentials | — |
| A free [Cloudinary](https://cloudinary.com/users/register/free) account | To host blog images | — |
| Git | To clone/manage the repo | `git --version` |

***

## Step 1 — Clone & install

```bash
git clone https://github.com/Blog-Webs/blog-website.git
cd blog-website

cd server
npm install

cd ../client
npm install
```

***

## Step 2 — Set up MongoDB

You have two options. Pick one.

### Option A — Local MongoDB (simplest for development)

1. Install MongoDB Community Server for your OS: https://www.mongodb.com/try/download/community
2. Start it:
   - **macOS (Homebrew):** `brew services start mongodb-community`
   - **Linux:** `sudo systemctl start mongod`
   - **Windows:** MongoDB usually installs as a service and starts automatically; otherwise run `mongod` from the install directory.
3. Your connection string will be:

   ```
   mongodb://127.0.0.1:27017/httptechnex
   ```

### Option B — MongoDB Atlas (free cloud cluster, no local install)

1. Go to https://www.mongodb.com/cloud/atlas/register and create a free account.
2. Create a new **free shared cluster** (M0).
3. Under **Database Access**, create a database user with a username and password.
4. Under **Network Access**, click **Add IP Address** → **Allow access from anywhere** (`0.0.0.0/0`) for development (tighten this later for production).
5. Click **Connect** on your cluster → **Drivers** → copy the connection string. It looks like:

   ```
   mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority
   ```
6. Add the database name into the string, right after `.net/`:

   ```
   mongodb+srv://<username>:<password>@<cluster-url>/httptechnex?retryWrites=true&w=majority
   ```

You'll paste this into `server/.env` as `MONGO_URI` in Step 6.

***

## Step 3 — Set up Google OAuth (Sign in with Google)

This is the **only** login method on the site, so this step is required even for local development.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (top-left project dropdown → **New Project**) — name it anything, e.g. `HttpTechNex`.
3. In the search bar, go to **APIs & Services → OAuth consent screen**.
   - User type: **External**.
   - Fill in an app name, support email, and developer email.
   - Add your own Google account under **Test users** if the app is still in "Testing" mode (this lets you log in during development without publishing the app).
4. Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
   - Application type: **Web application**.
   - Name: `HttpTechNex Web`.
   - **Authorized JavaScript origins**, add both:

     ```
     http://localhost:5173
     http://localhost:5000
     ```
   - **Authorized redirect URIs**: not required for Google Identity Services' token-based sign-in flow used here, but you can add `http://localhost:5173` if Google's console requires at least one entry.
5. Click **Create**. Copy the **Client ID** (looks like `xxxxxxxxxx.apps.googleusercontent.com`). You do **not** need the client secret for this flow.

You'll use this same Client ID in **both** `server/.env` (`GOOGLE_CLIENT_ID`) and `client/.env` (`VITE_GOOGLE_CLIENT_ID`) in Step 6.

> When you deploy to a real domain later, come back to this screen and add your production URL to **Authorized JavaScript origins**.

***

## Step 4 — Set up Cloudinary (image uploads)

Used for blog cover images and any in-post images uploaded through the admin editor.

1. Sign up free at https://cloudinary.com/users/register/free
2. After signing in, your **Dashboard** page shows three values you need:
   - **Cloud name**
   - **API Key**
   - **API Secret** (click "reveal" to see it)
3. Copy all three into `server/.env` in Step 6.

***

## Step 5 — Set up SMTP (newsletter emails)

When the Admin publishes a new blog post, the backend emails everyone who subscribed via the footer newsletter form. This works with **any** SMTP provider — pick whichever is easiest for you.

### Option A — Gmail (simplest for testing)

1. Turn on 2-Step Verification on your Google account (required for App Passwords): https://myaccount.google.com/security
2. Create an **App Password**: https://myaccount.google.com/apppasswords → choose "Mail" → copy the 16-character password it generates.
3. Use these values:

   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_gmail_address@gmail.com
   SMTP_PASS=<the 16-character App Password, NOT your normal Gmail password>
   ```

### Option B — Any other SMTP provider

Works the same way with SendGrid, Mailtrap (great for testing without sending real emails), Outlook/Microsoft 365, Amazon SES, your own mail server, etc. — just use the host/port/username/password that provider gives you.

> **This step is optional.** If you skip it (leave the SMTP fields blank or as placeholders), the rest of the site works completely normally — the backend simply logs a warning and skips sending the email instead of crashing. The newsletter subscription form itself still works and still stores subscribers either way.

***

## Step 6 — Configure environment variables

### Server (`server/.env`)

```bash
cd server
cp .env.example .env
```

Open `server/.env` and fill in:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

MONGO_URI=<your connection string from Step 2>

JWT_SECRET=<any long random string — e.g. run: openssl rand -hex 32>
JWT_EXPIRES_IN=7d
COOKIE_NAME=httptechnex_token

GOOGLE_CLIENT_ID=<your Client ID from Step 3>

ADMIN_EMAILS=<your own gmail address, comma-separated if more than one>

CLOUDINARY_CLOUD_NAME=<from Step 4>
CLOUDINARY_API_KEY=<from Step 4>
CLOUDINARY_API_SECRET=<from Step 4>

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300

SMTP_HOST=<from Step 5>
SMTP_PORT=587
SMTP_USER=<from Step 5>
SMTP_PASS=<from Step 5>
SMTP_FROM=HttpTechNex <no-reply@httptechnex.com>

# Optional — see "Upgrading StudentOS AI"
GEMINI_API_KEY=<from Google AI Studio, for the StudentOS AI assistant>
```

> **`ADMIN_EMAILS` is the entire admin system.** Whatever Google account email(s) you list here will automatically become an Admin the next time they sign in through the normal Google sign-in button — there is no separate admin signup form.

### Client (`client/.env`)

```bash
cd ../client
cp .env.example .env
```

Open `client/.env` and fill in:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=<the exact same Client ID as the server>
```

***

## Step 7 — Seed the database

This populates MongoDB with the full DSA, Java & Advanced Java, and Aptitude content trees (subjects → topics → tracks → chapters).

```bash
cd server
npm run seed
```

You should see console output like:

```
Seeding HttpTechNex content...

  Subject: DSA
    Topic: Arrays
      Track: Deep Analysis
        2 chapters
      ...
```

> **Run the seed script again any time** — it's idempotent (uses `findOneAndUpdate` with `upsert: true`), so re-running it won't create duplicates.

> **Note:** the sample blog post seed step will be skipped the first time, with a message saying no admin user exists yet. That's expected — see [Becoming the Admin](#becoming-the-admin) below, then re-run `npm run seed` if you want the sample post.

***

## Step 7.5 — Migrate content to the rich-text editor (run once)

The site's editor was upgraded from plain Markdown to a block-based rich-text editor (BlockNote). Content created by `npm run seed` — and anything written before this upgrade — is stored as plain Markdown text, not the new block format, until you run a one-time migration.

1. Sign in as Admin (see [Becoming the Admin](#becoming-the-admin) below).
2. Go to **Admin Portal → Migration tool** (a small link near the bottom of the admin sidebar).
3. Click **Scan for content to migrate**, then **Run migration now**.
4. Watch the log — it tells you exactly what succeeded, what failed, and which items had no headings.

This is safe to run more than once: anything already migrated is automatically skipped, so re-running just catches anything new.

> **Known limitation:** the seeded DSA / Java / Aptitude chapters were written as plain narrative paragraphs, not Markdown with `#`-style headings. After migration, they'll display and read correctly, but their **"On this page" outline rail will be empty**, since there's nothing in the original text marked as a heading. The migration tool's log will call this out explicitly for every affected item. If you want the outline to populate for a given chapter, open it in the Content Tree editor and add a few heading blocks using the editor's own heading button — new content written directly in the rich-text editor doesn't have this limitation, since headings are added as you write.

***

## Step 8 — Run the project

Open **two terminals**.

**Terminal 1 — backend:**

```bash
cd server
npm run dev
```

You should see:

```
[MongoDB] Connected: ...
[Server] HttpTechNex API running on http://localhost:5000
```

**Terminal 2 — frontend:**

```bash
cd client
npm run dev
```

Open the URL it prints (usually **http://localhost:5173**).

***

## Becoming the Admin

1. Make sure your Google account's email is listed in `ADMIN_EMAILS` in `server/.env` (Step 6).
2. On the live site, click **Sign in with Google** in the header like any normal user and log in.
3. That's it — your account is automatically promoted to `admin` on that login (the backend checks `ADMIN_EMAILS` every time anyone signs in).
4. Click your profile photo in the top-right → **Admin Dashboard**, or go directly to:

   ```
   http://localhost:5173/admin-portal
   ```
5. From the Admin Portal you can:
   - Write, edit, publish, and delete blog posts, with a rich-text toolbar (bold, italic, headings, links, quotes, dividers, code blocks) and cover/inline image upload
   - Create entirely new subjects (e.g. "System Design"), topics, and tracks — not just the seeded DSA / Java / Aptitude — and add chapters to any of them using the same rich-text editor
   - View live stats (registered users, live users right now, post counts)
   - View the newsletter subscriber list
   - Read bug reports, support requests, and reviews submitted through the homepage Help widget

> If you ever remove an email from `ADMIN_EMAILS`, that user is automatically demoted back to a normal `user` role on their next login.

***

## Project structure

```
server/
├── src/
│   ├── config/         MongoDB & Cloudinary connection setup
│   ├── controllers/    Request handlers (one file per resource)
│   ├── middleware/     Auth (JWT + admin gate), file upload (multer)
│   ├── models/         Mongoose schemas (User, Subject, Topic, Track,
│   │                   Chapter, Progress, Bookmark, Blog, Comment,
│   │                   Newsletter, Todo, Contact)
│   ├── routes/         Express routers, mounted in app.js
│   ├── seed/
│   │   ├── content/    Real written DSA / Java / Aptitude chapter content
│   │   └── index.js    Seed script entry point (npm run seed)
│   ├── sockets/        Socket.io live-user-count handler
│   ├── utils/          jwt.js, mailer.js (SMTP via nodemailer), cache.js
│   ├── app.js          Express app: middleware + route mounting
│   └── server.js       HTTP server + Socket.io + DB bootstrap
└── .env.example

client/
├── src/
│   ├── api/            Axios wrappers, one file per resource
│   ├── components/
│   │   ├── layout/      Header, Footer, Layout, BookmarksDropdown
│   │   ├── learn/       TrackSidebar, ChapterList, ChapterReader
│   │   ├── blog/        BlogCard
│   │   ├── home/        SortVisualizer, SubjectCard, SearchBar, ContactModal
│   │   ├── admin/       AdminGuard, AdminLayout
│   │   └── ui/          GoogleSignInButton, MarkdownEditor
│   ├── context/         AuthContext, ThemeContext
│   ├── hooks/           useLiveUserCount (Socket.io)
│   ├── pages/           Home, SubjectPage, TopicPage, BlogList,
│   │                    BlogDetail, TodoPage, NotFound, admin/*
│   │                    (admin/* includes ContentTreeManager and
│   │                    ContactSubmissions)
│   ├── App.jsx          Route tree
│   ├── main.jsx         Providers + router bootstrap
│   └── index.css        Design tokens (dark/light theme), Tailwind import
└── .env.example
```

***

## API reference (quick overview)

All routes are prefixed with `/api`. Full request/response shapes are in the corresponding controller file.

| Resource | Routes | Notes |
| --- | --- | --- |
| Auth | `POST /auth/google`, `POST /auth/logout`, `GET /auth/me`, `PATCH /auth/theme` | Cookie-based session |
| Content | `GET /content/subjects`, `GET /content/subjects/:slug`, `GET /content/topics/:id/tracks`, `GET /content/tracks/:id/chapters`, `GET /content/chapters/:id` | Chapter content 401s with a preview if not logged in and not a free-preview chapter |
| Progress | `POST /progress/:chapterId`, `GET /progress/summary` | Requires login |
| Bookmarks | `GET /bookmarks`, `POST /bookmarks` | Requires login |
| To-Do | `GET/POST /todos`, `PATCH/DELETE /todos/:id` | Requires login |
| Blog (public) | `GET /blogs`, `GET /blogs/:slug`, `POST /blogs/:slug/like`, `POST /blogs/:slug/comments` | Like/comment require login |
| Blog (admin) | `POST /blogs`, `PATCH /blogs/:id`, `DELETE /blogs/:id`, `POST /blogs/upload-image`, `GET /blogs/admin/all` | Admin-only |
| Newsletter | `POST /newsletter/subscribe`, `POST /newsletter/unsubscribe` | Public. Subscribers are emailed on every new published post |
| Search | `GET /search?q=...` | Public. Searches blogs, topics, and chapters together |
| Contact | `POST /contact` (bug/support/review), `GET /contact/admin/all`, `PATCH /contact/admin/:id/read` | Submit is public; viewing is admin-only |
| Admin content tree | `/admin/content/subjects`, `/admin/content/topics`, `/admin/content/tracks`, `/admin/content/chapters` (POST/PATCH/DELETE) | Admin-only |
| Admin general | `GET /admin/stats`, `GET /admin/check` | Admin-only, **returns 404 (not 401/403) to non-admins** |

Socket.io event: the server emits `liveUserCount` (a number) to every connected client whenever someone connects or disconnects.

***

## Performance & caching

### How it works (current — in-memory TTL cache)

The server uses a lightweight **in-memory Map-based cache** (no external dependency) to avoid repeated database hits on the most expensive public reads:

| Endpoint | Cache key | TTL |
| --- | --- | --- |
| `GET /api/content/subjects` | `subjects:all` | 5 min |
| `GET /api/content/subjects/:slug` | `subject:<slug>` | 5 min |
| `GET /api/content/topics/:id/tracks` | `tracks:<topicId>` | 3 min |

User-specific reads (chapter content, progress, bookmarks) are **never cached** so every user always sees their own live data.

Cache source: `server/src/utils/cache.js`

### Upgrading to Redis (optional)

When you need horizontal scaling (multiple server instances), replace the in-memory cache with Redis:

1. **Install ioredis**:

   ```bash
   cd server
   npm install ioredis
   ```
2. **Update `server/.env`**:

   ```
   REDIS_URL=redis://localhost:6379
   # or for Redis Cloud / Upstash:
   REDIS_URL=rediss://:password@hostname:6380
   ```
3. **Replace `server/src/utils/cache.js`** with:

   ```js
   const Redis = require('ioredis');
   const client = new Redis(process.env.REDIS_URL);

   const get = async (key) => {
     const val = await client.get(key);
     return val ? JSON.parse(val) : null;
   };

   const set = async (key, value, ttlMs = 300000) => {
     await client.set(key, JSON.stringify(value), 'PX', ttlMs);
   };

   const del = async (keyOrPrefix) => {
     if (keyOrPrefix.endsWith('*')) {
       const keys = await client.keys(keyOrPrefix);
       if (keys.length) await client.del(...keys);
     } else {
       await client.del(keyOrPrefix);
     }
   };

   const flush = async () => client.flushdb();

   module.exports = { get, set, del, flush };
   ```
4. The rest of the codebase (`contentController.js`) **stays exactly the same** — the cache interface is identical.

> **Note**: With Redis, `get`/`set`/`del` become async. You'll need to add `await` in the controller. The current in-memory version is synchronous.

***

## Recent feature additions

| Feature | Description |
| --- | --- |
| Blog Series on Home | Series cards with water-droplet ripple animation |
| Sparkle hero title | Shimmer sweep + floating star particles on home `<h1>` |
| Workspace section on Home | Shows your latest todos & notes when logged in |
| Notes (new) | Full notes tab on `/todos` with title, subject, color |
| Reading layout | No header/footer on blog and topic reading pages |
| Circular progress ring | SVG reading progress ring on blog pages |
| Up Next on left | Blog sidebar reorganized: Up Next left, TOC right |
| Explore Further dropdown | Track sidebar is now a collapsible dropdown with chapter sub-list |
| Content tree breadcrumb | `Home > Subject > Topic > Track` clickable nav |
| No confirm dialogs | Delete is instant with 5-second undo toast |
| Focus mode editors | Fullscreen writing in blog & chapter admin editors |
| In-memory cache | Faster repeat loads for subjects, topics, tracks |
| Image glow effect | Ambient light behind all cover images |
| Fade-up animations | Section cards animate in on scroll |

Earlier platform-wide additions also include an **Event-Driven Architecture** (EventBus for background jobs like emails and logging instead of blocking API responses), **automated welcome emails** on first Google sign-in, a **real-time admin notification feed** for engagement events, **admin content moderation** (delete any comment/reply), a **glassmorphism UI overhaul**, and a **GitHub Actions CI pipeline** that validates dependency installs, syntax, and production builds on every PR/push to `master`.

***

## Upgrading StudentOS AI to a real RAG agent

The current StudentOS AI is a **basic prompt-based assistant**. It uses `@google/generative-ai` and injects only the 5 most recent emails, events, and file _names_ into the prompt. It **cannot** read the actual content of your files, so queries like "Find DBMS notes" will fail.

To make the AI Assistant truly intelligent and capable of searching your actual course material, upgrade it to an **Agentic RAG (Retrieval-Augmented Generation)** architecture:

### 1. Vector database (Pinecone, ChromaDB, or MongoDB Atlas Vector Search)

Instead of just fetching file names from Google Drive, download the _content_ of the files, chunk the text, convert it into embeddings, and store them in a vector database.

- **Implementation:** When a user uploads a note or syncs a Drive file, run a background job to extract text, generate embeddings, and upsert them into your vector DB with metadata (like `userId` and `filename`).

### 2. LangChain (Node.js)

Replace the direct `@google/generative-ai` calls in `AiService.js` with **LangChain**, which provides built-in tools to manage memory (chat history), connect to your vector DB (retriever), and format prompts dynamically.

- **Implementation:** `npm install langchain @langchain/google-genai`. Create a conversational retrieval chain that takes the user's question, searches the vector DB for the most relevant chunks of their notes, and passes those chunks to the LLM to generate a contextual answer.

### 3. LangGraph (for agentic workflows)

To handle complex queries like _"What's due tomorrow and do I have notes for it?"_, the AI needs to make decisions. LangGraph lets you create a state machine (workflow) for the AI, with different "nodes" (tools):

- `CalendarTool` — calls Google Calendar API
- `DriveTool` — performs semantic search on the vector DB
- `GmailTool` — fetches emails

The LLM acts as the "router": when the user asks a question, LangGraph asks the LLM which tool to use. The LLM might decide to use the `CalendarTool` to find out what's due, then route to the `DriveTool` to fetch notes for that specific assignment.

### Quick fix (to get the current basic AI working immediately)

If your AI is currently returning errors or saying it's unavailable, it's usually because the Gemini API key hasn't been added to your backend hosting (Render):

1. Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Go to your Render Dashboard → Environment Variables.
3. Add `GEMINI_API_KEY` and paste your key.
4. Restart your Render server.

***

## Deployment notes

- **The Socket.io live-user-count feature requires a long-running Node process** with a real, persistent HTTP server. It will **not** work on a stateless serverless platform (e.g. Vercel serverless functions, AWS Lambda) without extra work (a separate WebSocket-capable service). Good options: **Render**, **Railway**, a VM, or a Node-friendly host with WebSocket support.
- Frontend can be deployed anywhere static (Vercel, Netlify, Cloudflare Pages) — just point `VITE_API_URL` and `VITE_SOCKET_URL` at your deployed backend's URL.
- In production, set `NODE_ENV=production` on the server — this makes the session cookie `secure` and `sameSite=none`, which is required for cross-domain cookies (frontend and backend on different domains) to work over HTTPS.
- Remember to add your production domain to the Google Cloud Console's **Authorized JavaScript origins** (Step 3).
- Update `CLIENT_URL` in `server/.env` to your deployed frontend URL — it's used for CORS and Socket.io's allowed origin.
- CI runs via **GitHub Actions** on PRs and pushes to `master`, installing dependencies, running syntax checks, and validating a production Vite build before anything reaches Vercel/Render.

***

## Troubleshooting

**"Google sign-in failed" / button doesn't appear** → Double check `VITE_GOOGLE_CLIENT_ID` in `client/.env` matches `GOOGLE_CLIENT_ID` in `server/.env` exactly, and that `http://localhost:5173` is listed under Authorized JavaScript origins in Google Cloud Console.

**`/admin-portal` shows a 404 even though I'm signed in** → Confirm your exact Google account email is listed in `ADMIN_EMAILS` in `server/.env` (case doesn't matter, but check for typos), then sign out and sign back in so the role sync runs again.

**MongoDB connection errors on startup** → If using local MongoDB, confirm `mongod` is actually running (`mongosh` should connect). If using Atlas, confirm your IP is allow-listed under Network Access and your password in the connection string doesn't contain unencoded special characters (URL-encode `@`, `#`, etc.).

**Image upload fails in the blog editor** → Check all three `CLOUDINARY_*` values in `server/.env` are correct and that you copied the API secret (not just the key).

**Seed script says "no admin user found yet"** → This is expected before your first login. Sign in once via Google with an email listed in `ADMIN_EMAILS`, then re-run `npm run seed` if you want the sample blog post created too.

**Newsletter subscribers aren't receiving emails when I publish a post** → Check the server console for a `[Mailer]` warning — if `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS` aren't set, emails are skipped (not an error) so the rest of the app keeps working. If using Gmail, confirm you're using a 16-character **App Password**, not your normal account password — Gmail rejects normal passwords for SMTP. Also confirm the post actually transitioned from **draft to published** — editing an already-published post again does not re-trigger emails.

**StudentOS AI says it's unavailable / returns errors** → Add `GEMINI_API_KEY` to your backend's environment variables (see [Quick fix](#upgrading-studentos-ai-to-a-real-rag-agent)) and restart the server.


---
*Built by Tanish Dewase.*
