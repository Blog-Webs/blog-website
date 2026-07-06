import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, BookOpen, Star, Loader2 } from 'lucide-react';
import GlobalSearch from '../components/search/GlobalSearch';

const docsData = {
  'user-guide': {
    title: 'Welcome to HttpTechNex! 🚀',
    path: 'docs/user-guide',
    sidebarTitle: 'User Guide',
    sections: [
      { id: 'learn-platform', label: '📚 1. The Learn Platform' },
      { id: 'student-os', label: '🛠️ 2. StudentOS' },
      { id: 'community-forum', label: '💬 3. Community Forum' },
      { id: 'tech-blogs', label: '✍️ 4. Tech Blogs' },
      { id: 'personalization', label: '⚙️ 5. Personalization' }
    ],
    lastUpdated: 'Jan 18, 2025'
  },
  'learn-platform': {
    title: 'The Learn Platform',
    path: 'docs/learn-platform',
    sidebarTitle: 'Learn Platform',
    sections: [
      { id: 'subjects-topics', label: '1. Navigating Subjects' },
      { id: 'reading-chapters', label: '2. Interactive Chapters' },
      { id: 'progress-tracking', label: '3. Progress Tracking' },
      { id: 'inline-notes', label: '4. Inline Notes' }
    ],
    lastUpdated: 'Jan 18, 2025'
  },
  'student-os': {
    title: 'StudentOS Workspace',
    path: 'docs/student-os',
    sidebarTitle: 'StudentOS Workspace',
    sections: [
      { id: 'drive', label: '☁️ 1. Your Drive' },
      { id: 'task-manager', label: '📋 2. Task Manager' },
      { id: 'calendar', label: '📅 3. Calendar' },
      { id: 'focus-mode', label: '⏱️ 4. Focus Mode' }
    ],
    lastUpdated: 'Jan 18, 2025'
  },
  'community-forum': {
    title: 'The Community Forum',
    path: 'docs/community-forum',
    sidebarTitle: 'Community Forum',
    sections: [
      { id: 'asking-questions', label: '1. Asking Questions' },
      { id: 'rich-text-editor', label: '2. Rich Text Editor' },
      { id: 'upvotes-answers', label: '3. Upvotes & Answers' },
      { id: 'real-time-notifications', label: '4. Notifications' }
    ],
    lastUpdated: 'Jan 18, 2025'
  },
  'tech-blogs': {
    title: 'Tech Blogs',
    path: 'docs/tech-blogs',
    sidebarTitle: 'Tech Blogs',
    sections: [
      { id: 'reading-experience', label: '1. Reading Experience' },
      { id: 'bookmarking', label: '2. Bookmarking' },
      { id: 'engagement-discussions', label: '3. Engagement' }
    ],
    lastUpdated: 'Jan 18, 2025'
  },
  'personalization': {
    title: 'Personalization & Account',
    path: 'docs/personalization',
    sidebarTitle: 'Account & Customization',
    sections: [
      { id: 'google-login', label: '1. Google Login' },
      { id: 'welcome-dashboard', label: '2. Welcome Dashboard' },
      { id: 'dark-mode', label: '3. Dark Mode' },
      { id: 'newsletter', label: '4. Newsletter' }
    ],
    lastUpdated: 'Jan 18, 2025'
  }
};

const Home = () => {
  const [activeDocId, setActiveDocId] = useState('user-guide');

  const renderUserGuide = () => (
    <div className="text-gray-300 text-xs md:text-sm leading-relaxed space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white mb-3">Welcome to HttpTechNex! 🚀</h2>
        <p className="text-gray-405">
          HttpTechNex is your all-in-one developer ecosystem. Whether you are a student looking to organize your academic life, a developer seeking to learn new skills, or an enthusiast wanting to connect with a global tech community, HttpTechNex has the tools for you.
        </p>
        <p className="text-gray-405 mt-2">
          Here is a comprehensive guide to everything you can do on the platform!
        </p>
      </div>

      <hr className="border-gray-800 my-4" />

      <div id="learn-platform">
        <h3 className="text-base font-semibold text-white mb-2">📚 1. The Learn Platform</h3>
        <p className="text-gray-405 mb-2">
          The Learn Platform is designed to take you from beginner to expert in various programming languages and computer science concepts.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-405">
          <li><strong>Structured Subjects:</strong> Browse curated subjects like Web Development, Machine Learning, and Data Structures.</li>
          <li><strong>Interactive Chapters:</strong> Read through comprehensive chapters with rich text, code snippets, and embedded media.</li>
          <li><strong>Progress Tracking:</strong> Automatically track your reading progress and pick up exactly where you left off.</li>
          <li><strong>Inline Notes:</strong> Take personal, private notes directly inside any chapter so you never forget important concepts.</li>
        </ul>
      </div>

      <hr className="border-gray-800 my-4" />

      <div id="student-os">
        <h3 className="text-base font-semibold text-white mb-2">🛠️ 2. StudentOS (Your Personal Workspace)</h3>
        <p className="text-gray-405 mb-2">
          StudentOS is a powerful productivity suite built specifically for students and developers. It acts as your personal command center.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-405">
          <li><strong>Your Drive:</strong> A secure cloud storage system. Upload, organize, and preview your PDFs, images, and documents in one place.</li>
          <li><strong>Task Manager & Kanban Board:</strong> Keep track of your assignments and projects. Drag and drop tasks between "To Do", "In Progress", and "Completed".</li>
          <li><strong>Calendar:</strong> A built-in calendar to track your upcoming deadlines, classes, and exams.</li>
          <li><strong>Focus Mode:</strong> Eliminate distractions with our specialized focus timer, perfect for deep-work coding sessions.</li>
        </ul>
      </div>

      <hr className="border-gray-800 my-4" />

      <div id="community-forum">
        <h3 className="text-base font-semibold text-white mb-2">💬 3. The Community Forum</h3>
        <p className="text-gray-405 mb-2">
          Stuck on a bug? Want to share a cool project? The Community Forum is where our users collaborate.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-405">
          <li><strong>Ask Questions:</strong> Create topics in specific categories to get help from experts.</li>
          <li><strong>Rich Text Editor:</strong> Use our advanced editor to format your code blocks and upload screenshots of your errors.</li>
          <li><strong>Upvotes & Accepted Answers:</strong> Upvote helpful replies, and mark the best response as the "Accepted Answer" to help future users solve the same problem.</li>
          <li><strong>Real-time Notifications:</strong> See who liked your topics or replied to your questions.</li>
        </ul>
      </div>

      <hr className="border-gray-800 my-4" />

      <div id="tech-blogs">
        <h3 className="text-base font-semibold text-white mb-2">✍️ 4. Tech Blogs</h3>
        <p className="text-gray-405 mb-2">
          Stay up-to-date with the latest trends in the tech industry by reading articles written by our community experts.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-405">
          <li><strong>Curated Articles:</strong> Read high-quality posts on software engineering, AI, DevOps, and more.</li>
          <li><strong>Dynamic Reading Experience:</strong> Enjoy our carefully designed reading layout with a sticky Table of Contents and reading progress bar.</li>
          <li><strong>Engagement:</strong> Like articles, drop comments to start discussions, and reply directly to other users.</li>
          <li><strong>Bookmarks:</strong> See an article you want to read later? Simply click the Bookmark icon to save it to your personal reading list.</li>
        </ul>
      </div>

      <hr className="border-gray-800 my-4" />

      <div id="personalization">
        <h3 className="text-base font-semibold text-white mb-2">⚙️ 5. Personalization & Account</h3>
        <p className="text-gray-450 mb-2">
          Make HttpTechNex your own.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-405">
          <li><strong>Seamless Google Login:</strong> Create an account and log in instantly with your Google account. No passwords to remember.</li>
          <li><strong>Welcome Dashboard:</strong> When you log in, you'll see a personalized dashboard summarizing your saved articles, recent tasks, and forum activity.</li>
          <li><strong>Dark Mode:</strong> A beautiful, eye-friendly dark mode is fully supported across every page of the website.</li>
          <li><strong>Newsletter:</strong> Subscribe to our newsletter to receive the best blogs and platform updates directly to your inbox.</li>
        </ul>
      </div>

      <hr className="border-gray-800 my-4" />
      <p className="text-xs text-gray-500 italic">Ready to dive in? Head over to the homepage and start exploring!</p>
    </div>
  );

  const renderLearnPlatformDoc = () => (
    <div className="text-gray-300 text-xs md:text-sm leading-relaxed space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white mb-3">The Learn Platform</h2>
        <p className="text-gray-400">
          Welcome to <strong>The Learn Platform</strong>! This module is designed to act as your personal coding bootcamp and computer science university, taking you from a complete beginner to an advanced developer.
        </p>
        <p className="text-gray-400 mt-2">
          Whether you are mastering the fundamentals of Web Development, diving into Data Structures, or exploring Machine Learning, the Learn Platform provides a structured, interactive, and personalized educational experience.
        </p>
      </div>

      <hr className="border-gray-800 my-4" />

      <div id="subjects-topics">
        <h3 className="text-base font-semibold text-white mb-2">1. Navigating Subjects and Topics</h3>
        <p className="text-gray-400 mb-2">
          When you open the Learn Platform, you are greeted with a curated list of <strong>Subjects</strong> (e.g., <em>Frontend Web Development</em>, <em>Backend Architecture</em>, <em>Algorithms</em>).
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-405">
          <li><strong>Browse Subjects:</strong> Click on any Subject card to view its curriculum.</li>
          <li><strong>Select a Topic:</strong> Inside a Subject, you will find a breakdown of <strong>Topics</strong> (e.g., <em>React Fundamentals</em>, <em>State Management</em>). Think of Topics as specific courses or modules within a university degree.</li>
          <li><strong>Start Learning:</strong> Clicking on a Topic will take you to its dedicated reading page, where the content is broken down into easily digestible <strong>Chapters</strong>.</li>
        </ul>
      </div>

      <hr className="border-gray-800 my-4" />

      <div id="reading-chapters">
        <h3 className="text-base font-semibold text-white mb-2">2. Reading Interactive Chapters</h3>
        <p className="text-gray-400 mb-2">
          The core of the Learn Platform is the reading experience. We've designed it to be as immersive and distraction-free as possible.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-405">
          <li><strong>Rich Text & Code Snippets:</strong> Chapters are formatted with beautiful typography, syntax-highlighted code blocks, and embedded media to help you understand complex concepts visually.</li>
          <li><strong>Sticky Navigation:</strong> A Table of Contents on the right side of your screen allows you to jump between headings instantly.</li>
          <li><strong>Distraction-Free Mode:</strong> The clean, dark-mode optimized layout ensures your eyes don't get tired during long study sessions.</li>
        </ul>
      </div>

      <hr className="border-gray-800 my-4" />

      <div id="progress-tracking">
        <h3 className="text-base font-semibold text-white mb-2">3. Progress Tracking</h3>
        <p className="text-gray-400 mb-2">
          You never have to remember where you left off. The Learn Platform automatically tracks your progress as you read!
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-405">
          <li><strong>Reading Progress Bar:</strong> As you scroll through a chapter, a progress bar at the top of the screen visually indicates how far along you are.</li>
          <li><strong>Automatic Bookmarking:</strong> If you leave a chapter halfway through and return days later, the system remembers exactly which chapter you were on, allowing you to resume your learning journey instantly.</li>
          <li><strong>Completion Status:</strong> Topics you have finished will be marked as completed on your dashboard, giving you a sense of accomplishment.</li>
        </ul>
      </div>

      <hr className="border-gray-800 my-4" />

      <div id="inline-notes">
        <h3 className="text-base font-semibold text-white mb-2">4. Taking Inline Notes (Your Personal Notebook)</h3>
        <p className="text-gray-400 mb-2">
          One of the most powerful features of the Learn Platform is the <strong>Inline Notes</strong> system. You no longer need to switch between the platform and a separate note-taking app.
        </p>
        <ol className="list-decimal pl-5 space-y-1 text-gray-405">
          <li><strong>Open the Notes Panel:</strong> While reading any chapter, click the <strong>"Notes"</strong> toggle.</li>
          <li><strong>Jot down thoughts:</strong> Type your thoughts, paste code snippets, or write down questions you want to research later.</li>
          <li><strong>Private & Secure:</strong> These notes are 100% private. Only <em>you</em> can see them. They are tied directly to your account and the specific chapter you are reading.</li>
          <li><strong>Review Later:</strong> Whenever you revisit a chapter to revise for an interview or exam, your notes will be right there waiting for you!</li>
        </ol>
      </div>

      <hr className="border-gray-800 my-4" />
      <p className="text-xs text-gray-500 italic">The Learn Platform is constantly evolving. Happy learning!</p>
    </div>
  );

  const renderStudentOSDoc = () => (
    <div className="text-gray-300 text-xs md:text-sm leading-relaxed space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white mb-3">StudentOS (Your Personal Workspace)</h2>
        <p className="text-gray-400">
          Welcome to <strong>StudentOS</strong>, a powerful productivity suite built specifically for students and developers. We built this platform because we understand that learning and coding require intense focus and organization.
        </p>
        <p className="text-gray-400 mt-2">
          Rather than juggling five different applications to manage your life, StudentOS acts as your personal command center, seamlessly integrated into your developer profile.
        </p>
      </div>

      <hr className="border-gray-800 my-4" />

      <div id="drive">
        <h3 className="text-base font-semibold text-white mb-2">☁️ 1. Your Drive (Cloud Storage)</h3>
        <p className="text-gray-400 mb-2">
          Stop emailing files to yourself. StudentOS includes a secure, built-in cloud storage system accessible from anywhere.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-405">
          <li><strong>Upload & Organize:</strong> Easily drag and drop PDFs, images, and documents. Create folders to keep your academic or project files perfectly organized.</li>
          <li><strong>Instant Preview:</strong> Click on any document or image to preview it instantly in the browser without needing to download it first.</li>
          <li><strong>Seamless Integration:</strong> Because your Drive is connected to the HttpTechNex ecosystem, you can easily reference your uploaded assets when writing tech blogs or asking questions on the forum.</li>
        </ul>
      </div>

      <hr className="border-gray-800 my-4" />

      <div id="task-manager">
        <h3 className="text-base font-semibold text-white mb-2">📋 2. Task Manager (Kanban Board)</h3>
        <p className="text-gray-400 mb-2">
          Keep track of your assignments, coding projects, and daily chores using our visual task management system.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-405">
          <li><strong>The Kanban Board:</strong> Your tasks are organized into three columns: <strong>"To Do"</strong>, <strong>"In Progress"</strong>, and <strong>"Completed"</strong>.</li>
          <li><strong>Drag and Drop:</strong> As you work on an assignment, simply drag the card from "To Do" into "In Progress". It provides a satisfying visual representation of your workflow.</li>
          <li><strong>Detailed Task Cards:</strong> Click on any task to add descriptions, due dates, and priority levels to ensure nothing falls through the cracks.</li>
        </ul>
      </div>

      <hr className="border-gray-800 my-4" />

      <div id="calendar">
        <h3 className="text-base font-semibold text-white mb-2">📅 3. Calendar</h3>
        <p className="text-gray-400 mb-2">
          Never miss a deadline, exam, or hackathon again.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-405">
          <li><strong>Monthly & Weekly Views:</strong> Switch between a high-level monthly overview or a detailed weekly schedule.</li>
          <li><strong>Event Creation:</strong> Click on any day to create an event. You can color-code events to organize your visual layout.</li>
          <li><strong>Integration:</strong> Your Calendar lives right next to your Task Manager, ensuring your schedule and your workload are always aligned.</li>
        </ul>
      </div>

      <hr className="border-gray-800 my-4" />

      <div id="focus-mode">
        <h3 className="text-base font-semibold text-white mb-2">⏱️ 4. Focus Mode (Pomodoro Timer)</h3>
        <p className="text-gray-400 mb-2">
          Distractions are the enemy of deep work. Focus Mode is designed to help you lock in and write code (or study) without interruptions.
        </p>
        <ol className="list-decimal pl-5 space-y-1 text-gray-405">
          <li><strong>Set your Timer:</strong> Choose your work interval (traditionally 25 minutes of deep work followed by a 5-minute break).</li>
          <li><strong>Eliminate Distractions:</strong> When you start the timer, StudentOS enters a distraction-free state.</li>
          <li><strong>Track Your Sessions:</strong> Use Focus Mode to build a habit of deep work. By timing your sessions, you can measure exactly how long it takes to complete specific coding tasks.</li>
        </ol>
      </div>

      <hr className="border-gray-800 my-4" />
      <p className="text-xs text-gray-500 italic">StudentOS is your private sanctuary on the platform. Enjoy your new command center!</p>
    </div>
  );

  const renderCommunityForumDoc = () => (
    <div className="text-gray-300 text-xs md:text-sm leading-relaxed space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white mb-3">The Community Forum</h2>
        <p className="text-gray-400">
          The <strong>Community Forum</strong> is the beating heart of HttpTechNex. It's a collaborative space where developers of all skill levels come together to share knowledge, debug code, and discuss the latest trends in technology.
        </p>
        <p className="text-gray-400 mt-2">
          Whether you are stuck on a frustrating bug, want to showcase a cool side project, or just want to chat about architecture, the Forum is where you belong.
        </p>
      </div>

      <hr className="border-gray-800 my-4" />

      <div id="asking-questions">
        <h3 className="text-base font-semibold text-white mb-2">🙋 1. Asking Questions (Creating Topics)</h3>
        <p className="text-gray-400 mb-2">
          When you hit a roadblock, the community is here to help.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-405">
          <li><strong>Categorize Your Topic:</strong> Before you post, you can select specific tags/categories (like <em>React</em>, <em>Backend</em>, or <em>DevOps</em>).</li>
          <li><strong>Be Descriptive:</strong> The best answers come from the most detailed questions. Use a clear title and provide the necessary context.</li>
          <li><strong>Share Projects:</strong> Feel free to start a topic just to show off a project you built or start a discussion.</li>
        </ul>
      </div>

      <hr className="border-gray-800 my-4" />

      <div id="rich-text-editor">
        <h3 className="text-base font-semibold text-white mb-2">📝 2. Advanced Rich Text Editor</h3>
        <p className="text-gray-400 mb-2">
          Developers communicate using code, so we built an editor that understands that.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-405">
          <li><strong>Code Blocks with Syntax Highlighting:</strong> Use our rich text editor to paste your code snippets beautifully.</li>
          <li><strong>Upload Media:</strong> Drag, drop, and embed screenshots of your terminal errors or UI bugs directly into your topic description.</li>
          <li><strong>Markdown Support:</strong> The editor supports standard formatting shortcuts, allowing you to quickly bold, italicize, or create lists.</li>
        </ul>
      </div>

      <hr className="border-gray-800 my-4" />

      <div id="upvotes-answers">
        <h3 className="text-base font-semibold text-white mb-2">🏆 3. Upvotes & Accepted Answers</h3>
        <p className="text-gray-400 mb-2">
          We believe in rewarding helpful community members and making it easy to find correct solutions.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-405">
          <li><strong>Upvoting:</strong> Click the Heart icon to show the author some appreciation! This pushes their reply higher.</li>
          <li><strong>The "Accepted Answer":</strong> Mark the best response as the <strong>Accepted Answer</strong> (using the Checkmark icon).</li>
          <li><strong>Helping Future Users:</strong> Accepted Answers are highlighted, saving future developers tons of time if they stumble across the same bug.</li>
        </ul>
      </div>

      <hr className="border-gray-850 my-4" />

      <div id="real-time-notifications">
        <h3 className="text-base font-semibold text-white mb-2">🔔 4. Real-Time Notifications</h3>
        <p className="text-gray-400 mb-2">
          Stay engaged without constantly refreshing the page.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-405">
          <li><strong>Instant Alerts:</strong> Our Event-Driven Architecture ensures you are notified in real-time.</li>
          <li><strong>Track Engagement:</strong> Receive a notification on your dashboard the second someone likes your topic, replies to your question, or upvotes your comment.</li>
          <li><strong>Admin Moderation:</strong> Admins receive notifications to help moderate discussions and ensure the forum remains a welcoming environment.</li>
        </ul>
      </div>

      <hr className="border-gray-800 my-4" />
      <p className="text-xs text-gray-500 italic">Introduce yourself, and join the conversation today.</p>
    </div>
  );

  const renderTechBlogsDoc = () => (
    <div className="text-gray-300 text-xs md:text-sm leading-relaxed space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white mb-3">Tech Blogs</h2>
        <p className="text-gray-400">
          The <strong>Tech Blogs</strong> module is your primary source for high-quality, long-form content. Whether you're looking for deep dives into software engineering concepts, tutorials, or opinion pieces on the latest AI trends, you'll find them here.
        </p>
      </div>

      <hr className="border-gray-800 my-4" />

      <div id="reading-experience">
        <h3 className="text-base font-semibold text-white mb-2">📖 1. Curated Articles & Reading Experience</h3>
        <p className="text-gray-400 mb-2">
          We've spent a significant amount of time optimizing the reading experience so you can focus entirely on the content.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-405">
          <li><strong>Dynamic Reading Layout:</strong> When you open an article, you are presented with a clean, distraction-free UI.</li>
          <li><strong>Sticky Table of Contents:</strong> On the left side of the screen, a dynamic Table of Contents tracks your position.</li>
          <li><strong>Reading Progress Bar:</strong> A sleek progress bar at the top of the screen indicates how far along you are.</li>
        </ul>
      </div>

      <hr className="border-gray-800 my-4" />

      <div id="bookmarking">
        <h3 className="text-base font-semibold text-white mb-2">🔖 2. Bookmarking (Read Later)</h3>
        <p className="text-gray-400 mb-2">
          Found an incredible article but don't have time to read a 15-minute deep dive right now?
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-405">
          <li><strong>Save for Later:</strong> Simply click the <strong>Bookmark</strong> icon at the top of the article.</li>
          <li><strong>Personal Reading List:</strong> Bookmarked articles are immediately saved to your personal dashboard and your StudentOS profile.</li>
        </ul>
      </div>

      <hr className="border-gray-800 my-4" />

      <div id="engagement-discussions">
        <h3 className="text-base font-semibold text-white mb-2">🗣️ 3. Engagement & Discussions</h3>
        <p className="text-gray-400 mb-2">
          Reading is just the first step. The real value comes from discussing the concepts with the author and the community.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-405">
          <li><strong>Likes & Appreciation:</strong> Click the Heart icon to show the author some appreciation!</li>
          <li><strong>Nested Comments:</strong> Leave top-level comments or reply directly to other users to start threaded discussions.</li>
          <li><strong>Rich Profiles:</strong> Click on the author's avatar or name to view their full profile.</li>
        </ul>
      </div>

      <hr className="border-gray-800 my-4" />
      <p className="text-xs text-gray-500 italic">Head over to the Blog Feed and start reading today!</p>
    </div>
  );

  const renderPersonalizationDoc = () => (
    <div className="text-gray-300 text-xs md:text-sm leading-relaxed space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white mb-3">Personalization & Account</h2>
        <p className="text-gray-450">
          HttpTechNex is designed to be your personal tech ecosystem. We've built robust customization and account features so you can make the platform truly yours.
        </p>
      </div>

      <hr className="border-gray-800 my-4" />

      <div id="google-login">
        <h3 className="text-base font-semibold text-white mb-2">🔐 1. Seamless Google Login</h3>
        <p className="text-gray-400 mb-2">
          We hate remembering passwords, and we assume you do too.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-405">
          <li><strong>One-Click Sign In:</strong> Create an account or log in instantly using your existing Google account.</li>
          <li><strong>Profile Synchronization:</strong> Your avatar and name are automatically synced to populate your developer profile!</li>
        </ul>
      </div>

      <hr className="border-gray-800 my-4" />

      <div id="welcome-dashboard">
        <h3 className="text-base font-semibold text-white mb-2">🏠 2. The Welcome Dashboard</h3>
        <p className="text-gray-400 mb-2">
          Once you log in, you are greeted by your personalized <strong>Welcome Dashboard</strong>.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-405">
          <li><strong>Overview at a Glance:</strong> The dashboard acts as a central hub, summarizing your saved articles, recent tasks, and forum activity.</li>
          <li><strong>Quick Access:</strong> It provides shortcuts to jump directly back into the chapter you were reading.</li>
        </ul>
      </div>

      <hr className="border-gray-800 my-4" />

      <div id="dark-mode">
        <h3 className="text-base font-semibold text-white mb-2">🌙 3. Dark Mode</h3>
        <p className="text-gray-400 mb-2">
          Developers love dark mode, so we made it a first-class citizen on HttpTechNex.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-405">
          <li><strong>Eye-Friendly Aesthetic:</strong> A carefully crafted dark mode is fully supported across every single page.</li>
          <li><strong>Smart Toggling:</strong> Toggle between Light and Dark mode using the button in the navigation bar.</li>
        </ul>
      </div>

      <hr className="border-gray-800 my-4" />

      <div id="newsletter">
        <h3 className="text-base font-semibold text-white mb-2">✉️ 4. Newsletter Subscription</h3>
        <p className="text-gray-400 mb-2">
          Stay in the loop without checking the site constantly.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-455">
          <li><strong>Curated Updates:</strong> Subscribe to our newsletter to receive the absolute best tech blogs and highlights.</li>
          <li><strong>No Spam:</strong> We only send high-quality updates, ensuring your inbox stays clean.</li>
        </ul>
      </div>

      <hr className="border-gray-800 my-4" />
      <p className="text-xs text-gray-500 italic">Log in now to access your dashboard and toggle dark mode!</p>
    </div>
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -50px 0px' }
    );

    const animatedElements = document.querySelectorAll('.fade-up');
    animatedElements.forEach((el) => observer.observe(el));

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#050505] overflow-hidden selection:bg-[#4F46E5]/30">
      
      {/* Subtle dotted background */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.15]"
        style={{
          backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      ></div>

      {/* Radial glow in center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="w-[800px] h-[500px] bg-gradient-to-tr from-[#4F46E5]/20 to-[#06B6D4]/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 pt-8 pb-16">
        {/* Global Search Bar */}
        <GlobalSearch />
        
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center px-4">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1e1b4b]/60 border border-[#312e81] mb-10 shadow-[0_0_15px_rgba(49,46,129,0.5)] fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA]"></span>
            <span className="text-[11px] text-[#818CF8] font-medium tracking-wide">The Developer Knowledge Platform</span>
          </div>

          <h1 className="text-[56px] md:text-[84px] font-extrabold text-white leading-[1.05] tracking-tight mb-8 fade-up" style={{ transitionDelay: '100ms' }}>
            Master Modern <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#818CF8] via-[#60A5FA] to-[#06B6D4]">
              Engineering
            </span> at <br />
            Depth
          </h1>

          <p className="text-[#9ca3af] text-[17px] md:text-[19px] max-w-[600px] mb-12 leading-[1.6] fade-up" style={{ transitionDelay: '200ms' }}>
            Structured learning paths, in-depth documentation, and expert articles for software engineers who demand precision.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto fade-up" style={{ transitionDelay: '300ms' }}>
            <Link to="/learn" className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-[#5b51ef] hover:bg-[#4d44d4] text-white font-semibold rounded-full transition-all shadow-[0_0_20px_rgba(91,81,239,0.3)]">
              <Send size={18} className="fill-current" /> Start Learning
            </Link>
            <Link to="/blog" className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-[#171717]/80 hover:bg-[#262626] border border-[#333] text-white font-semibold rounded-full transition-all">
              <BookOpen size={18} /> Explore Blogs
            </Link>
          </div>

        </section>

        {/* Stats Row */}
        <section className="mt-28 px-4 max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-[#121212] border border-[#222] rounded-2xl p-7 flex flex-col justify-center hover:border-[#333] transition-colors fade-up" style={{ transitionDelay: '100ms' }}>
              <h3 className="text-4xl font-extrabold text-white mb-2 tracking-tight">12K+</h3>
              <p className="text-[13px] text-gray-400 font-medium tracking-wide">Articles Published</p>
            </div>
            
            <div className="bg-[#121212] border border-[#222] rounded-2xl p-7 flex flex-col justify-center hover:border-[#333] transition-colors fade-up" style={{ transitionDelay: '200ms' }}>
              <h3 className="text-4xl font-extrabold text-white mb-2 tracking-tight">340+</h3>
              <p className="text-[13px] text-gray-400 font-medium tracking-wide">Learning Paths</p>
            </div>
            
            <div className="bg-[#121212] border border-[#222] rounded-2xl p-7 flex flex-col justify-center hover:border-[#333] transition-colors fade-up" style={{ transitionDelay: '300ms' }}>
              <h3 className="text-4xl font-extrabold text-white mb-2 tracking-tight">98K+</h3>
              <p className="text-[13px] text-gray-400 font-medium tracking-wide">Active Learners</p>
            </div>
            
            <div className="bg-[#121212] border border-[#222] rounded-2xl p-7 flex flex-col justify-center hover:border-[#333] transition-colors fade-up" style={{ transitionDelay: '400ms' }}>
              <h3 className="text-4xl font-extrabold text-white mb-2 tracking-tight flex items-center gap-3">
                4.9 <Star className="text-yellow-500 mb-1" fill="currentColor" size={26} strokeWidth={1} />
              </h3>
              <p className="text-[13px] text-gray-400 font-medium tracking-wide">Community Rating</p>
            </div>
          </div>
        </section>

        {/* Trusted Technologies */}
        <section className="mt-32 pb-10 border-t border-[#1a1a1a] pt-16 fade-up">
          <p className="text-center text-[10px] font-bold text-gray-600 uppercase tracking-[0.25em] mb-12">
            Trusted Technologies We Cover
          </p>
          
          <div className="flex flex-wrap justify-center gap-x-16 gap-y-10 max-w-[1000px] mx-auto px-6 opacity-60">
             {[
               { icon: 'local_cafe', label: 'JAVA' },
               { icon: 'dataset', label: 'REACT' },
               { icon: 'javascript', label: 'NODE.JS' },
               { icon: 'inventory_2', label: 'DOCKER' },
               { icon: 'cloud', label: 'AWS' },
               { icon: 'terminal', label: 'PYTHON' },
               { icon: 'account_tree', label: 'GIT' },
               { icon: 'smart_toy', label: 'AI / ML' }
             ].map((tech, idx) => (
               <div key={tech.label} className="flex flex-col items-center gap-4 hover:opacity-100 hover:-translate-y-1 transition-all duration-300 fade-up animate-delay" style={{ transitionDelay: `${idx * 70}ms` }}>
                 <span className="material-symbols-outlined text-[40px] text-gray-400" style={{ fontVariationSettings: "'FILL' 1" }}>{tech.icon}</span>
                 <span className="text-[10px] text-gray-500 font-bold tracking-widest">{tech.label}</span>
               </div>
             ))}
          </div>
        </section>

        {/* GitBook Documentation Showcase Section */}
        <section className="py-32 max-w-[1200px] mx-auto px-6 relative z-10 fade-up">
          <div className="text-center mb-16">
            <p className="text-[#06B6D4] text-[11px] font-bold uppercase tracking-[0.25em] mb-3">
              Documentation
            </p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
              GitBook-quality docs, built in
            </h2>
            <p className="text-gray-400 text-[15px] md:text-[17px] max-w-[620px] mx-auto leading-relaxed">
              Navigate structured knowledge with sidebar hierarchy, inline code blocks, and sticky table of contents.
            </p>
          </div>

          {/* MacOS Window Mockup */}
          <div className="w-full bg-[#0B0F19]/90 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:border-gray-700 hover:shadow-[0_20px_50px_rgba(6,182,212,0.15)] flex flex-col fade-up" style={{ transitionDelay: '200ms' }}>
            {/* Window Header */}
            <div className="h-12 border-b border-gray-800 flex items-center justify-between px-6 bg-[#0E1322] overflow-x-auto gap-4 md:gap-0">
              {/* Window Controls */}
              <div className="flex gap-2 flex-shrink-0">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
              </div>
              {/* Address Bar */}
              <div className="flex items-center gap-2 bg-[#080B13] border border-gray-800 rounded-lg px-4 py-1.5 w-[380px] justify-center text-xs text-gray-500 flex-shrink-0">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                <span className="truncate">
                  {import.meta.env.VITE_ENABLE_INTERACTIVE_DOCS === 'true' 
                    ? `httptechnex.dev/${docsData[activeDocId].path}`
                    : `httptechnex.dev/${docsData['user-guide'].path}`
                  }
                </span>
              </div>
              {/* Icons */}
              <div className="flex items-center gap-3 text-gray-500 flex-shrink-0">
                <span className="material-symbols-outlined text-[18px] text-[#A78BFA] cursor-pointer">bookmark</span>
                <span className="material-symbols-outlined text-[18px] cursor-pointer hover:text-gray-300">share</span>
              </div>
            </div>

            {/* Window Content */}
            <div className="flex flex-col lg:flex-row min-h-[500px]">
              {/* Left Sidebar */}
              <aside className="w-full lg:w-[240px] border-r border-gray-800 p-5 bg-[#080B14] flex-shrink-0">
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-[20px] text-gray-400">menu_book</span>
                  <span className="text-sm font-semibold text-white">Documentation</span>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2.5">Platform Docs</h4>
                    <ul className="space-y-1.5">
                      {Object.keys(docsData).map((key) => (
                        <li 
                          key={key}
                          onClick={() => {
                            if (import.meta.env.VITE_ENABLE_INTERACTIVE_DOCS === 'true') {
                              setActiveDocId(key);
                            }
                          }}
                          className={`flex items-center gap-2 text-xs py-1 px-2.5 rounded-lg cursor-pointer transition-all duration-300 ${
                            activeDocId === key 
                              ? 'text-white bg-[#4F46E5]/15 border border-[#4F46E5]/30' 
                              : 'text-gray-400 border border-transparent hover:text-white'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${activeDocId === key ? 'bg-[#818CF8]' : 'bg-gray-600'}`}></span>
                          {docsData[key].sidebarTitle}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </aside>

              {/* Main Content Pane */}
              <div className="flex-1 p-6 md:p-8 bg-[#090D18] flex flex-col justify-between overflow-y-auto max-h-[500px]">
                <div>
                  {import.meta.env.VITE_ENABLE_INTERACTIVE_DOCS === 'true' ? (
                    <>
                      {activeDocId === 'user-guide' && renderUserGuide()}
                      {activeDocId === 'learn-platform' && renderLearnPlatformDoc()}
                      {activeDocId === 'student-os' && renderStudentOSDoc()}
                      {activeDocId === 'community-forum' && renderCommunityForumDoc()}
                      {activeDocId === 'tech-blogs' && renderTechBlogsDoc()}
                      {activeDocId === 'personalization' && renderPersonalizationDoc()}
                    </>
                  ) : (
                    renderUserGuide()
                  )}
                </div>
              </div>

              {/* Right Sidebar - TOC */}
              <aside className="w-full lg:w-[200px] border-l border-gray-800 p-5 bg-[#080B14] flex flex-col justify-between flex-shrink-0">
                <div>
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4">On This Page</h4>
                  <ul className="space-y-2.5 text-[11px]">
                    {import.meta.env.VITE_ENABLE_INTERACTIVE_DOCS === 'true' ? (
                      docsData[activeDocId].sections.map((sec) => (
                        <li 
                          key={sec.id}
                          onClick={() => {
                            const el = document.getElementById(sec.id);
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                          }}
                          className="text-gray-500 cursor-pointer hover:text-gray-300 transition-colors"
                        >
                          {sec.label}
                        </li>
                      ))
                    ) : (
                      docsData['user-guide'].sections.map((sec) => (
                        <li 
                          key={sec.id}
                          className="text-gray-500 cursor-default"
                        >
                          {sec.label}
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                <div className="text-[10px] text-gray-600 mt-8 border-t border-[#1a1a1a] pt-4">
                  Last updated<br />
                  <span className="text-gray-400 font-medium">
                    {import.meta.env.VITE_ENABLE_INTERACTIVE_DOCS === 'true' 
                      ? docsData[activeDocId].lastUpdated 
                      : docsData['user-guide'].lastUpdated
                    }
                  </span>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Featured Articles */}
        <section className="py-24 max-w-[1200px] mx-auto px-6 relative z-10 fade-up">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h3 className="text-3xl font-bold text-white mb-2">Featured Articles</h3>
              <p className="text-[#8B949E]">Deep dives into complex architectural patterns and engineering practices.</p>
            </div>
            <Link to="/blog" className="hidden sm:flex items-center gap-2 text-[#60A5FA] hover:underline font-medium">
              View All Articles <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Article 1 */}
            <div className="bg-[#121212] border border-[#222] rounded-2xl overflow-hidden group hover:-translate-y-2 hover:border-[#333] transition-all duration-300 cursor-pointer fade-up" style={{ transitionDelay: '100ms' }}>
              <div className="h-48 w-full overflow-hidden relative">
                <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=800" alt="Cover"/>
                <div className="absolute top-4 left-4 bg-[#4F46E5] text-white text-[10px] px-2 py-1 rounded font-bold uppercase">Advanced</div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-3 text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span> 12 min read</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">visibility</span> 2.4k views</span>
                </div>
                <h4 className="text-lg font-bold text-white mb-3 group-hover:text-[#60A5FA] transition-colors">Microservices: Scaling Beyond the Monolith</h4>
                <p className="text-gray-400 text-sm line-clamp-2 mb-6">Explore how Netflix and Amazon orchestrate thousands of services without compromising on performance.</p>
                <div className="flex items-center justify-between border-t border-[#222] pt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#1e1e1e]"></div>
                    <span className="text-sm font-medium text-gray-300">Alex Chen</span>
                  </div>
                  <span className="material-symbols-outlined text-gray-500 hover:text-[#60A5FA] cursor-pointer">bookmark</span>
                </div>
              </div>
            </div>
            {/* Article 2 */}
            <div className="bg-[#121212] border border-[#222] rounded-2xl overflow-hidden group hover:-translate-y-2 hover:border-[#333] transition-all duration-300 cursor-pointer fade-up" style={{ transitionDelay: '200ms' }}>
              <div className="h-48 w-full overflow-hidden relative">
                <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&q=80&w=800" alt="Cover"/>
                <div className="absolute top-4 left-4 bg-[#06B6D4] text-white text-[10px] px-2 py-1 rounded font-bold uppercase">Intermediate</div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-3 text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span> 8 min read</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">visibility</span> 1.8k views</span>
                </div>
                <h4 className="text-lg font-bold text-white mb-3 group-hover:text-[#60A5FA] transition-colors">Mastering Spring Security 6.x</h4>
                <p className="text-gray-400 text-sm line-clamp-2 mb-6">Implement enterprise-grade OAuth2 and JWT authentication in your reactive applications.</p>
                <div className="flex items-center justify-between border-t border-[#222] pt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#1e1e1e]"></div>
                    <span className="text-sm font-medium text-gray-300">Sarah Miller</span>
                  </div>
                  <span className="material-symbols-outlined text-gray-500 hover:text-[#60A5FA] cursor-pointer">bookmark</span>
                </div>
              </div>
            </div>
            {/* Article 3 */}
            <div className="bg-[#121212] border border-[#222] rounded-2xl overflow-hidden group hover:-translate-y-2 hover:border-[#333] transition-all duration-300 cursor-pointer fade-up" style={{ transitionDelay: '300ms' }}>
              <div className="h-48 w-full overflow-hidden relative">
                <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800" alt="Cover"/>
                <div className="absolute top-4 left-4 bg-[#F43F5E] text-white text-[10px] px-2 py-1 rounded font-bold uppercase">Expert</div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-3 text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span> 15 min read</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">visibility</span> 3.2k views</span>
                </div>
                <h4 className="text-lg font-bold text-white mb-3 group-hover:text-[#60A5FA] transition-colors">Distributed Systems: CAP Theorem 2.0</h4>
                <p className="text-gray-400 text-sm line-clamp-2 mb-6">How modern cloud-native databases manage consistency and availability.</p>
                <div className="flex items-center justify-between border-t border-[#222] pt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#1e1e1e]"></div>
                    <span className="text-sm font-medium text-gray-300">David Wu</span>
                  </div>
                  <span className="material-symbols-outlined text-gray-500 hover:text-[#60A5FA] cursor-pointer">bookmark</span>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-24 bg-[#0A0A0A] border-y border-[#1a1a1a] relative z-10 fade-up">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-white mb-4">Popular Learning Paths</h3>
            <p className="text-[#8B949E] max-w-[36rem] mx-auto">Structured curriculum designed to take you from foundation to senior expertise.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-[#121212] border border-[#222] hover:border-[#4F46E5] rounded-2xl p-8 flex flex-col h-full group transition-all fade-up" style={{ transitionDelay: '100ms' }}>
              <div className="mb-6 w-16 h-16 rounded-2xl bg-[#4F46E5]/10 flex items-center justify-center text-[#818CF8] group-hover:bg-[#4F46E5] group-hover:text-white transition-all duration-300">
                <span className="material-symbols-outlined text-4xl">terminal</span>
              </div>
              <h5 className="text-lg font-bold text-white mb-3">Java &amp; Spring</h5>
              <p className="text-gray-400 text-sm mb-8 flex-grow">Comprehensive backend engineering focusing on JVM internals, Spring Boot, and Microservices.</p>
              <Link to="/learn" className="flex items-center gap-2 text-[#818CF8] font-bold">
                Explore Path <span className="material-symbols-outlined">chevron_right</span>
              </Link>
            </div>
            <div className="bg-[#121212] border border-[#222] hover:border-[#06B6D4] rounded-2xl p-8 flex flex-col h-full group transition-all fade-up" style={{ transitionDelay: '200ms' }}>
              <div className="mb-6 w-16 h-16 rounded-2xl bg-[#06B6D4]/10 flex items-center justify-center text-[#22D3EE] group-hover:bg-[#06B6D4] group-hover:text-white transition-all duration-300">
                <span className="material-symbols-outlined text-4xl">smart_toy</span>
              </div>
              <h5 className="text-lg font-bold text-white mb-3">AI Engineering</h5>
              <p className="text-gray-400 text-sm mb-8 flex-grow">Integrate LLMs, vector databases, and agentic workflows into modern enterprise applications.</p>
              <Link to="/learn" className="flex items-center gap-2 text-[#22D3EE] font-bold">
                Explore Path <span className="material-symbols-outlined">chevron_right</span>
              </Link>
            </div>
            <div className="bg-[#121212] border border-[#222] hover:border-[#8B5CF6] rounded-2xl p-8 flex flex-col h-full group transition-all fade-up" style={{ transitionDelay: '300ms' }}>
              <div className="mb-6 w-16 h-16 rounded-2xl bg-[#8B5CF6]/10 flex items-center justify-center text-[#A78BFA] group-hover:bg-[#8B5CF6] group-hover:text-white transition-all duration-300">
                <span className="material-symbols-outlined text-4xl">account_tree</span>
              </div>
              <h5 className="text-lg font-bold text-white mb-3">System Design</h5>
              <p className="text-gray-400 text-sm mb-8 flex-grow">Learn to architect high-availability systems that handle millions of requests per second.</p>
              <Link to="/learn" className="flex items-center gap-2 text-[#A78BFA] font-bold">
                Explore Path <span className="material-symbols-outlined">chevron_right</span>
              </Link>
            </div>
            <div className="bg-[#121212] border border-[#222] hover:border-[#F43F5E] rounded-2xl p-8 flex flex-col h-full group transition-all fade-up" style={{ transitionDelay: '400ms' }}>
              <div className="mb-6 w-16 h-16 rounded-2xl bg-[#F43F5E]/10 flex items-center justify-center text-[#FB7185] group-hover:bg-[#F43F5E] group-hover:text-white transition-all duration-300">
                <span className="material-symbols-outlined text-4xl">data_object</span>
              </div>
              <h5 className="text-lg font-bold text-white mb-3">Advanced DSA</h5>
              <p className="text-gray-400 text-sm mb-8 flex-grow">Master algorithms and data structures through the lens of competitive programming and tech interviews.</p>
              <Link to="/learn" className="flex items-center gap-2 text-[#FB7185] font-bold">
                Explore Path <span className="material-symbols-outlined">chevron_right</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Newsletter */}
      <section className="py-32 relative overflow-hidden z-10 fade-up">
        <div className="max-w-[1000px] mx-auto px-6">
          <div className="bg-[#121212] border border-[#222] rounded-3xl p-12 relative overflow-hidden flex flex-col items-center text-center shadow-2xl fade-up" style={{ transitionDelay: '150ms' }}>
            <div className="absolute inset-0 bg-gradient-to-b from-[#4F46E5]/10 to-transparent pointer-events-none"></div>
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">Level Up Your Engineering Career</h3>
            <p className="text-gray-400 mb-10 max-w-[42rem] mx-auto text-lg">Weekly curated content on distributed systems, modern tech stacks, and career growth delivered straight to your inbox.</p>
            <form className="flex flex-col sm:flex-row gap-4 w-full max-w-lg mx-auto">
              <input 
                className="flex-grow bg-[#1a1a1a] border border-[#333] rounded-xl px-5 py-4 focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] outline-none transition-all text-white placeholder-gray-500" 
                placeholder="Enter your work email" 
                type="email"
              />
              <button className="bg-[#4F46E5] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#4338CA] transition-all cursor-pointer shadow-lg shadow-[#4F46E5]/20">
                Subscribe Now
              </button>
            </form>
          </div>
        </div>
      </section>

      </div>
    </div>
  );
};

export default Home;
