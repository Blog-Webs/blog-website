import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Binary, 
  Coffee, 
  Calculator, 
  Network, 
  Database, 
  Cpu, 
  Globe, 
  Layers, 
  BookOpen, 
  Bolt, 
  Brain, 
  Code2, 
  Settings, 
  Cloud 
} from 'lucide-react';

const ICONS = {
  'binary-tree': Binary,
  'coffee': Coffee,
  'local_cafe': Coffee,
  'calculator': Calculator,
  'network': Network,
  'database': Database,
  'cpu': Cpu,
  'globe': Globe,
  'layers': Layers,
  'bolt': Bolt,
  'psychology': Brain,
  'account_tree': Layers,
  'code_blocks': Code2,
  'javascript': Globe,
  'cloud': Cloud,
  'settings': Settings,
  'book': BookOpen
};
import { contentApi } from '../api/content';

const LearnHome = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contentApi.getSubjects()
      .then(({ data }) => {
        setSubjects(data.subjects || []);
      })
      .catch((err) => {
        console.error('Failed to fetch subjects:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="w-full bg-[#0E1015] min-h-screen">
      <div className="pt-20 pb-32 px-6 max-w-[1280px] mx-auto w-full">
        {/* Header */}
        <section className="flex flex-col items-center text-center px-4 mb-16 w-full">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Master the Modern Tech Stack
          </h1>
          <p className="text-[#8B949E] text-[17px] leading-relaxed mb-8 max-w-[600px]">
            From enterprise backends to generative AI, explore curated learning paths designed by industry experts to accelerate your engineering career.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <div className="px-5 py-2 rounded-full bg-[#3B82F6] text-white text-xs font-bold tracking-wide">
              8 LEARNING DOMAINS
            </div>
            <div className="px-5 py-2 rounded-full bg-[#8B5CF6] text-white text-xs font-bold tracking-wide">
              300+ EXPERT COURSES
            </div>
          </div>
        </section>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-24 w-full">
        {loading ? (
          // Display loading skeletons while database is loading
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-[#161B22] border border-[#2D3342] rounded-2xl p-6 h-[220px] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-white/5 rounded-xl mb-6" />
                <div className="h-4 bg-white/5 rounded w-2/3 mb-3" />
                <div className="h-3 bg-white/5 rounded w-full mb-2" />
                <div className="h-3 bg-white/5 rounded w-4/5" />
              </div>
              <div className="h-3 bg-white/5 rounded w-full pt-5 border-t border-[#2D3342]" />
            </div>
          ))
        ) : subjects.length > 0 ? (
          subjects.map((subject) => {
            const linkPath = `/learn/${subject.slug}`;
            const title = subject.name;
            const desc = subject.description;
            const accentColor = subject.color || '#3B82F6';
            const IconComponent = ICONS[subject.icon] || BookOpen;

            return (
              <Link 
                key={subject._id} 
                to={linkPath}
                className="flex flex-col bg-[#161B22] border border-[#2D3342] rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 group text-left"
                style={{ borderColor: '#2D3342' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = accentColor; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2D3342'; }}
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: `${accentColor}1A` }}
                >
                  <IconComponent size={24} style={{ color: accentColor }} />
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-3">
                  {title}
                </h3>
                
                <p className="text-[#8B949E] text-[13px] leading-[1.6] mb-8 flex-grow">
                  {desc}
                </p>

                <div className="flex items-center justify-between mt-auto pt-5 text-[11px] text-[#8B949E] border-t border-[#2D3342]">
                  <span>Full Roadmap</span>
                  <span>Interactive Chapters</span>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 text-[#8B949E]">
            No subjects found. Please seed the database.
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="bg-[#1C202B] border border-[#2D3342] rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-10 w-full">
        <div className="flex-1 w-full max-w-[600px]">
          <h2 className="text-3xl font-bold text-white mb-4">
            Can't decide where to start?
          </h2>
          <p className="text-[#8B949E] text-[15px] leading-relaxed mb-8 max-w-[500px]">
            Take our personalized skills assessment to get a custom learning roadmap tailored to your experience level and career goals.
          </p>
          <button className="flex items-center gap-2 px-6 py-3 bg-[#a5b4fc] text-[#1e1b4b] font-semibold rounded-xl hover:bg-[#c7d2fe] transition-colors">
            Start Assessment
            <ArrowRight size={18} />
          </button>
        </div>
        <div className="w-full md:w-[350px] h-[250px] bg-[#2D3342] rounded-2xl flex items-center justify-center flex-shrink-0">
           <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
             <circle cx="6" cy="19" r="3" />
             <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
             <circle cx="18" cy="5" r="3" />
           </svg>
        </div>
      </div>
      </div>
    </div>
  );
};

export default LearnHome;
