import { Link } from 'react-router-dom';
import { Send, BookOpen, Star } from 'lucide-react';

const Home = () => {
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
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1e1b4b]/60 border border-[#312e81] mb-10 shadow-[0_0_15px_rgba(49,46,129,0.5)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA]"></span>
            <span className="text-[11px] text-[#818CF8] font-medium tracking-wide">The Developer Knowledge Platform</span>
          </div>

          <h1 className="text-[56px] md:text-[84px] font-extrabold text-white leading-[1.05] tracking-tight mb-8">
            Master Modern <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#818CF8] via-[#60A5FA] to-[#06B6D4]">
              Engineering
            </span> at <br />
            Depth
          </h1>

          <p className="text-[#9ca3af] text-[17px] md:text-[19px] max-w-[600px] mb-12 leading-[1.6]">
            Structured learning paths, in-depth documentation, and expert articles for software engineers who demand precision.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
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
            <div className="bg-[#121212] border border-[#222] rounded-2xl p-7 flex flex-col justify-center hover:border-[#333] transition-colors">
              <h3 className="text-4xl font-extrabold text-white mb-2 tracking-tight">12K+</h3>
              <p className="text-[13px] text-gray-400 font-medium tracking-wide">Articles Published</p>
            </div>
            
            <div className="bg-[#121212] border border-[#222] rounded-2xl p-7 flex flex-col justify-center hover:border-[#333] transition-colors">
              <h3 className="text-4xl font-extrabold text-white mb-2 tracking-tight">340+</h3>
              <p className="text-[13px] text-gray-400 font-medium tracking-wide">Learning Paths</p>
            </div>
            
            <div className="bg-[#121212] border border-[#222] rounded-2xl p-7 flex flex-col justify-center hover:border-[#333] transition-colors">
              <h3 className="text-4xl font-extrabold text-white mb-2 tracking-tight">98K+</h3>
              <p className="text-[13px] text-gray-400 font-medium tracking-wide">Active Learners</p>
            </div>
            
            <div className="bg-[#121212] border border-[#222] rounded-2xl p-7 flex flex-col justify-center hover:border-[#333] transition-colors">
              <h3 className="text-4xl font-extrabold text-white mb-2 tracking-tight flex items-center gap-3">
                4.9 <Star className="text-yellow-500 mb-1" fill="currentColor" size={26} strokeWidth={1} />
              </h3>
              <p className="text-[13px] text-gray-400 font-medium tracking-wide">Community Rating</p>
            </div>
          </div>
        </section>

        {/* Trusted Technologies */}
        <section className="mt-32 pb-10 border-t border-[#1a1a1a] pt-16">
          <p className="text-center text-[10px] font-bold text-gray-600 uppercase tracking-[0.25em] mb-12">
            Trusted Technologies We Cover
          </p>
          
          <div className="flex flex-wrap justify-center gap-x-16 gap-y-10 max-w-[1000px] mx-auto px-6 opacity-60">
             <div className="flex flex-col items-center gap-4 hover:opacity-100 hover:-translate-y-1 transition-all duration-300">
               <span className="material-symbols-outlined text-[40px] text-gray-400" style={{ fontVariationSettings: "'FILL' 1" }}>local_cafe</span>
               <span className="text-[10px] text-gray-500 font-bold tracking-widest">JAVA</span>
             </div>
             
             <div className="flex flex-col items-center gap-4 hover:opacity-100 hover:-translate-y-1 transition-all duration-300">
               <span className="material-symbols-outlined text-[40px] text-gray-400" style={{ fontVariationSettings: "'FILL' 1" }}>dataset</span>
               <span className="text-[10px] text-gray-500 font-bold tracking-widest">REACT</span>
             </div>
             
             <div className="flex flex-col items-center gap-4 hover:opacity-100 hover:-translate-y-1 transition-all duration-300">
               <span className="material-symbols-outlined text-[40px] text-gray-400" style={{ fontVariationSettings: "'FILL' 1" }}>javascript</span>
               <span className="text-[10px] text-gray-500 font-bold tracking-widest">NODE.JS</span>
             </div>
             
             <div className="flex flex-col items-center gap-4 hover:opacity-100 hover:-translate-y-1 transition-all duration-300">
               <span className="material-symbols-outlined text-[40px] text-gray-400" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
               <span className="text-[10px] text-gray-500 font-bold tracking-widest">DOCKER</span>
             </div>
             
             <div className="flex flex-col items-center gap-4 hover:opacity-100 hover:-translate-y-1 transition-all duration-300">
               <span className="material-symbols-outlined text-[40px] text-gray-400" style={{ fontVariationSettings: "'FILL' 1" }}>cloud</span>
               <span className="text-[10px] text-gray-500 font-bold tracking-widest">AWS</span>
             </div>
             
             <div className="flex flex-col items-center gap-4 hover:opacity-100 hover:-translate-y-1 transition-all duration-300">
               <span className="material-symbols-outlined text-[40px] text-gray-400" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
               <span className="text-[10px] text-gray-500 font-bold tracking-widest">PYTHON</span>
             </div>
             
             <div className="flex flex-col items-center gap-4 hover:opacity-100 hover:-translate-y-1 transition-all duration-300">
               <span className="material-symbols-outlined text-[40px] text-gray-400" style={{ fontVariationSettings: "'FILL' 1" }}>account_tree</span>
               <span className="text-[10px] text-gray-500 font-bold tracking-widest">GIT</span>
             </div>
             
             <div className="flex flex-col items-center gap-4 hover:opacity-100 hover:-translate-y-1 transition-all duration-300">
               <span className="material-symbols-outlined text-[40px] text-gray-400" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
               <span className="text-[10px] text-gray-500 font-bold tracking-widest">AI / ML</span>
             </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Home;
