import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, ChevronRight, Map, FileSpreadsheet } from 'lucide-react';
import { CardGridSkeleton } from '../../core/components/ui/Skeleton';
import { contentApi } from '../api/content';

const DIFFICULTY_COLOR = {
  beginner: '#5EEAD4',
  intermediate: '#FFB454',
  advanced: '#F87171',
};

const SubjectPage = () => {
  const { subjectSlug } = useParams();
  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    contentApi
      .getSubjectBySlug(subjectSlug)
      .then(({ data }) => {
        setSubject(data.subject);
        setTopics(data.topics);
        setError(null);
      })
      .catch(() => setError('Subject not found.'))
      .finally(() => setLoading(false));
  }, [subjectSlug]);

  if (loading) return <div className="min-h-screen bg-[#0A0A0A] max-w-5xl mx-auto px-4 py-20"><CardGridSkeleton count={4} /></div>;

  if (error || !subject) {
    return <div className="min-h-screen bg-[#0A0A0A] max-w-5xl mx-auto px-4 py-20 text-center text-[#8B949E]">{error || 'Not found.'}</div>;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0A0A0A] relative text-white w-full">
      {/* Subtle Background Grid Pattern matching the mockup */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2D3342 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.3 }} />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="mb-10">
          <h1 className="text-[32px] font-bold mb-3 tracking-tight" style={{ color: subject.color }}>{subject.name}</h1>
          <p className="text-[15px] text-[#C9D1D9] font-medium tracking-wide">{subject.description}</p>

          <div className="flex flex-wrap gap-3 mt-6">
            {subject.hasRoadmap && (
              <button className="flex items-center gap-2 text-[13px] font-medium px-4 py-2 rounded-lg border border-[#2D3342] text-[#C9D1D9] hover:text-white hover:bg-[#161B22] transition-colors bg-[#0E1015]">
                <Map size={14} /> Roadmap
              </button>
            )}
            {subject.hasCheatsheet && (
              <button className="flex items-center gap-2 text-[13px] font-medium px-4 py-2 rounded-lg border border-[#2D3342] text-[#C9D1D9] hover:text-white hover:bg-[#161B22] transition-colors bg-[#0E1015]">
                <FileSpreadsheet size={14} /> Cheatsheet
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {topics.map((topic) => (
            <Link
              key={topic._id}
              to={`/learn/${subjectSlug}/${topic.slug}`}
              state={{ topicId: topic._id }}
              className="group flex items-center justify-between gap-6 px-6 py-5 rounded-xl border border-[#2D3342] bg-[#0E1015] hover:border-[#4C5363] hover:bg-[#161B22] transition-all shadow-sm"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 mb-1.5">
                  <h3 className="text-[15px] font-bold text-white group-hover:text-[#4375FF] transition-colors truncate">{topic.name}</h3>
                  <span
                    className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 border"
                    style={{ 
                      backgroundColor: `${DIFFICULTY_COLOR[topic.difficulty]}1A`, 
                      color: DIFFICULTY_COLOR[topic.difficulty],
                      borderColor: `${DIFFICULTY_COLOR[topic.difficulty]}33`
                    }}
                  >
                    {topic.difficulty}
                  </span>
                </div>
                <p className="text-[13px] text-[#8B949E] truncate leading-relaxed">{topic.description}</p>
              </div>
              
              <div className="flex items-center gap-6 shrink-0 pl-4">
                <div className="flex items-center gap-1.5 text-[13px] font-mono text-[#8B949E]">
                  <Clock size={14} /> {topic.estimatedMinutes}m
                </div>
                <ChevronRight size={16} className="text-[#4C5363] group-hover:text-white transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubjectPage;
