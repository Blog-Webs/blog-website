import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, BookOpen, Star } from 'lucide-react';

const Home = () => {
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

      <div className="relative z-10 pt-32 pb-16">
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
                <span className="truncate">httptechnex.dev/docs/system-design/caching</span>
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
                  <span className="text-sm font-semibold text-white">System Design</span>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2.5">Fundamentals</h4>
                    <ul className="space-y-1.5">
                      {['Introduction', 'Scalability'].map((item) => (
                        <li key={item} className="flex items-center gap-2 text-xs text-gray-400 py-1 hover:text-white cursor-pointer transition-colors">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                          {item}
                        </li>
                      ))}
                      <li className="flex items-center gap-2 text-xs text-white py-1 px-2.5 bg-[#4F46E5]/15 border border-[#4F46E5]/30 rounded-lg font-medium cursor-pointer shadow-[0_0_15px_rgba(79,70,229,0.15)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#818CF8]"></span>
                        Caching Strategies
                      </li>
                      {['Load Balancing', 'Database Design'].map((item) => (
                        <li key={item} className="flex items-center gap-2 text-xs text-gray-400 py-1 hover:text-white cursor-pointer transition-colors">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2.5">Advanced</h4>
                    <ul className="space-y-1.5">
                      {['Consistent Hashing', 'Message Queues', 'CDN Architecture', 'Rate Limiting'].map((item) => (
                        <li key={item} className="flex items-center gap-2 text-xs text-gray-400 py-1 hover:text-white cursor-pointer transition-colors">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2.5">Case Studies</h4>
                    <ul className="space-y-1.5">
                      {['Design Twitter', 'Design YouTube'].map((item) => (
                        <li key={item} className="flex items-center gap-2 text-xs text-gray-400 py-1 hover:text-white cursor-pointer transition-colors">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </aside>

              {/* Main Content Pane */}
              <div className="flex-1 p-6 md:p-8 bg-[#090D18] flex flex-col justify-between overflow-x-hidden">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[11px] font-mono text-gray-400">CacheService.java</span>
                  </div>

                  {/* Code Editor Mock */}
                  <div className="bg-[#05070D] border border-gray-800 rounded-xl p-5 mb-8 font-mono text-xs text-gray-300 leading-relaxed shadow-inner overflow-x-auto whitespace-pre">
                    <div className="text-gray-500">// 1. Check cache first</div>
                    <div>
                      <span className="text-pink-500">User</span> cached = cache.<span className="text-blue-400">get</span>(userId);
                    </div>
                    <div className="mt-1">
                      <span className="text-purple-400">if</span> (cached != <span className="text-yellow-500">null</span>) &#123;
                    </div>
                    <div className="pl-4 mt-1">
                      <span className="text-purple-400">return</span> cached; <span className="text-gray-500">// Cache HIT</span>
                    </div>
                    <div className="mt-1">&#125;</div>
                    
                    <div className="text-gray-500 mt-4">// 2. Cache MISS - load from DB</div>
                    <div className="mt-1">
                      <span className="text-pink-500">User</span> user = db.<span className="text-blue-400">findById</span>(userId);
                    </div>
                    <div className="mt-1">
                      cache.<span className="text-blue-400">set</span>(userId, user, TTL.<span className="text-amber-500">30_MIN</span>);
                    </div>
                    <div className="mt-1">
                      <span className="text-purple-400">return</span> user;
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-4">
                    Cache Invalidation Strategies
                  </h3>

                  {/* Strategy Table */}
                  <div className="border border-gray-800 rounded-xl overflow-hidden bg-[#070A12] text-xs">
                    <div className="grid grid-cols-3 bg-[#0B0F19] p-3 text-gray-400 font-semibold border-b border-gray-800">
                      <div>Strategy</div>
                      <div>Use Case</div>
                      <div>Consistency</div>
                    </div>
                    <div className="divide-y divide-gray-800">
                      {[
                        { strategy: 'TTL-based', useCase: 'Read-heavy data', consistency: 'Eventual', badgeColor: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
                        { strategy: 'Write-through', useCase: 'Write-heavy workloads', consistency: 'Strong', badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
                        { strategy: 'Event-driven', useCase: 'Microservices', consistency: 'Near-strong', badgeColor: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' },
                      ].map((row) => (
                        <div key={row.strategy} className="grid grid-cols-3 p-3 text-gray-300 items-center">
                          <div className="font-semibold text-white">{row.strategy}</div>
                          <div>{row.useCase}</div>
                          <div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${row.badgeColor}`}>
                              {row.consistency}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Sidebar - TOC */}
              <aside className="w-full lg:w-[200px] border-l border-gray-800 p-5 bg-[#080B14] flex flex-col justify-between flex-shrink-0">
                <div>
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4">On This Page</h4>
                  <ul className="space-y-2.5 text-[11px]">
                    <li className="text-[#818CF8] font-medium cursor-pointer hover:text-white transition-colors">
                      Cache-Aside Pattern
                    </li>
                    {['Write-Through', 'Write-Behind', 'Async flushing', 'Invalidation Strategies', 'TTL-based', 'Event-driven', 'Redis vs Memcached', 'Best Practices', 'Interview Tips'].map((item) => (
                      <li key={item} className="text-gray-500 cursor-pointer hover:text-gray-300 transition-colors">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-[10px] text-gray-600 mt-8 border-t border-[#1a1a1a] pt-4">
                  Last updated<br />
                  <span className="text-gray-400 font-medium">Jan 14, 2025</span>
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
