import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle, Sun, Moon } from 'lucide-react';
import { contentApi } from '../api/content';
import { progressApi, bookmarkApi } from '../api/userFeatures';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import TrackSidebar from '../components/learn/TrackSidebar';
import ChapterList from '../components/learn/ChapterList';
import ChapterReader from '../components/learn/ChapterReader';
import { useScrollSpy } from '../hooks/useScrollSpy';
import { useReadingProgress } from '../hooks/useReadingProgress';

const TopicPage = () => {
  const { subjectSlug, topicSlug } = useParams();
  const { user, refreshUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
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

  useEffect(() => {
    setLoading(true);
    contentApi.getSubjectBySlug(subjectSlug).then(({ data }) => {
      setSubject(data.subject);
      const foundTopic = data.topics.find((t) => t.slug === topicSlug);
      setTopic(foundTopic || null);
    });
  }, [subjectSlug, topicSlug]);

  useEffect(() => {
    if (!topic) return;
    contentApi.getTracksForTopic(topic._id).then(({ data }) => {
      setTracks(data.tracks);
      if (data.tracks.length > 0) setActiveTrack(data.tracks[0]);
    });
  }, [topic]);

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
  const progress = useReadingProgress(scrollRef);

  // Progress calculation
  const studiedCount = chapters.filter((c) => c.studied).length;
  const totalCount = chapters.length;
  const pct = totalCount > 0 ? Math.round((studiedCount / totalCount) * 100) : 0;

  if (loading && !topic) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg)', color: 'var(--text-muted)' }}
      >
        Loading…
      </div>
    );
  }

  if (!topic) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg)', color: 'var(--text-muted)' }}
      >
        Topic not found.
      </div>
    );
  }

  return (
    <div
      className="lg:h-screen flex flex-col lg:overflow-hidden"
      style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
    >
      {/* ── Reading progress bar ── */}
      <div className="h-0.5 shrink-0" style={{ backgroundColor: 'var(--border)' }}>
        <div
          className="h-full transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%`, backgroundColor: 'var(--accent)' }}
        />
      </div>

      {/* ── Minimal sticky header (replaces global Header) ── */}
      <div
        className="shrink-0 px-4 sm:px-6 py-3 max-w-7xl mx-auto w-full flex items-center justify-between gap-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {/* Back breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to={`/learn/${subjectSlug}`}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border btn-press shrink-0"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            <ArrowLeft size={13} />
            <span className="hidden sm:inline">{subject?.name}</span>
          </Link>
          <span style={{ color: 'var(--border)' }}>/</span>
          <span className="text-sm font-semibold truncate" style={{ color: subject?.color }}>
            {topic.name}
          </span>
        </div>

        {/* Right: progress + theme toggle */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Topic progress */}
          <div className="hidden sm:flex items-center gap-2">
            {pct === 100
              ? <CheckCircle2 size={13} style={{ color: 'var(--accent)' }} />
              : <Circle size={13} style={{ color: 'var(--text-muted)' }} />
            }
            <span className="text-xs font-mono-display" style={{ color: pct === 100 ? 'var(--accent)' : 'var(--text-muted)' }}>
              {studiedCount}/{totalCount} studied
            </span>
            <div className="progress-bar-track" style={{ width: '80px' }}>
              <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg border btn-press"
            style={{ borderColor: 'var(--border)' }}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>

      {/* ── Three-column layout ── */}
      <div className="flex-1 lg:min-h-0 max-w-7xl mx-auto w-full px-4 sm:px-6 flex flex-col lg:grid lg:grid-cols-[200px_1fr_260px] gap-5 py-4">

        {/* Left rail — "Explore Further" dropdown + tracks */}
        <aside className="order-1 lg:overflow-y-auto">
          <TrackSidebar
            tracks={tracks}
            activeTrackId={activeTrack?._id}
            onSelect={(track) => {
              setActiveTrack(track);
            }}
            chapters={chapters}
            activeChapterId={activeChapterId}
            onSelectChapter={(ch) => setActiveChapterId(ch._id)}
          />
        </aside>

        {/* Center — Chapter content (only this scrolls) */}
        <section ref={scrollRef} className="order-2 lg:overflow-y-auto lg:min-h-0">
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

        {/* Right rail — Chapter navigator */}
        <aside className="order-3 flex flex-col gap-4 lg:overflow-y-auto">
          <ChapterList
            chapters={chapters}
            activeChapterId={activeChapterId}
            onSelect={(c) => setActiveChapterId(c._id)}
            onToggleStudied={(c) => handleToggleStudied(c._id)}
            isLoggedIn={!!user}
            studiedCount={studiedCount}
            totalCount={totalCount}
          />
        </aside>
      </div>
    </div>
  );
};

export default TopicPage;
