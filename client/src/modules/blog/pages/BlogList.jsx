import { useState } from 'react';
import { Link } from 'react-router-dom';

const BlogList = () => {
  const [activeFilter, setActiveFilter] = useState('All Posts');
  
  const filters = ['All Posts', 'Engineering', 'Product', 'Design', 'Culture'];

  const latestPosts = [
    {
      id: 1,
      title: 'Beyond Transformers: The Rise of State Space Models',
      description: 'Exploring the next generation of LLM architecture that promises infinite context windows and efficient training.',
      category: 'AI/ML',
      categoryColor: 'text-purple-400 bg-purple-400/10',
      author: 'Sarah Jenkins',
      date: 'Mar 12, 2024',
      image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 2,
      title: 'Ephemeral Infrastructure with NixOS and Flakes',
      description: 'How we moved our entire local development to reproducible, declarative systems that never break.',
      category: 'INFRASTRUCTURE',
      categoryColor: 'text-cyan-400 bg-cyan-400/10',
      author: 'Marcus Chen',
      date: 'Mar 10, 2024',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 3,
      title: 'The Zero Trust Fallacy: Rethinking Cloud Security',
      description: 'Zero trust is a marketing buzzword. Real infrastructure security demands a more nuanced, defense-in-depth approach.',
      category: 'SECURITY',
      categoryColor: 'text-red-400 bg-red-400/10',
      author: 'Elena Thorne',
      date: 'Mar 08, 2024',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 4,
      title: 'WebGPU in the Browser: Mastering the Rendering Pipeline',
      description: 'A bottoms-up deep dive into compute shaders, multithreading, and insane browser performance leaps.',
      category: 'FRONTEND',
      categoryColor: 'text-blue-400 bg-blue-400/10',
      author: 'David Vo',
      date: 'Mar 05, 2024',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 5,
      title: 'Smart Contracts Beyond the Hype: Pragmatic Uses',
      description: 'Looking past the noise to find real enterprise value in decentralized ledgers and automated agreements.',
      category: 'WEB3',
      categoryColor: 'text-violet-400 bg-violet-400/10',
      author: 'Alex Rivera',
      date: 'Mar 02, 2024',
      image: 'https://images.unsplash.com/photo-1639322537504-6427a16b0a28?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 6,
      title: 'The Return of the Monolith? A Contrarian View',
      description: 'Why modern hardware and mature frameworks might make the distributed systems architecture obsolete for 99% of apps.',
      category: 'ARCHITECTURE',
      categoryColor: 'text-teal-400 bg-teal-400/10',
      author: 'Sarah Jenkins',
      date: 'Feb 28, 2024',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800'
    }
  ];

  return (
    <div className="pt-24 pb-16 px-gutter max-w-max-width mx-auto">
      
      {/* Filters (Scrollable on mobile) */}
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-4 mb-8 border-b border-outline-variant/10">
        {filters.map(filter => (
          <button 
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all ${
              activeFilter === filter 
                ? 'bg-primary/20 text-primary border border-primary/20' 
                : 'border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:border-outline-variant/60'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Content Area (8 cols on desktop) */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Featured Article */}
          <article className="flex flex-col bg-surface-container-low border border-outline-variant/20 rounded-2xl overflow-hidden card-hover transition-all duration-300">
            <div className="h-64 sm:h-80 w-full overflow-hidden relative">
              <img className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" src="https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=1200" alt="Featured Cover" />
            </div>
            <div className="p-6 md:p-8 flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-md text-[10px] uppercase font-bold tracking-widest border border-primary/20">ENGINEERING</span>
                <span className="text-on-surface-variant text-xs flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span> 12 MIN READ</span>
              </div>
              
              <Link to="/blog/architecting-the-infinite">
                <h2 className="font-display text-headline-md md:text-headline-lg text-on-surface mb-4 hover:text-primary transition-colors leading-tight">
                  Architecting the Infinite: Scalable Microservices in 2024
                </h2>
              </Link>
              
              <p className="text-on-surface-variant font-body-md mb-8">
                Deep dive into the evolving landscape of cloud-native infrastructure. Learn how we utilize Rust and Kafka to scale to billions of events with sub-millisecond latency.
              </p>
              
              <div className="mt-auto flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-t border-outline-variant/10 pt-6">
                <div className="flex items-center gap-3">
                  <img className="w-10 h-10 rounded-full object-cover border border-outline-variant/30" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100" alt="Alex Rivera" />
                  <div>
                    <div className="text-sm font-bold text-on-surface">Alex Rivera</div>
                    <div className="text-xs text-on-surface-variant">Lead Engineer</div>
                  </div>
                </div>
                
                <Link to="/blog/architecting-the-infinite" className="bg-[#abc4ff] text-[#0a0a0a] px-6 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#b9cdff] transition-colors">
                  Read Article <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          </article>

          {/* Section Header */}
          <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4">
            <h3 className="font-display text-headline-md text-on-surface">Latest Intelligence</h3>
            <Link to="/blog/archive" className="flex items-center gap-1 text-primary text-sm font-bold hover:underline">
              View Archive <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
            </Link>
          </div>

          {/* List of Posts */}
          <div className="space-y-6">
            {latestPosts.map(post => (
              <article key={post.id} className="flex flex-col sm:flex-row bg-[#111113] border border-outline-variant/20 rounded-xl overflow-hidden hover:border-outline-variant/50 transition-colors group">
                <div className="w-full sm:w-1/3 md:w-2/5 h-48 sm:h-auto overflow-hidden relative shrink-0">
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={post.image} alt={post.title} />
                  <div className={`absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-white/5 backdrop-blur-md ${post.categoryColor}`}>
                    {post.category}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <Link to={`/blog/${post.id}`}>
                    <h4 className="font-display text-lg text-on-surface mb-2 group-hover:text-primary transition-colors leading-tight">
                      {post.title}
                    </h4>
                  </Link>
                  <p className="text-on-surface-variant text-sm line-clamp-2 mb-4 flex-grow">
                    {post.description}
                  </p>
                  <div className="flex items-center gap-2 mt-auto text-xs">
                    <div className="w-6 h-6 rounded-full bg-surface-container-highest overflow-hidden">
                       <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${post.author}`} alt={post.author} />
                    </div>
                    <div>
                      <span className="font-medium text-on-surface">{post.author}</span>
                      <span className="text-on-surface-variant/50 mx-1">•</span>
                      <span className="text-on-surface-variant">{post.date}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 pt-8">
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md bg-[#abc4ff] text-black font-bold text-sm">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors text-sm">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors text-sm">3</button>
            <span className="text-on-surface-variant px-1">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors text-sm">12</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Sidebar (4 cols on desktop) */}
        <aside className="lg:col-span-4 mt-12 lg:mt-0">
          <div className="sticky top-24">
            <div className="bg-[#111113] border border-outline-variant/20 rounded-2xl p-8 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#abc4ff]/10 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[#abc4ff] text-[24px]">forward_to_inbox</span>
              </div>
              <h4 className="font-display text-2xl text-on-surface mb-4 leading-tight">
                Join 50,000+ developers receiving our weekly intel.
              </h4>
              <p className="text-on-surface-variant text-sm mb-8 leading-relaxed">
                Get the latest engineering insights, AI research, and architecture patterns delivered straight to your inbox. No spam, ever.
              </p>
              
              <form className="w-full space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Subscribed!'); }}>
                <input 
                  type="email" 
                  placeholder="dev@work.com" 
                  className="w-full bg-[#0a0a0a] border border-outline-variant/30 rounded-lg px-4 py-3 text-sm focus:border-[#abc4ff] focus:ring-1 focus:ring-[#abc4ff] outline-none transition-all text-on-surface placeholder:text-on-surface-variant/50 text-center"
                  required
                />
                <button type="submit" className="w-full bg-[#abc4ff] text-[#0a0a0a] font-bold py-3 rounded-lg hover:bg-[#b9cdff] transition-colors text-sm">
                  Subscribe
                </button>
              </form>
              <p className="text-[10px] text-on-surface-variant/50 mt-4">
                By subscribing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BlogList;
