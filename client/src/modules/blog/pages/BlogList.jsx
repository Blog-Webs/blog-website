import { Link } from 'react-router-dom';

const BlogList = () => {
  return (
    <div className="pt-24 pb-16 px-gutter max-w-max-width mx-auto">
      {/* Hero Section */}
      <section className="relative h-[614px] md:h-[716px] rounded-2xl overflow-hidden mb-16 border border-outline-variant/30 shadow-2xl">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=1200')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
          <div className="glass max-w-[42rem] p-8 rounded-xl space-y-4">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-label-sm rounded-full tracking-wider font-bold">FEATURED STORY</span>
            <Link to="/blog/the-quantum-shift">
              <h1 className="font-display text-headline-lg-mobile md:text-display text-on-surface leading-tight hover:text-primary transition-colors">
                The Quantum Shift: How Generative AI is Rewriting the Developer Workflow
              </h1>
            </Link>
            <p className="text-on-surface-variant font-body-lg line-clamp-2">Explore the intersection of LLMs and traditional software engineering as we dive into the next decade of automated cognition.</p>
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-3">
                <img className="w-10 h-10 rounded-full border border-primary object-cover" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100" alt="Alex Rivera" />
                <span className="font-medium text-on-surface">Alex Rivera</span>
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">schedule</span>
                <span className="text-label-sm">12 MIN READ</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Blog Grid (8 cols) */}
        <div className="lg:col-span-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Blog Card 1 */}
            <article className="flex flex-col bg-surface-container-low border border-outline-variant/20 rounded-xl overflow-hidden card-glow transition-all duration-300">
              <div className="h-48 w-full overflow-hidden bg-surface-container relative">
                <img className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" src="https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&q=80&w=800" alt="Cover" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-tertiary/10 text-tertiary px-2 py-0.5 rounded text-label-sm font-bold">DEVOPS</span>
                  <span className="text-on-surface-variant text-label-sm uppercase font-bold">5 Min Read</span>
                </div>
                <Link to="/blog/scaling-kubernetes">
                  <h3 className="font-headline-md text-on-surface mb-3 hover:text-primary transition-colors cursor-pointer">The Invisible Infrastructure: Scaling Kubernetes in 2024</h3>
                </Link>
                <p className="text-on-surface-variant font-body-md line-clamp-3 mb-6">A deep dive into zero-trust networking and auto-scaling patterns for global enterprise clusters.</p>
                <div className="mt-auto flex items-center gap-3 border-t border-outline-variant/20 pt-4">
                  <img className="w-8 h-8 rounded-full object-cover" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100" alt="Marcus Chen" />
                  <span className="text-label-sm font-medium">Marcus Chen</span>
                </div>
              </div>
            </article>

            {/* Blog Card 2 */}
            <article className="flex flex-col bg-surface-container-low border border-outline-variant/20 rounded-xl overflow-hidden card-glow transition-all duration-300">
              <div className="h-48 w-full overflow-hidden bg-surface-container relative">
                <img className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" src="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800" alt="Cover" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-label-sm font-bold">AI/ML</span>
                  <span className="text-on-surface-variant text-label-sm uppercase font-bold">8 Min Read</span>
                </div>
                <Link to="/blog/fine-tuning-llms">
                  <h3 className="font-headline-md text-on-surface mb-3 hover:text-primary transition-colors cursor-pointer">Fine-tuning LLMs for Proprietary Codebases</h3>
                </Link>
                <p className="text-on-surface-variant font-body-md line-clamp-3 mb-6">Techniques for creating internal AI assistants that understand your specific architectural patterns.</p>
                <div className="mt-auto flex items-center gap-3 border-t border-outline-variant/20 pt-4">
                  <img className="w-8 h-8 rounded-full object-cover" src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100" alt="Sarah Jenkins" />
                  <span className="text-label-sm font-medium">Sarah Jenkins</span>
                </div>
              </div>
            </article>

            {/* Blog Card 3 */}
            <article className="flex flex-col bg-surface-container-low border border-outline-variant/20 rounded-xl overflow-hidden card-glow transition-all duration-300">
              <div className="h-48 w-full overflow-hidden bg-surface-container relative">
                <img className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800" alt="Cover" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded text-label-sm font-bold">FRONTEND</span>
                  <span className="text-on-surface-variant text-label-sm uppercase font-bold">4 Min Read</span>
                </div>
                <Link to="/blog/mastering-glassmorphism">
                  <h3 className="font-headline-md text-on-surface mb-3 hover:text-primary transition-colors cursor-pointer">Mastering the Glassmorphism Aesthetic</h3>
                </Link>
                <p className="text-on-surface-variant font-body-md line-clamp-3 mb-6">Balancing accessibility and visual depth with modern CSS backdrop-filter techniques.</p>
                <div className="mt-auto flex items-center gap-3 border-t border-outline-variant/20 pt-4">
                  <img className="w-8 h-8 rounded-full object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" alt="David Vo" />
                  <span className="text-label-sm font-medium">David Vo</span>
                </div>
              </div>
            </article>

            {/* Blog Card 4 */}
            <article className="flex flex-col bg-surface-container-low border border-outline-variant/20 rounded-xl overflow-hidden card-glow transition-all duration-300">
              <div className="h-48 w-full overflow-hidden bg-surface-container relative">
                <img className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800" alt="Cover" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-error/10 text-error px-2 py-0.5 rounded text-label-sm font-bold">SECURITY</span>
                  <span className="text-on-surface-variant text-label-sm uppercase font-bold">10 Min Read</span>
                </div>
                <Link to="/blog/post-quantum-cryptography">
                  <h3 className="font-headline-md text-on-surface mb-3 hover:text-primary transition-colors cursor-pointer">Post-Quantum Cryptography: Preparing Today</h3>
                </Link>
                <p className="text-on-surface-variant font-body-md line-clamp-3 mb-6">Why developers should start worrying about the impact of quantum computing on modern encryption.</p>
                <div className="mt-auto flex items-center gap-3 border-t border-outline-variant/20 pt-4">
                  <img className="w-8 h-8 rounded-full object-cover" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100" alt="Elena Thorne" />
                  <span className="text-label-sm font-medium">Elena Thorne</span>
                </div>
              </div>
            </article>
          </div>

          <button className="w-full py-4 glass text-primary font-bold rounded-xl hover:bg-primary/10 transition-colors uppercase tracking-widest text-label-sm">Load More Insights</button>
        </div>

        {/* Sidebar (4 cols) */}
        <aside className="lg:col-span-4 space-y-12">
          {/* Trending Topics */}
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-8">
            <h4 className="font-headline-md text-on-surface mb-6 border-l-4 border-primary pl-4">Trending Topics</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between group cursor-pointer">
                <span className="text-on-surface-variant group-hover:text-primary transition-colors">#GenerativeAI</span>
                <span className="bg-surface-container-highest px-2 py-0.5 rounded text-label-sm text-outline">128</span>
              </div>
              <div className="flex items-center justify-between group cursor-pointer">
                <span className="text-on-surface-variant group-hover:text-primary transition-colors">#RustLang</span>
                <span className="bg-surface-container-highest px-2 py-0.5 rounded text-label-sm text-outline">84</span>
              </div>
              <div className="flex items-center justify-between group cursor-pointer">
                <span className="text-on-surface-variant group-hover:text-primary transition-colors">#EdgeComputing</span>
                <span className="bg-surface-container-highest px-2 py-0.5 rounded text-label-sm text-outline">56</span>
              </div>
              <div className="flex items-center justify-between group cursor-pointer">
                <span className="text-on-surface-variant group-hover:text-primary transition-colors">#PromptEng</span>
                <span className="bg-surface-container-highest px-2 py-0.5 rounded text-label-sm text-outline">43</span>
              </div>
              <div className="flex items-center justify-between group cursor-pointer">
                <span className="text-on-surface-variant group-hover:text-primary transition-colors">#Wasm</span>
                <span className="bg-surface-container-highest px-2 py-0.5 rounded text-label-sm text-outline">21</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="glass p-8 rounded-xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
            <h4 className="font-headline-md text-on-surface mb-3 relative z-10">The TechNex Dispatch</h4>
            <p className="text-on-surface-variant mb-6 relative z-10">Weekly deep-dives into the future of computing. No fluff, just engineering excellence.</p>
            <form className="space-y-4 relative z-10" onSubmit={(e) => { e.preventDefault(); alert('Subscribed!'); }}>
              <input 
                className="w-full bg-background border border-outline-variant/30 rounded-lg px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all outline-none text-on-surface placeholder:text-outline/50" 
                placeholder="dev@work.com" 
                type="email" 
              />
              <button 
                className="w-full bg-primary text-on-primary font-bold py-3 rounded-lg hover:brightness-110 active:scale-[0.98] transition-all" 
                type="submit"
              >
                SUBSCRIBE NOW
              </button>
            </form>
            <p className="text-[10px] text-outline mt-4 opacity-50 uppercase tracking-tighter">Zero spam. unsubscribe anytime.</p>
          </div>

          {/* Ad/Promo Space */}
          <div className="relative rounded-xl overflow-hidden aspect-[4/5] border border-outline-variant/20">
            <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800" alt="Promo" />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent flex flex-col justify-end p-8">
              <h5 className="text-headline-md font-bold mb-2">Master Cloud Architecture</h5>
              <p className="text-label-sm text-primary font-bold uppercase mb-4">Enroll in Pro Workspace</p>
              <button className="bg-on-surface text-background font-bold py-2 rounded-lg text-label-sm hover:bg-white transition-colors">LEARN MORE</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BlogList;
