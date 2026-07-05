import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ChevronRight, TerminalSquare, ExternalLink } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans pb-32" style={{ 
      backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)', 
      backgroundSize: '24px 24px',
      backgroundPosition: '0 0'
    }}>
      {/* Hero Section */}
      <section className="pt-24 pb-20 px-6 max-w-[1200px] mx-auto text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2C1B2E] border border-purple-900/50 mb-8 cursor-pointer hover:bg-[#3d2540] transition-colors">
          <span className="text-[#8B5CF6]">⚡</span>
          <span className="text-[11px] font-semibold text-[#c4b5fd] tracking-wide uppercase">New Track: Advanced Microservices with Go</span>
        </div>
        
        <h1 className="text-[56px] md:text-[72px] font-bold text-white leading-[1.05] tracking-[-0.02em] mb-6">
          Master Modern <br />
          <span className="text-[#abc4ff] italic">Engineering</span> at Depth
        </h1>
        
        <p className="text-[17px] text-gray-400 max-w-2xl leading-[1.6] mb-10">
          Structured learning paths, in-depth documentation, and expert articles for 
          software engineers who demand precision. Build your expertise from 
          fundamentals to production-grade architectures.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link to="/learn/dsa" className="w-full sm:w-auto px-6 py-3.5 bg-[#abc4ff] text-[#0a0a0a] font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-[#b9cdff] transition-colors">
            Start Learning <ArrowRight size={18} />
          </Link>
          <Link to="/blog" className="w-full sm:w-auto px-6 py-3.5 bg-transparent border border-white/10 text-white font-semibold rounded-lg hover:bg-white/5 transition-colors flex items-center justify-center">
            Explore Blogs
          </Link>
        </div>
      </section>

      {/* Stats Row */}
      <section className="max-w-[1200px] mx-auto px-6 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#131315] border border-white/5 rounded-2xl p-8 flex flex-col justify-center">
            <h3 className="text-[40px] font-bold text-[#abc4ff] leading-none mb-2">12K+</h3>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Expert Articles</p>
          </div>
          <div className="bg-[#131315] border border-white/5 rounded-2xl p-8 flex flex-col justify-center">
            <h3 className="text-[40px] font-bold text-[#abc4ff] leading-none mb-2">340+</h3>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Learning Paths</p>
          </div>
          <div className="bg-[#131315] border border-white/5 rounded-2xl p-8 flex flex-col justify-center">
            <h3 className="text-[40px] font-bold text-[#abc4ff] leading-none mb-2">98K+</h3>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Active Learners</p>
          </div>
        </div>
      </section>

      {/* Technologies Bar */}
      <section className="border-y border-white/5 bg-[#0e0e10] py-12 mb-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <p className="text-center text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-10">Architectures Powered By Industry Standards</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 text-[13px] font-semibold text-gray-300">
            <div className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">terminal</span> Java</div>
            <div className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">code</span> React</div>
            <div className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">javascript</span> Node.js</div>
            <div className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">inventory_2</span> Docker</div>
            <div className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">cloud</span> AWS</div>
            <div className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">data_object</span> Python</div>
            <div className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">account_tree</span> Git</div>
            <div className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">psychology</span> AI/ML</div>
          </div>
        </div>
      </section>

      {/* Personal Productivity Split */}
      <section className="max-w-[1200px] mx-auto px-6 mb-32 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight tracking-tight">
            Personal Productivity <br />
            <span className="text-[#abc4ff]">Engineered for Devs</span>
          </h2>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed max-w-md">
            A unified workspace built for the technical mind. Manage complex documentation tracks, maintain task lists for your side projects, and store code snippets—all in one encrypted vault.
          </p>
          
          <div className="flex flex-col gap-8">
            <div className="flex gap-4">
              <div className="mt-1 w-8 h-8 rounded-full bg-[#1e2336] flex items-center justify-center text-[#abc4ff] shrink-0">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Contextual Task Manager</h4>
                <p className="text-sm text-gray-500 leading-relaxed">Link tasks directly to learning modules or GitHub issues.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="mt-1 w-8 h-8 rounded-full bg-[#1e2336] flex items-center justify-center text-[#abc4ff] shrink-0">
                <TerminalSquare size={16} />
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Markdown Native Notes</h4>
                <p className="text-sm text-gray-500 leading-relaxed">Full support for LaTeX math and Mermaid diagrams.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mac Window Mockup */}
        <div className="bg-[#131315] border border-white/5 rounded-xl shadow-2xl overflow-hidden text-sm">
          {/* Top Bar */}
          <div className="bg-[#0e0e10] border-b border-white/5 px-4 py-3 flex items-center justify-between">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]"></div>
            </div>
            <div className="text-[10px] font-mono text-gray-500 tracking-wider">Workspace / Project_A / main</div>
          </div>
          {/* Content */}
          <div className="p-6 font-mono text-[12px]">
            <p className="text-[#8B5CF6] font-bold mb-4 text-[10px] uppercase tracking-widest">Pending Tasks</p>
            <div className="bg-[#0e0e10] border border-white/5 rounded-lg p-3 mb-4 flex items-center gap-3">
              <div className="w-4 h-4 rounded border border-gray-600"></div>
              <span className="text-gray-300">Refactor Distributed Locks in Go</span>
            </div>
            <div className="bg-[#0e0e10] border border-white/5 rounded-lg p-3 mb-8 flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-[#abc4ff] flex items-center justify-center"><CheckCircle2 size={12} className="text-black" /></div>
              <span className="text-gray-500 line-through">Review 'Quantum Superiority' draft</span>
            </div>

            <p className="text-[#8B5CF6] font-bold mb-4 text-[10px] uppercase tracking-widest">Draft Notes</p>
            <div className="bg-[#0e0e10] border border-white/5 rounded-lg p-4">
              <span className="text-pink-400">#</span> <span className="text-white font-bold">Arch Notes</span><br/>
              <span className="text-gray-500">- Implement 2PC for cross-shard ops</span><br/>
              <span className="text-gray-500">- TTL for ephemeral cache: 300s</span>
            </div>
          </div>
        </div>
      </section>

      {/* Latest from the Forge */}
      <section className="max-w-[1200px] mx-auto px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Latest from the Forge</h2>
            <p className="text-gray-500 text-sm">Stay ahead with deep-dives and structured paths.</p>
          </div>
          <Link to="/blog" className="hidden sm:flex items-center gap-2 text-[12px] font-bold text-[#abc4ff] hover:underline uppercase tracking-wide">
            View All Content <ExternalLink size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Big Blog Card */}
          <div className="lg:col-span-2 bg-[#131315] border border-white/5 rounded-2xl overflow-hidden flex flex-col md:flex-row cursor-pointer hover:border-white/10 transition-colors group">
            <div className="w-full md:w-[45%] h-[240px] md:h-auto relative overflow-hidden bg-[#0e0e10]">
              <img 
                src="https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=800" 
                alt="Quantum" 
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="w-full md:w-[55%] p-8 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4 text-[10px] font-bold uppercase tracking-widest">
                <span className="text-[#abc4ff] bg-[#1a233a] px-2 py-0.5 rounded">Blog Post</span>
                <span className="text-gray-500">12 min read</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-[#abc4ff] transition-colors">
                Quantum Superiority: The Reality of Noisy Intermediate-Scale Quantum Computers
              </h3>
              <p className="text-sm text-gray-400 mb-6 line-clamp-2">
                A technical analysis of current NISQ limitations and the road to fault-tolerance.
              </p>
              <div className="flex items-center gap-3 mt-auto">
                <div className="w-8 h-8 rounded-full bg-[#1e2336] border border-white/10 flex items-center justify-center text-gray-500 text-xs">HV</div>
                <span className="text-sm font-medium text-gray-300">Dr. Helena Vance</span>
              </div>
            </div>
          </div>

          {/* Side Track Card */}
          <div className="lg:col-span-1 bg-[#131315] border border-white/5 rounded-2xl p-8 flex flex-col cursor-pointer hover:border-white/10 transition-colors group">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-[16px] text-gray-500">route</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Track</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-3 group-hover:text-[#abc4ff] transition-colors">Java Master Path</h3>
            <p className="text-sm text-gray-400 mb-auto">From JVM internals to high-throughput Spring Cloud deployments.</p>
            <div className="flex items-center justify-between mt-8">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-gray-700 border border-[#131315]"></div>
                <div className="w-6 h-6 rounded-full bg-gray-600 border border-[#131315]"></div>
                <div className="w-6 h-6 rounded-full bg-gray-500 border border-[#131315]"></div>
              </div>
              <span className="text-[11px] font-medium text-gray-500">2.4k Students</span>
            </div>
          </div>

          {/* Small Track Card */}
          <div className="lg:col-span-1 bg-[#131315] border border-white/5 rounded-2xl p-8 flex flex-col cursor-pointer hover:border-white/10 transition-colors group">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-gray-500 font-mono font-bold text-[14px]">&lt;&gt;</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Track</span>
            </div>
            <h3 className="text-md font-bold text-white mb-2 group-hover:text-[#abc4ff] transition-colors">Data Structures & Algorithms</h3>
            <p className="text-sm text-gray-400 mb-auto">A rigorous mathematical approach to optimization.</p>
            <div className="flex items-center gap-2 mt-8 text-[11px] font-medium text-gray-500">
              <span className="material-symbols-outlined text-[14px]">bar_chart</span> Level: Advanced
            </div>
          </div>

          {/* Newsletter Box */}
          <div className="lg:col-span-2 bg-[#abc4ff] rounded-2xl p-8 relative overflow-hidden flex flex-col justify-center">
            <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 opacity-20 pointer-events-none">
              <span className="material-symbols-outlined text-[200px] text-[#0a0a0a]">mail</span>
            </div>
            <div className="relative z-10 max-w-sm">
              <h3 className="text-2xl font-bold text-[#0a0a0a] mb-2 tracking-tight">Join the Dispatch</h3>
              <p className="text-sm text-[#0a0a0a]/70 mb-6">Weekly technical reports on the state of engineering delivered to your inbox.</p>
              <form className="flex bg-[#0a0a0a]/5 rounded-lg p-1 border border-[#0a0a0a]/10">
                <input 
                  type="email" 
                  placeholder="engineer@domain.com" 
                  className="bg-transparent border-none outline-none px-3 text-sm flex-1 text-[#0a0a0a] placeholder-[#0a0a0a]/40"
                />
                <button className="bg-[#0a0a0a] text-white px-4 py-1.5 rounded-md text-sm font-bold hover:bg-[#1f2937] transition-colors">
                  Join
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
