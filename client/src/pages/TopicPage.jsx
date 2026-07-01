import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { List, ArrowLeft, CheckCircle2, Circle } from 'lucide-react';
import { contentApi } from '../api/content';
import { progressApi, bookmarkApi } from '../api/userFeatures';
import { useAuth } from '../context/AuthContext';
import TrackSidebar from '../components/learn/TrackSidebar';
import ChapterList from '../components/learn/ChapterList';
import ChapterReader from '../components/learn/ChapterReader';
import { useScrollSpy } from '../hooks/useScrollSpy';
import { useReadingProgress } from '../hooks/useReadingProgress';

const TopicPage = () => {
  const { subjectSlug, topicSlug } = useParams();
  const { user, refreshUser } = useAuth();
  const scrollRef = useRef(null);

  const [subject, setSubject] = useState(null);
  const [topic, setTopic] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [activeTrack, setActiveTrack] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [activeChapterId, setActiveChapterId] = useState(null);
  const [chapterData, setChapterData] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Resolve subject + topic from slugs (robust to hard refresh / direct link)
  useEffect(() => {
    setLoading(true);
    contentApi.getSubjectBySlug(subjectSlug).then(({ data }) => {
      setSubject(data.subject);
      const foundTopic = data.topics.find((t) => t.slug === topicSlug);
      setTopic(foundTopic || null);
    });
  }, [subjectSlug, topicSlug]);

  // Load tracks once topic is known
  useEffect(() => {
    if (!topic) return;
    contentApi.getTracksForTopic(topic._id).then(({ data }) => {
      setTracks(data.tracks);
      if (data.tracks.length > 0) setActiveTrack(data.tracks[0]);
    });
  }, [topic]);

  // Load chapters once a track is active
  useEffect(() => {
    if (!activeTrack) return;
    contentApi.getChaptersForTrack(activeTrack._id).then(({ data }) => {
      setChapters(data.chapters);
      if (data.chapters.length > 0) {
        setActiveChapterId(data.chapters[0]._id);
      } else {
        setActiveChapterId(null);
        setChapterData(null);
      }
      setLoading(false);
    });
  }, [activeTrack]);

  // Load chapter content once a chapter is selected
  useEffect(() => {
    if (!activeChapterId) return;
    contentApi
      .getChapterContent(activeChapterId)
      .then(({ data }) => {
        setChapterData({ ...data, locked: false });
        scrollRef.current?.scrollTo({ top: 0 });
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          setChapterData({ ...err.response.data, locked: true });
        }
      });
  }, [activeChapterId]);

  // Load bookmarks (only if logged in)
  useEffect(() => {
    if (!user) return;
    bookmarkApi.getAll().then(({ data }) => {
      const ids = new Set(
        data.bookmarks.filter((b) => b.itemType === 'chapter').map((b) => b.chapter?._id)
      );
      setBookmarkedIds(ids);
    });
  }, [user]);

  const handleToggleStudied = useCallback(async (chapterId) => {
    const { data } = await progressApi.toggleStudied(chapterId);
    setChapters((prev) => prev.map((c) => (c._id === chapterId ? { ...c, studied: data.studied } : c)));
    setChapterData((prev) => (prev?.chapter?._id === chapterId ? { ...prev, studied: data.studied } : prev));
  }, []);

  const handleToggleBookmark = useCallback(async (chapterId) => {
    const { data } = await bookmarkApi.toggle('chapter', chapterId);
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (data.bookmarked) next.add(chapterId);
      else next.delete(chapterId);
      return next;
    });
  }, []);

  const handleLoginSuccess = async () => {
    await refreshUser();
    contentApi.getChapterContent(activeChapterId).then(({ data }) => setChapterData({ ...data, locked: false }));
  };

  const headings = chapterData?.chapter?.headings || [];
  const activeHeadingId = useScrollSpy(headings, scrollRef);
  const progress = useReadingProgress(scrollRef);

  const scrollToHeading = (id) => {
    scrollRef.current?.querySelector(`[data-id="${id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Progress calculation
  const studiedCount = chapters.filter((c) => c.studied).length;
  const totalCount = chapters.length;
  const pct = totalCount > 0 ? Math.round((studiedCount / totalCount) * 100) : 0;

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center" style={{ color: 'var(--text-muted)' }}>Loading…</div>;
  }

  if (!topic) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center" style={{ color: 'var(--text-muted)' }}>Topic not found.</div>;
  }

  return (
    // Fixed-height shell on desktop so only the center reading pane
    // scrolls. On mobile this collapses to normal page scroll with
    // everything stacked, since a fixed split-pane layout doesn't fit a
    // small screen — the rails become regular sections above/below the
    // chapter instead of permanently-visible side columns.
    <div className="lg:h-[calc(100vh-5rem)] flex flex-col lg:overflow-hidden">

      {/* ── Sticky header: subject crumb + topic title + progress ── */}
      <div
        className="shrink-0 px-4 sm:px-6 pt-5 pb-4 max-w-7xl mx-auto w-full"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono-display mb-1" style={{ color: 'var(--text-muted)' }}>
          <Link to={`/learn/${subjectSlug}`} className="flex items-center gap-1 hover:text-[var(--accent)] transition-colors">
            <ArrowLeft size={11} /> {subject?.name}
          </Link>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold glow-title truncate" style={{ color: subject?.color }}>
              {topic.name}
            </h1>
          </div>

          {/* Progress stats */}
          <div className="shrink-0 text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
              {pct === 100
                ? <CheckCircle2 size={14} style={{ color: 'var(--accent)' }} />
                : <Circle size={14} style={{ color: 'var(--text-muted)' }} />
              }
              <span className="text-sm font-semibold font-mono-display" style={{ color: pct === 100 ? 'var(--accent)' : 'var(--text)' }}>
                {pct}%
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {studiedCount}/{totalCount} studied
              </span>
            </div>
            <div className="progress-bar-track" style={{ width: '160px' }}>
              <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Reading progress bar */}
      <div className="h-0.5 shrink-0" style={{ backgroundColor: 'var(--border)' }}>
        <div
          className="h-full transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%`, backgroundColor: 'var(--accent)' }}
        />
      </div>

      <div className="flex-1 lg:min-h-0 max-w-7xl mx-auto w-full px-4 sm:px-6 flex flex-col lg:grid lg:grid-cols-[200px_1fr_260px] gap-6 pb-6">
        {/* Left rail: Tracks. Desktop: fixed left rail. Mobile: a
            horizontally-scrollable strip above the chapter, in document order. */}
        <aside className="order-1 lg:overflow-y-auto py-2">
          <TrackSidebar tracks={tracks} activeTrackId={activeTrack?._id} onSelect={setActiveTrack} />
        </aside>

        {/* Center: scrolls on its own on desktop; on mobile it's just the
            next block in normal page flow. */}
        <section ref={scrollRef} className="order-2 lg:overflow-y-auto py-2 lg:min-h-0">
          {chapterData && (
            <ChapterReader
              chapterData={chapterData}
              locked={chapterData.locked}
              onToggleStudied={handleToggleStudied}
              onToggleBookmark={handleToggleBookmark}
              isBookmarked={bookmarkedIds.has(activeChapterId)}
              onLoginSuccess={handleLoginSuccess}
            />
          )}
        </section>

        {/* Right rail: Chapters list + On this page. Desktop: fixed right rail.
            Mobile: stacked below the chapter content. */}
        <aside className="order-3 flex flex-col gap-4 lg:overflow-y-auto py-2">
          <ChapterList
            chapters={chapters}
            activeChapterId={activeChapterId}
            onSelect={(c) => setActiveChapterId(c._id)}
            onToggleStudied={(c) => handleToggleStudied(c._id)}
            isLoggedIn={!!user}
            studiedCount={studiedCount}
            totalCount={totalCount}
          />

          {headings.length > 0 && (
            <div
              className="rounded-xl border p-3"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <p className="flex items-center gap-1.5 text-xs font-mono-display uppercase mb-3" style={{ color: 'var(--text-muted)' }}>
                <List size={13} /> On this page
              </p>
              <div className="toc-list flex flex-col gap-0.5">
                {headings.map((h) => {
                  const isActive = h.id === activeHeadingId;
                  return (
                    <button
                      key={h.id}
                      onClick={() => scrollToHeading(h.id)}
                      className="text-left text-sm py-1.5 pl-3 border-l-2 transition-all duration-200 rounded-r"
                      style={{
                        color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                        borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                        fontWeight: isActive ? 600 : 400,
                        backgroundColor: isActive ? 'var(--accent-soft)' : 'transparent',
                      }}
                    >
                      {h.text}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default TopicPage;
