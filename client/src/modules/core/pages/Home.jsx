import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, BookOpen, FileText, TrendingUp, HelpCircle, Layers,
  ArrowRight, Clock, Check, StickyNote, ListTodo, Tag, Star, Sparkles
} from 'lucide-react';
import SortVisualizer from '../components/home/SortVisualizer';
import SubjectCard from '../components/home/SubjectCard';
import SearchBar from '../components/home/SearchBar';
import ContactModal from '../components/home/ContactModal';
import { contentApi } from '../../learn/api/content';
import { seriesApi } from '../../blog/api/series';
import { todoApi, noteApi } from '../../workspace/api/userFeatures';
import { useLiveUserCount } from '../hooks/useLiveUserCount';
import { useAuth } from '../context/AuthContext';

/* ── Fade-up on scroll: add .visible when element enters the viewport ── */
const useFadeUp = () => {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { entry.target.classList.add('visible'); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return ref;
};

/* ── Water-droplet click ripple for series cards ── */
const useWaterRipple = () =>
  useCallback((e) => {
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

/* ── Series card using FeatureCard ── */
import FeatureCard from '../components/ui/FeatureCard';

const SeriesCard = ({ series }) => {
  const hasMultiplePosts = (series.postCount || 0) >= 2;
  const ref = useFadeUp();

  return (
    <div ref={ref} className="fade-up">
      <FeatureCard 
        title={series.title}
        description={series.description}
        icon={Layers}
        image={series.coverImage}
        color="#5EEAD4"
        badge={hasMultiplePosts ? `${series.postCount} parts` : 'Series'}
        to={`/series/${series.slug}`}
      />
    </div>
  );
};

/* ── Workspace preview (todos + notes for logged-in users) ── */
const WorkspacePreview = ({ todos, notes }) => {
  const ref = useFadeUp();
  const PRIORITY_COLOR = { low: '#5EEAD4', medium: '#FFB454', high: '#F87171' };

  return (
    <section ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 py-12 fade-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-mono-display uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>
            // your workspace
          </p>
          <h2 className="text-2xl font-bold glow-title">Recent Activity</h2>
        </div>
        <Link
          to="/todos"
          className="flex items-center gap-1.5 text-sm font-medium border px-3.5 py-2 rounded-xl btn-press"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          View all <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {/* Todos preview */}
        <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="flex items-center gap-2 text-sm font-semibold mb-4">
            <ListTodo size={15} style={{ color: 'var(--accent)' }} /> To-Do
          </p>
          {todos.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No tasks yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {todos.slice(0, 3).map((t) => (
                <div key={t._id} className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded border flex items-center justify-center shrink-0"
                    style={{ borderColor: t.isDone ? 'var(--accent)' : 'var(--border)', backgroundColor: t.isDone ? 'var(--accent)' : 'transparent' }}
                  >
                    {t.isDone && <Check size={10} color="var(--bg)" />}
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: PRIORITY_COLOR[t.priority] }} />
                  <p className="text-sm truncate" style={{ color: t.isDone ? 'var(--text-muted)' : 'var(--text)', textDecoration: t.isDone ? 'line-through' : 'none' }}>
                    {t.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes preview */}
        <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="flex items-center gap-2 text-sm font-semibold mb-4">
            <StickyNote size={15} style={{ color: 'var(--accent)' }} /> Notes
          </p>
          {notes.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No notes yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {notes.slice(0, 2).map((n) => (
                <div
                  key={n._id}
                  className="rounded-lg p-3 border-l-2"
                  style={{ borderColor: n.color, backgroundColor: `${n.color}11` }}
                >
                  <p className="text-sm font-medium">{n.title}</p>
                  {n.subject && (
                    <span className="text-[10px] font-mono-display flex items-center gap-1 mt-0.5" style={{ color: n.color }}>
                      <Tag size={9} /> {n.subject}
                    </span>
                  )}
                  <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{n.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const Home = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [seriesList, setSeriesList] = useState([]);
  const [userTodos, setUserTodos] = useState([]);
  const [userNotes, setUserNotes] = useState([]);
  const [helpOpen, setHelpOpen] = useState(false);
  const liveCount = useLiveUserCount();

  const heroRef = useFadeUp();
  const subjectsRef = useFadeUp();

  useEffect(() => {
    contentApi.getSubjects().then(({ data }) => setSubjects(data.subjects)).catch(() => {});
    seriesApi.getAll().then(({ data }) => setSeriesList(data.series || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    todoApi.getAll().then(({ data }) => setUserTodos(data.todos)).catch(() => {});
    noteApi.getAll().then(({ data }) => setUserNotes(data.notes)).catch(() => {});
  }, [user]);

  return (
    <div>
      {/* Hero */}
      <section
        ref={heroRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 grid lg:grid-cols-2 gap-10 items-center fade-up"
      >
        <div>
          <div
            className="inline-flex items-center gap-1.5 text-xs font-mono-display px-3 py-1.5 rounded-full border mb-5"
            style={{ borderColor: 'var(--border)', color: 'var(--accent)' }}
          >
            <Users size={13} /> {liveCount} learning right now
          </div>

          {/* Sparkle hero title */}
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-5">
            <span className="sparkle-text glow-title">
              {/* Floating star particles */}
              <span className="sparkle-star"><Star size={8} fill="var(--accent)" color="var(--accent)" /></span>
              <span className="sparkle-star"><Star size={6} fill="#5EEAD4" color="#5EEAD4" /></span>
              <span className="sparkle-star"><Star size={7} fill="var(--accent)" color="var(--accent)" /></span>
              <span className="sparkle-star"><Star size={5} fill="#A78BFA" color="#A78BFA" /></span>
              Learn DSA, Java &amp; Aptitude
            </span>
            <br />
            <span className="gradient-heading-accent">the way it should be taught</span>
          </h1>

          <p className="text-lg mb-8" style={{ color: 'var(--text-muted)' }}>
            Visual algorithm walkthroughs, structured roadmaps, and chapter-by-chapter tracking —
            built for engineers preparing for interviews, not just browsing tutorials.
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
            <div
              key={i}
              className="px-4 py-6 text-center transition-colors duration-200 hover:bg-[var(--accent-soft)]"
              style={{ borderColor: 'var(--border)' }}
            >
              <Icon size={18} className="mx-auto mb-2" style={{ color: 'var(--accent)' }} />
              <p className="text-xl font-bold font-mono-display">{value}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workspace preview (logged-in users only) */}
      {user && (userTodos.length > 0 || userNotes.length > 0) && (
        <WorkspacePreview todos={userTodos} notes={userNotes} />
      )}

      {/* Subjects */}
      <section ref={subjectsRef} className="max-w-7xl mx-auto px-4 sm:px-6 py-12 fade-up">
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

      {/* Blog Series */}
      {seriesList.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
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

      {/* Footer note */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="rounded-2xl border p-8 text-center" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
          <p className="text-sm font-mono-display mb-2" style={{ color: 'var(--accent)' }}>references &amp; further reading</p>
          <p className="max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            Every chapter created by Tanish — from scratch to mastery. No doubt left. Best platform for revision.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
