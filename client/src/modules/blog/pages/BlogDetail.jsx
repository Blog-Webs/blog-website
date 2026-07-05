import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Share2, Bookmark, ThumbsUp, MessageSquare, Mail, Link as LinkIcon } from 'lucide-react';
import { blogApi } from '../api/blog';
import { useAuth } from '../../core/context/AuthContext';
import BlockNoteRenderer from '../../core/components/ui/BlockNoteRenderer';
import { optimizeImage } from '../../../utils/image';
import CodeBlock from '../../core/components/ui/CodeBlock';
import { ArticleSkeleton } from '../../core/components/ui/Skeleton';
import { useReadingProgress } from '../../core/hooks/useReadingProgress';

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // We use this ref to measure the scroll container for the reading progress ring
  const scrollRef = useRef(null);

  const [blog, setBlog] = useState(null);
  const [upNext, setUpNext] = useState([]);
  const [loading, setLoading] = useState(true);

  // SVG Reading Progress calculations
  const progress = useReadingProgress(scrollRef);
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    setLoading(true);
    blogApi.getBlogBySlug(slug).then(({ data }) => {
      setBlog(data.blog);
      // Ensure we have mock "UP NEXT" data if empty to match the design
      setUpNext(data.upNext?.length > 0 ? data.upNext : [
        { title: 'The Evolution of Neural Architectures', readTimeMinutes: 8, _id: 'mock1', coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=300' },
        { title: 'Silicon vs. Graphene: The Next Frontier', readTimeMinutes: 12, _id: 'mock2', coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=300' },
      ]);
      setLoading(false);
      window.scrollTo({ top: 0 });
    }).catch(() => {
      // Fallback for UI demonstration if API fails or backend isn't seeded
      setBlog({
        title: 'Quantum Superiority: Moving Beyond the Hype and Into Real-World Applications',
        category: 'QUANTUM COMPUTING',
        createdAt: new Date().toISOString(),
        readTimeMinutes: 15,
        author: { name: 'Dr. Elena Volkov', role: 'Senior Research Fellow at HTTPTechLabs', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100' },
        coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1000',
        content: 'For Decades, quantum computing was relegated to the realm of theoretical physics—a collection of complex equations and "blackboard experiments" that promised a revolution but offered few tangible results. Today, that narrative is shifting with unprecedented speed.\n\n## The Entanglement Problem\n\nAt the heart of the current quantum renaissance lies the mastery of qubit stability. Unlike classical bits, which are binary, qubits exist in a state of superposition. This allows for parallel processing power that scales exponentially. However, maintaining this state requires temperatures colder than deep space.\n\n> "The challenge isn\'t just building a quantum computer; it\'s building one that doesn\'t forget its own state the moment a stray photon passes by."\n\n## Algorithmic Sovereignty\n\nThe applications extend far beyond cryptography. We are seeing early-stage breakthroughs in molecular simulation for drug discovery and the optimization of global supply chains that would take classical supercomputers centuries to solve.\n\n```python\ndef quantum_simulate(qubits, circuit):\n    # Initialize hardware state\n    state = q_engine.init_state(qubits)\n    # Execute entanglement gates\n    for gate in circuit:\n        state = apply_gate(gate, state)\n    return state.measure()\n```\n\nAs we look toward 2030, the goal is "Quantum Advantage"—the point where these machines provide a distinct economic or scientific value that justifies their immense complexity.',
      });
      setUpNext([
        { title: 'The Evolution of Neural Architectures', readTimeMinutes: 8, _id: 'mock1', coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=300' },
        { title: 'Silicon vs. Graphene: The Next Frontier', readTimeMinutes: 12, _id: 'mock2', coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=300' },
      ]);
      setLoading(false);
      window.scrollTo({ top: 0 });
    });
  }, [slug, user]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 bg-[#0a0a0a]">
        <ArticleSkeleton />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-gray-500">
        Post not found.
      </div>
    );
  }

  // Mock TOC based on screenshot for visual fidelity
  const mockToc = [
    { id: 'entanglement', text: 'The Entanglement Problem' },
    { id: 'algorithmic', text: 'Algorithmic Sovereignty' },
    { id: 'economic', text: 'Economic Value at Scale' },
    { id: 'conclusion', text: 'Conclusion' }
  ];

  return (
    <div className="min-h-screen bg-[#0E1015] text-on-surface font-sans" ref={scrollRef}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16">
          
          {/* LEFT SIDEBAR: UP NEXT */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-28">
              <h4 className="text-[10px] font-bold tracking-[0.15em] text-on-surface-variant uppercase mb-6">UP NEXT</h4>
              <div className="space-y-8">
                {upNext.map((post) => (
                  <div key={post._id} className="group cursor-pointer">
                    {post.coverImage && (
                      <div className="w-full h-28 rounded-lg overflow-hidden mb-3 border border-outline-variant/10 shadow-lg">
                         <img src={optimizeImage(post.coverImage)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                      </div>
                    )}
                    <h5 className="font-bold text-sm text-on-surface leading-snug group-hover:text-primary transition-colors mb-1.5">{post.title}</h5>
                    <div className="text-xs text-on-surface-variant font-mono">{post.readTimeMinutes} min read</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* CENTER COLUMN: MAIN ARTICLE */}
          <main className="col-span-1 lg:col-span-6">
            
            {/* Meta Tags */}
            <div className="flex items-center gap-3 text-xs mb-6">
              <span className="bg-[#1C202B] text-[#818CF8] font-mono px-2.5 py-1 rounded-md uppercase tracking-wide font-semibold border border-[#2D3342]">
                {blog.category || 'QUANTUM COMPUTING'}
              </span>
              <span className="text-on-surface-variant">—</span>
              <span className="text-on-surface-variant font-mono">{new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {blog.readTimeMinutes} min read</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-display font-bold leading-[1.15] text-on-surface mb-8 tracking-tight">
              {blog.title}
            </h1>

            {/* Author */}
            <div className="flex items-center gap-4 p-4 rounded-xl border border-outline-variant/10 bg-[#161B22] mb-12 shadow-lg">
              <img src={blog.author?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100'} alt="Author" className="w-12 h-12 rounded-full border border-outline-variant/30 object-cover" />
              <div>
                <div className="font-bold text-on-surface text-sm mb-0.5">{blog.author?.name || 'Dr. Elena Volkov'}</div>
                <div className="text-xs text-on-surface-variant">{blog.author?.role || 'Senior Research Fellow at HTTPTechLabs'}</div>
              </div>
            </div>

            {/* Cover Image */}
            {blog.coverImage && (
              <div className="rounded-2xl overflow-hidden mb-12 border border-outline-variant/10 shadow-[0_0_50px_rgba(255,255,255,0.05)] group relative h-[340px] md:h-[480px]">
                <img 
                  src={optimizeImage(blog.coverImage)} 
                  alt={blog.title} 
                  className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-[2000ms] ease-out brightness-90 group-hover:brightness-100" 
                  style={{ transform: `translateY(${progress * 0.2}px)` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E1015] via-transparent to-transparent pointer-events-none transition-opacity duration-500 opacity-60"></div>
                
                {/* Floating Light Effect */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#818CF8] rounded-full blur-[100px] opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity duration-1000"></div>
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#abc4ff] rounded-full blur-[100px] opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity duration-1000"></div>
              </div>
            )}

            {/* Content Body */}
            {/* The drop cap uses an arbitrary variant to target the first letter of the first paragraph */}
            <div 
              className="prose prose-invert max-w-none prose-lg font-body-lg text-on-surface-variant leading-[1.8] mb-12
                prose-p:mb-8 prose-h2:font-display prose-h2:font-bold prose-h2:text-3xl prose-h2:text-on-surface prose-h2:mt-16 prose-h2:mb-6
                prose-blockquote:bg-[#161B22] prose-blockquote:border-l-[#818CF8] prose-blockquote:border-y prose-blockquote:border-r prose-blockquote:border-y-outline-variant/10 prose-blockquote:border-r-outline-variant/10 prose-blockquote:rounded-r-xl prose-blockquote:py-6 prose-blockquote:px-8 prose-blockquote:not-italic prose-blockquote:font-medium prose-blockquote:text-on-surface prose-blockquote:shadow-lg prose-blockquote:text-xl
                [&>p:first-of-type]:first-letter:text-[76px] [&>p:first-of-type]:first-letter:font-display [&>p:first-of-type]:first-letter:font-bold [&>p:first-of-type]:first-letter:text-[#818CF8] [&>p:first-of-type]:first-letter:float-left [&>p:first-of-type]:first-letter:mr-4 [&>p:first-of-type]:first-letter:leading-[0.8] [&>p:first-of-type]:first-letter:mt-2
                prose-pre:bg-[#111113] prose-pre:border prose-pre:border-outline-variant/20 prose-pre:rounded-xl prose-pre:p-5
              "
            >
              {blog.contentBlocks?.length > 0 ? (
                <BlockNoteRenderer blocks={blog.contentBlocks} />
              ) : (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{ code: CodeBlock }}
                >
                  {blog.content}
                </ReactMarkdown>
              )}
            </div>

            {/* Floating Action Footer */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between gap-6 py-3 px-6 rounded-full bg-[#15171D]/90 backdrop-blur-md border border-outline-variant/20 shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all duration-300 transform">
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 bg-[#abc4ff] text-[#0E1015] px-5 py-2 rounded-full font-bold text-sm hover:bg-[#b9cdff] transition-colors shadow-[0_0_20px_rgba(171,196,255,0.2)] hover:scale-105 transform">
                  <ThumbsUp size={16} fill="currentColor" />
                  1.2k
                </button>
                <button className="flex items-center justify-center w-9 h-9 rounded-full bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors hover:scale-110 transform">
                  <Bookmark size={16} />
                </button>
                <button className="flex items-center justify-center w-9 h-9 rounded-full bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors hover:scale-110 transform">
                  <Share2 size={16} />
                </button>
              </div>
              <div className="hidden sm:flex items-center gap-2 border-l border-outline-variant/20 pl-4">
                <span className="text-[10px] font-mono font-bold tracking-widest text-on-surface-variant uppercase mr-2">Tags</span>
                <span className="text-[11px] font-mono bg-[#1C202B] border border-outline-variant/10 text-primary px-3 py-1 rounded-full cursor-pointer hover:bg-surface-container transition-colors">#Quantum</span>
                <span className="text-[11px] font-mono bg-[#1C202B] border border-outline-variant/10 text-primary px-3 py-1 rounded-full cursor-pointer hover:bg-surface-container transition-colors">#AI</span>
              </div>
            </div>

            {/* Discussions Section */}
            <section className="mb-8">
              <h2 className="text-3xl font-display font-bold text-on-surface mb-8">Discussions (24)</h2>
              
              {/* Comment Input */}
              <div className="bg-[#15171D] border border-outline-variant/10 rounded-xl p-6 mb-10 shadow-lg">
                <div className="flex gap-4 mb-4">
                  <img src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'} className="w-10 h-10 rounded-full bg-surface-container" alt="User" />
                  <textarea 
                    className="w-full bg-transparent border-none text-on-surface text-sm placeholder:text-on-surface-variant/50 focus:ring-0 resize-none pt-2"
                    placeholder="Join the discussion..."
                    rows="2"
                  ></textarea>
                </div>
                <div className="flex items-center justify-between border-t border-outline-variant/10 pt-4">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <button className="p-1 hover:text-on-surface transition-colors font-bold font-serif px-2">B</button>
                    <button className="p-1 hover:text-on-surface transition-colors italic font-serif px-2">I</button>
                    <button className="p-1 hover:text-on-surface transition-colors px-2"><LinkIcon size={14} /></button>
                  </div>
                  <button className="bg-[#abc4ff] text-[#0E1015] px-6 py-2 rounded-lg font-bold text-xs hover:bg-[#b9cdff] transition-colors">
                    Post Comment
                  </button>
                </div>
              </div>

              {/* Mock Comments */}
              <div className="space-y-8">
                {/* Comment 1 */}
                <div className="flex gap-4">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Julian" className="w-10 h-10 rounded-full bg-surface-container shrink-0" alt="User" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-on-surface">Julian Pearce</span>
                      <span className="text-xs text-on-surface-variant">2 hours ago</span>
                    </div>
                    <p className="text-sm text-on-surface-variant mb-3 leading-relaxed">
                      Exceptional breakdown. I think the timeline for Quantum Advantage in logistics might be even sooner—some firms are already seeing 10x speedups in pathfinding experiments.
                    </p>
                    <div className="flex items-center gap-4 text-xs font-bold text-on-surface-variant">
                      <button className="flex items-center gap-1 hover:text-on-surface transition-colors"><ThumbsUp size={12} /> 42</button>
                      <button className="flex items-center gap-1 hover:text-on-surface transition-colors"><MessageSquare size={12} /> Reply</button>
                    </div>

                    {/* Reply */}
                    <div className="flex gap-4 mt-6 border-l-2 border-outline-variant/10 pl-6">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sara" className="w-8 h-8 rounded-full bg-surface-container shrink-0" alt="User" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm text-on-surface">Sara T.</span>
                          <span className="text-xs text-on-surface-variant">1 hour ago</span>
                        </div>
                        <p className="text-sm text-on-surface-variant mb-3 leading-relaxed">
                          Agreed @Julian! The optimization potential for urban traffic flows is particularly exciting for smart city data.
                        </p>
                        <div className="flex items-center gap-4 text-xs font-bold text-on-surface-variant">
                          <button className="hover:text-on-surface transition-colors">Like</button>
                          <button className="hover:text-on-surface transition-colors">Reply</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comment 2 */}
                <div className="flex gap-4">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus" className="w-10 h-10 rounded-full bg-surface-container shrink-0" alt="User" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-on-surface">Marcus Chen</span>
                      <span className="text-xs text-on-surface-variant">5 hours ago</span>
                    </div>
                    <p className="text-sm text-on-surface-variant mb-3 leading-relaxed">
                      Great article. But we also need to talk about the ethical implications of breaking current encryption standards. Are we ready for a post-RSA world?
                    </p>
                    <div className="flex items-center gap-4 text-xs font-bold text-on-surface-variant">
                      <button className="flex items-center gap-1 hover:text-on-surface transition-colors"><ThumbsUp size={12} /> 18</button>
                      <button className="flex items-center gap-1 hover:text-on-surface transition-colors"><MessageSquare size={12} /> Reply</button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

          </main>

          {/* RIGHT SIDEBAR: TOC & PROGRESS */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-28 space-y-12 pl-6 border-l border-outline-variant/10">
              
              {/* Reading Progress */}
              <div className="flex flex-col items-center p-6 rounded-2xl bg-[#15171D] border border-outline-variant/10 shadow-xl">
                <div className="relative flex items-center justify-center w-24 h-24 mb-5">
                  {/* Background Circle */}
                  <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                    {/* Progress Circle */}
                    <circle 
                      cx="32" cy="32" r={radius} 
                      fill="none" stroke="#abc4ff" strokeWidth="3" 
                      strokeDasharray={circumference} 
                      strokeDashoffset={strokeDashoffset} 
                      strokeLinecap="round"
                      className="transition-all duration-300 ease-out"
                    />
                  </svg>
                  <span className="text-lg font-bold font-mono text-on-surface">{Math.round(progress)}%</span>
                </div>
                <div className="text-[9px] font-bold tracking-[0.2em] text-on-surface-variant uppercase text-center">
                  READING PROGRESS
                </div>
              </div>

              {/* Table of Contents */}
              <div>
                <h4 className="text-[10px] font-bold tracking-[0.15em] text-on-surface-variant uppercase mb-4">ON THIS PAGE</h4>
                <nav className="flex flex-col gap-3">
                  {mockToc.map((item, i) => (
                    <a key={i} href={`#${item.id}`} className="text-sm text-on-surface-variant hover:text-on-surface transition-colors font-medium">
                      {item.text}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Share */}
              <div>
                <h4 className="text-[10px] font-bold tracking-[0.15em] text-on-surface-variant uppercase mb-4">SHARE THIS INSIGHT</h4>
                <div className="flex gap-3">
                  <button className="flex items-center justify-center w-10 h-10 rounded-full bg-[#15171D] border border-outline-variant/10 hover:border-outline-variant/30 text-on-surface-variant hover:text-on-surface transition-colors">
                    <Mail size={16} />
                  </button>
                  <button className="flex items-center justify-center w-10 h-10 rounded-full bg-[#15171D] border border-outline-variant/10 hover:border-outline-variant/30 text-on-surface-variant hover:text-on-surface transition-colors">
                    <LinkIcon size={16} />
                  </button>
                </div>
              </div>

            </div>
          </aside>

        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
