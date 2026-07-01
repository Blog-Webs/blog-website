import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, FileText, TrendingUp, HelpCircle, Layers, ArrowRight, Clock } from 'lucide-react';
import SortVisualizer from '../components/home/SortVisualizer';
import SubjectCard from '../components/home/SubjectCard';
import SearchBar from '../components/home/SearchBar';
import ContactModal from '../components/home/ContactModal';
import { contentApi } from '../api/content';
import { seriesApi } from '../api/series';
import { useLiveUserCount } from '../hooks/useLiveUserCount';

/* Spawns a CSS water-ripple dot at the click position on the card */
const useWaterRipple = () => {
  const createRipple = useCallback((e) => {
    const card = e.currentTarget;
    const container = card.querySelector('.ripple-container');
    if (!container) return;

    const rect = card.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.4;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'water-ripple';
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
    container.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  }, []);

  return createRipple;
};

const SeriesCard = ({ series }) => {
  const createRipple = useWaterRipple();
  const hasMultiplePosts = (series.postCount || 0) >= 2;

  return (
    <Link
      to={`/series/${series.slug}`}
      className={`series-card group block p-6 rounded-2xl border${hasMultiplePosts ? ' series-card' : ''}`}
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onClick={createRipple}
    >
      {/* Ripple layer */}
      <div className="ripple-container" />

      {/* Content sits above ripple/blobs */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Series icon */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 shrink-0"
          style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
        >
          <Layers size={20} />
        </div>

        {/* Badge */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-[10px] font-mono-display uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
          >
            Series
          </span>
          {hasMultiplePosts && (
            <span
              className="text-[10px] font-mono-display px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'rgba(94,234,212,0.1)', color: '#5EEAD4' }}
            >
              {series.postCount} parts
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold mb-1.5 leading-snug">{series.title}</h3>

        {series.description && (
          <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
            {series.description}
          </p>
        )}

        <div
          className="flex items-center gap-1 text-sm font-medium mt-auto"
          style={{ color: 'var(--accent)' }}
        >
          Read series
          <ArrowRight
            size={14}
            className="transition-transform group-hover:translate-x-1"
          />
        </div>
      </div>
    </Link>
  );
};

const Home = () => {
  const [subjects, setSubjects] = useState([]);
  const [seriesList, setSeriesList] = useState([]);
  const [helpOpen, setHelpOpen] = useState(false);
  const liveCount = useLiveUserCount();

  useEffect(() => {
    contentApi.getSubjects().then(({ data }) => setSubjects(data.subjects)).catch(() => {});
    seriesApi.getAll().then(({ data }) => setSeriesList(data.series || [])).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <div
            className="inline-flex items-center gap-1.5 text-xs font-mono-display px-3 py-1.5 rounded-full border mb-5"
            style={{ borderColor: 'var(--border)', color: 'var(--accent)' }}
          >
            <Users size={13} /> {liveCount} learning right now
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-5 glow-title">
            Learn DSA, Java &amp; Aptitude<br />
            <span style={{ color: 'var(--accent)' }}>the way it should be taught, with Tanish</span>
          </h1>
          <p className="text-lg mb-8" style={{ color: 'var(--text-muted)' }}>
            Visual algorithm walkthroughs, structured roadmaps, and chapter by chapter tracking 
            built for engineers actually preparing for interviews, not just browsing tutorials.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/learn/dsa"
              className="px-5 py-3 rounded-xl font-semibold text-sm btn-press"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
            >
              Start with DSA
            </Link>
            <Link
              to="/blog"
              className="px-5 py-3 rounded-xl font-semibold text-sm border btn-press"
              style={{ borderColor: 'var(--border)' }}
            >
              Read the blog
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-mono-display mb-3" style={{ color: 'var(--text-muted)' }}>
            // live bubble sort visualization
          </p>
          <SortVisualizer />
        </div>
      </section>

      {/* Search + Help */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-4">
        <div className="flex items-center gap-3">
          <SearchBar />
          <button
            onClick={() => setHelpOpen(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium shrink-0 btn-press"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
          >
            <HelpCircle size={16} style={{ color: 'var(--accent)' }} />
            <span className="hidden sm:inline">Help</span>
          </button>
        </div>
      </section>

      {helpOpen && <ContactModal onClose={() => setHelpOpen(false)} />}

      {/* Stats bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div
          className="rounded-2xl border grid grid-cols-2 sm:grid-cols-4 divide-x"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
        >
          {[
            { icon: Users, label: 'Online now', value: liveCount },
            { icon: BookOpen, label: 'Subjects', value: subjects.length || '3' },
            { icon: FileText, label: 'Free chapters', value: '12+' },
            { icon: TrendingUp, label: 'Growing weekly', value: 'Always' },
          ].map(({ icon: Icon, label, value }, i) => (
            <div key={i} className="px-4 py-6 text-center transition-colors duration-200 hover:bg-[var(--accent-soft)]" style={{ borderColor: 'var(--border)' }}>
              <Icon size={18} className="mx-auto mb-2" style={{ color: 'var(--accent)' }} />
              <p className="text-xl font-bold font-mono-display">{value}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Subjects */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-2xl font-bold mb-2 glow-title">Pick a track</h2>
        <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
          Every topic separates theory (Deep Analysis) from practice patterns (Data Research).
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((s) => (
            <SubjectCard key={s._id} subject={s} />
          ))}
        </div>
      </section>

      {/* Blog Series Section */}
      {seriesList.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          {/* Section header */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs font-mono-display uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>
                // curated reading paths
              </p>
              <h2 className="text-2xl font-bold glow-title">Blog Series</h2>
            </div>
            <Link
              to="/blog"
              className="flex items-center gap-1.5 text-sm font-medium border px-3.5 py-2 rounded-xl btn-press"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              All posts <ArrowRight size={14} />
            </Link>
          </div>
          <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
            Multi-part deep dives — each series takes you from zero to expert on one concept.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {seriesList.map((s) => (
              <SeriesCard key={s._id} series={s} />
            ))}
          </div>
        </section>
      )}

      {/* Integrations note */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div
          className="rounded-2xl border p-8 text-center"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
        >
          <p className="text-sm font-mono-display mb-2" style={{ color: 'var(--accent)' }}>references &amp; further reading</p>
          <p className="max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            Every chapter created by Tanish self learning for deeper practice sets, and our Blog reads are like to understand the 
            concept from Scratch to Mastery. No doubt left. for revision this platform is Best.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
