import { Link } from 'react-router-dom';

const DocsPage = () => {
  return (
    <div className="pt-24 pb-16 px-gutter max-w-3xl mx-auto text-on-surface">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-6">
        <Link to="/docs" className="hover:text-on-surface transition-colors">DOCUMENTATION</Link>
        <span>›</span>
        <Link to="/docs/platform" className="hover:text-on-surface transition-colors">PLATFORM</Link>
        <span>›</span>
        <span className="text-on-surface">LEARN PLATFORM</span>
      </div>

      {/* Header Section */}
      <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 leading-tight">
        The Learn Platform
      </h1>
      <p className="text-lg md:text-xl text-on-surface-variant mb-6 leading-relaxed">
        Welcome to The Learn Platform! This module is designed to act as your personal coding bootcamp and computer science university, taking you from a complete beginner to an advanced developer.
      </p>

      {/* Author Info */}
      <div className="flex items-center gap-3 mb-10 pb-10 border-b border-outline-variant/20">
        <img 
          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100" 
          alt="Author" 
          className="w-10 h-10 rounded-full border border-outline-variant/30 object-cover"
        />
        <div>
          <div className="text-sm font-bold">By Alex Rivera</div>
          <div className="text-xs text-on-surface-variant mt-0.5">Updated Oct 24, 2024 • 12 min read</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-8 font-body-lg text-on-surface-variant leading-relaxed">
        <p>
          Whether you are mastering the fundamentals of Web Development, diving into Data Structures, or exploring Machine Learning, the Learn Platform provides a structured, interactive, and personalized educational experience.
        </p>

        {/* Red Alert Box */}
        <div className="bg-[#2A1616] border border-[#3E2020] border-l-4 border-l-[#E57373] rounded-lg p-5 flex gap-4">
          <span className="material-symbols-outlined text-[#E57373] shrink-0">warning</span>
          <div>
            <h4 className="font-bold text-[#E57373] mb-1 text-sm">Important Concept</h4>
            <p className="text-sm text-on-surface-variant">
              Inside a Subject, you will find a breakdown of Topics. Think of Topics as specific courses or modules within a university degree. Clicking on a Topic will take you to its dedicated reading page.
            </p>
          </div>
        </div>

        <h2 className="font-display text-2xl font-bold text-on-surface mt-12 mb-4">
          1. Navigating Subjects and Topics
        </h2>
        <p>
          When you open the Learn Platform, you are greeted with a curated list of Subjects (e.g., Frontend Web Development, Backend Architecture, Algorithms). To begin, define your learning path by selecting the curriculum for better throughput.
        </p>

        {/* Code Block (Mac Window Style) */}
        <div className="bg-[#111113] border border-outline-variant/20 rounded-xl overflow-hidden mt-6">
          {/* Window Header */}
          <div className="bg-[#1C1B1D] px-4 py-3 flex items-center border-b border-outline-variant/10">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
            </div>
            <div className="text-xs font-mono text-on-surface-variant/70 mx-auto">navigation.js</div>
          </div>
          {/* Code Content */}
          <div className="p-5 overflow-x-auto">
            <pre className="font-mono text-sm leading-relaxed">
<code className="text-[#E0E0E0]">
<span className="text-[#C678DD]">const</span> <span className="text-[#E5C07B]">loadSubject</span> <span className="text-[#56B6C2]">=</span> (<span className="text-[#E06C75]">subjectId</span>) <span className="text-[#C678DD]">=&gt;</span> {'{'}
{'\n  '}<span className="text-[#56B6C2]">return</span> api.<span className="text-[#61AFEF]">fetch</span>(<span className="text-[#98C379]">{"`/api/subjects/${subjectId}`"}</span>)
{'\n    '}.<span className="text-[#61AFEF]">then</span>(<span className="text-[#E06C75]">data</span> <span className="text-[#C678DD]">=&gt;</span> {'{'}
{'\n      '}<span className="text-[#E5C07B]">setTopics</span>(data.topics);
{'\n      '}<span className="text-[#56B6C2]">if</span> (data.topics.length <span className="text-[#56B6C2]">&gt;</span> <span className="text-[#D19A66]">0</span>) {'{'}
{'\n        '}<span className="text-[#E5C07B]">setActiveTopic</span>(data.topics[<span className="text-[#D19A66]">0</span>]);
{'\n      '}  <span className="text-[#E5C07B]">initProgressTracker</span>();
{'\n      '}{'}'}
{'\n    '}{'}'});
{'\n'}{'}'}
</code>
            </pre>
          </div>
        </div>

        {/* Blue Alert Box */}
        <div className="bg-[#161D2B] border border-[#20293E] border-l-4 border-l-[#64B5F6] rounded-lg p-5 flex gap-4 mt-6">
          <span className="material-symbols-outlined text-[#64B5F6] shrink-0">info</span>
          <div>
            <h4 className="font-bold text-[#64B5F6] mb-1 text-sm">Pro Tip</h4>
            <p className="text-[#abc4ff]/80 text-sm">
              Always use the Sticky Table of Contents on the right side of your screen to jump between headings instantly and optimize your study sessions.
            </p>
          </div>
        </div>

        <h2 className="font-display text-2xl font-bold text-on-surface mt-12 mb-4">
          2. Progress Tracking
        </h2>
        <p>
          You never have to remember where you left off. The Learn Platform automatically tracks your progress as you read!
        </p>

        {/* Features Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-surface-container border border-outline-variant/20 rounded-xl p-5 hover:border-outline-variant/40 transition-colors">
            <span className="material-symbols-outlined text-green-400 mb-3 text-[20px]">timeline</span>
            <h4 className="font-bold text-on-surface text-sm mb-2">Reading Progress Bar</h4>
            <p className="text-xs text-on-surface-variant">As you scroll through a chapter, a progress bar at the top visually indicates how far along you are.</p>
          </div>
          <div className="bg-surface-container border border-outline-variant/20 rounded-xl p-5 hover:border-outline-variant/40 transition-colors">
            <span className="material-symbols-outlined text-purple-400 mb-3 text-[20px]">bookmark</span>
            <h4 className="font-bold text-on-surface text-sm mb-2">Automatic Bookmarking</h4>
            <p className="text-xs text-on-surface-variant">The system remembers exactly which chapter you were on, allowing you to resume instantly.</p>
          </div>
        </div>
      </div>

      {/* Pagination & Share Bottom */}
      <div className="mt-16 pt-8 border-t border-outline-variant/20">
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link to="/docs/getting-started" className="group flex-1 flex flex-col items-start bg-surface-container/50 border border-outline-variant/10 rounded-xl p-5 hover:border-outline-variant/30 transition-all">
            <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">PREVIOUS</span>
            <span className="font-bold text-sm md:text-base text-on-surface group-hover:text-primary transition-colors">Getting Started</span>
          </Link>
          <Link to="/docs/student-os" className="group flex-1 flex flex-col items-end text-right bg-surface-container/50 border border-outline-variant/10 rounded-xl p-5 hover:border-outline-variant/30 transition-all">
            <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">NEXT</span>
            <span className="font-bold text-sm md:text-base text-on-surface group-hover:text-primary transition-colors">StudentOS Features</span>
          </Link>
        </div>
        
        <div className="flex justify-center">
          <button className="flex items-center gap-2 bg-[#abc4ff] hover:bg-[#b9cdff] text-[#0a0a0a] font-bold text-sm px-6 py-2.5 rounded-full transition-colors">
            <span className="material-symbols-outlined text-[18px]">share</span>
            Share Article
          </button>
        </div>
      </div>

    </div>
  );
};

export default DocsPage;
