import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, ChevronRight, Map, FileSpreadsheet } from 'lucide-react';
import { CardGridSkeleton } from '../../core/components/ui/Skeleton';
import { contentApi } from '../../../api/content';

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

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-20"><CardGridSkeleton count={4} /></div>;

  if (error || !subject) {
    return <div className="max-w-5xl mx-auto px-4 py-20 text-center" style={{ color: 'var(--text-muted)' }}>{error || 'Not found.'}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2 glow-title" style={{ color: subject.color }}>{subject.name}</h1>
        <p style={{ color: 'var(--text-muted)' }}>{subject.description}</p>

        <div className="flex flex-wrap gap-3 mt-5">
          {subject.hasRoadmap && (
            <button
              className="flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-lg border btn-press"
              style={{ borderColor: 'var(--border)' }}
            >
              <Map size={14} /> Roadmap
            </button>
          )}
          {subject.hasCheatsheet && (
            <button
              className="flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-lg border btn-press"
              style={{ borderColor: 'var(--border)' }}
            >
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
            className="flex items-center justify-between gap-4 p-5 rounded-xl border card-hover"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 mb-1.5">
                <h3 className="font-semibold truncate">{topic.name}</h3>
                <span
                  className="text-[10px] font-mono-display uppercase px-2 py-0.5 rounded-full shrink-0"
                  style={{ backgroundColor: `${DIFFICULTY_COLOR[topic.difficulty]}1A`, color: DIFFICULTY_COLOR[topic.difficulty] }}
                >
                  {topic.difficulty}
                </span>
              </div>
              <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>{topic.description}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Clock size={13} /> {topic.estimatedMinutes}m
              </div>
              <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SubjectPage;
