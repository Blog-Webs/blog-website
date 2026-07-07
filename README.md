# HttpTechNex 🚀

**HttpTechNex** is a comprehensive, modern developer ecosystem designed to combine learning, productivity, and community engagement into a single unified platform. 

It seamlessly merges the capabilities of a modern tech blog, an interactive community forum, a structured learning management system (LMS), and a personal productivity suite (StudentOS).

---

## 🏗️ System Architecture

HttpTechNex is built using a highly decoupled client-server model, utilizing a **React Single Page Application (SPA)** on the frontend and an **Event-Driven Node.js/Express API** on the backend.

### Frontend Architecture (React + Vite)
The frontend breaks away from traditional file-type organization (grouping all pages together) and instead uses a **Domain-Driven Modular Structure**. 
* **Modules:** The app is split into isolated domains: `core`, `auth`, `admin`, `blog`, `forum`, `learn`, and `StudentOS`.
* **State Management:** Uses React Context (`AuthContext`, `ThemeContext`, `StudentOSContext`) for global state, minimizing prop-drilling.
* **API Layer:** A dedicated Axios client handles all HTTP requests, keeping UI components completely isolated from network logic.

### Backend Architecture (Node.js + Event-Driven Design)
The backend utilizes an **MVC (Model-View-Controller)** pattern enhanced by a powerful **Event-Driven Architecture (EDA)**.
* **The EventBus:** Instead of performing slow, synchronous tasks (like sending emails or writing logs) during API requests, controllers immediately emit events (e.g., `UserRegistered`, `ActionOccurred`) to an internal EventBus and return a fast response to the user. Background listeners catch these events and process the heavy lifting asynchronously.
* **Database & Cache:** Uses **MongoDB** for primary data persistence and **Redis** for high-speed caching of frequently accessed routes (like blog lists and metadata).

---

## 🛠️ Technology Stack

**Frontend:**
* **React 18** (UI Library)
* **Vite** (Next-generation bundler for lightning-fast builds)
* **React Router v6** (Client-side routing)
* **BlockNote** (Notion-style rich text editor for blogs)
* **Lucide React** (Premium, lightweight SVG icons)
* **CSS Modules / Vanilla CSS** (For high-performance glassmorphism and custom animations)

**Backend:**
* **Node.js & Express.js** (API Framework)
* **MongoDB & Mongoose** (NoSQL Database & ODM)
* **Redis** (In-memory caching for performance)
* **NodeMailer** (SMTP Email delivery)
* **Cloudinary** (CDN for image hosting and optimization)
* **Google OAuth 2.0** (Authentication)

**DevOps & CI/CD:**
* **GitHub Actions** (Continuous Integration for syntax checking and build validation)
* **Vercel** (Frontend Hosting)
* **Render** (Backend Hosting)

---

## ✨ Core Features & Recent Additions

We have heavily invested in expanding the platform's capabilities to make it a state-of-the-art ecosystem. Here is a breakdown of the newest features and *why* they were built:

### 1. Event-Driven Architecture (EDA)
* **What it is:** A central `EventBus` that handles background tasks.
* **Why we built it:** Previously, if a user signed up, they had to wait for the backend to connect to the SMTP server and send an email before the API would respond. By introducing EDA, the API responds in milliseconds, and the email is sent silently in the background. It allows the platform to scale massively without UI blocking.

### 2. Automated Welcome Emails
* **What it is:** When a new user logs in via Google OAuth for the first time, they automatically receive a beautifully formatted welcome email outlining the platform's features.
* **Why we built it:** To improve user retention and onboarding. It immediately guides new developers toward the Forum, Blogs, and StudentOS.

### 3. Real-Time Admin Notification System
* **What it is:** A dedicated notification feed built into the Admin Dashboard (`AdminDashboard.jsx`). It tracks user engagement globally.
* **Why we built it:** Admins need to know when the community is active. By listening to `ActionOccurred` events, the system automatically logs whenever a user likes a blog, likes a comment, or replies to a forum topic, giving admins a bird's-eye view of platform engagement.

### 4. Admin Content Moderation (CRUD)
* **What it is:** Authorized Admins now have the ability to delete any user comment on a Tech Blog, or any reply within the Community Forum. 
* **Why we built it:** Essential for community safety. If a user posts spam or inappropriate content, admins can instantly purge it from the UI.

### 5. Premium UI/UX Overhaul
* **What it is:** Implementation of glassmorphism (frosted glass effects), fluid micro-animations, curated dark-mode color palettes, and responsive layouts across the Forum and Blog modules.
* **Why we built it:** Modern developers expect a premium aesthetic. A beautiful, dynamic interface significantly increases user trust, time-on-site, and overall engagement.

### 6. Automated CI/CD Pipeline
* **What it is:** A GitHub Actions workflow (`ci.yml`) that automatically triggers on Pull Requests and pushes to the `master` branch.
* **Why we built it:** To act as a "Gatekeeper". It automatically installs dependencies, runs syntax checks across the backend, and executes a production build of the Vite frontend. This guarantees that broken code is never accidentally merged and deployed to production (Vercel/Render).

---

## 🚀 Getting Started Locally

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/Blog-Webs/blog-website.git
   cd blog-website
   \`\`\`

2. **Setup Backend**
   \`\`\`bash
   cd server
   npm install
   # Create a .env file with your MongoDB, Redis, and Cloudinary credentials
   npm run dev
   \`\`\`

3. **Setup Frontend**
   \`\`\`bash
   cd ../client
   npm install
   npm run dev
   \`\`\`

---
*Built by Tanish Dewase.*
