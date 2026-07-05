import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle, Sun, Moon } from 'lucide-react';
import { contentApi } from '../api/content';
import { progressApi, bookmarkApi } from '../../workspace/api/userFeatures';
import api from '../../core/api/client';
import { useAuth } from '../../core/context/AuthContext';
import { useTheme } from '../../core/context/ThemeContext';
import NestedSidebar from '../components/NestedSidebar';
import StickyTableOfContents from '../components/StickyTableOfContents';
import FloatingActionBar from '../components/FloatingActionBar';
import ChapterReader from '../components/ChapterReader';
import { ArticleSkeleton } from '../../core/components/ui/Skeleton';
import { useScrollSpy } from '../../core/hooks/useScrollSpy';
import { useReadingProgress } from '../../core/hooks/useReadingProgress';

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
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    setLoading(true);
    contentApi.getSubjectBySlug(subjectSlug).then(({ data }) => {
      setSubject(data.subject);
      const foundTopic = data.topics.find((t) => t.slug === topicSlug);
      setTopic(foundTopic || null);
    }).catch(() => {
      // Fallback for UI demonstration if DB is empty
      setSubject({ name: 'Java', color: '#FFBD2E' });
      setTopic({ _id: 'mock-topic', name: 'JVM Architecture', slug: 'jvm-architecture' });
    });
  }, [subjectSlug, topicSlug]);

  useEffect(() => {
    if (!topic) return;
    contentApi.getTracksForTopic(topic._id).then(({ data }) => {
      setTracks(data.tracks);
      if (data.tracks.length > 0) setActiveTrack(data.tracks[0]);
    }).catch(() => {
      // Mock tracks
      const mockTrack = { _id: 'mock-track', name: 'Java Core' };
      setTracks([mockTrack, { _id: 'mock-track2', name: 'Advanced Java' }, { _id: 'mock-track3', name: 'Spring Boot' }]);
      setActiveTrack(mockTrack);
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
    }).catch(() => {
      // Mock chapters
      const mockChapters = [
        { _id: 'mock-chap-1', title: 'JVM Architecture' },
        { _id: 'mock-chap-2', title: 'Data Types & Ops' },
        { _id: 'mock-chap-3', title: 'Control Flow' },
        { _id: 'mock-chap-4', title: 'OOP Principles' },
      ];
      setChapters(mockChapters);
      setActiveChapterId(mockChapters[0]._id);
      setLoading(false);
    });
  }, [activeTrack]);

  useEffect(() => {
    if (!activeChapterId) return;
    
    // Clear note when switching chapters
    setNoteContent('');
    
    contentApi
      .getChapterContent(activeChapterId)
      .then(({ data }) => {
        setChapterData({ ...data, locked: false });
        scrollRef.current?.scrollTo({ top: 0 });
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          setChapterData({ ...err.response.data, locked: true });
        } else {
          // Mock Chapter content
          setChapterData({
            locked: false,
            studied: false,
            chapter: {
              _id: 'mock-chap-1',
              title: 'Chapter 1: Introduction to JVM Architecture',
              content: `The Java Virtual Machine (JVM) is the engine that drives the Java platform. It is responsible for loading, verifying, and executing Java bytecode, ensuring cross-platform compatibility through the famous "Write Once, Run Anywhere" (WORA) philosophy.

![JVM Layout Diagram](https://media.geeksforgeeks.org/wp-content/uploads/20231206121406/JVM-Architecture.png)

## 1. The Class Loader Subsystem
The Class Loader is primarily responsible for three activities: Loading, Linking, and Initialization.`,
              headings: [
                { id: '1-the-class-loader-subsystem', level: 2, text: 'The Class Loader Subsystem' },
                { id: '2-runtime-data-areas', level: 2, text: 'Runtime Data Areas' },
                { id: '3-execution-engine', level: 2, text: 'Execution Engine' },
                { id: '4-native-method-interface', level: 2, text: 'Native Method Interface' },
              ]
            }
          });
          scrollRef.current?.scrollTo({ top: 0 });
        }
      });

    // Fetch inline note for chapter if user is logged in
    if (user) {
      api.get(`/notes/article/${activeChapterId}`).then((res) => {
        if (res.data.note) {
          setNoteContent(res.data.note.content);
        }
      }).catch(() => {});
    }
  }, [activeChapterId, user]);

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

  const handleNoteChange = async (newContent) => {
    setNoteContent(newContent);
    try {
      await api.put(`/notes/article/${activeChapterId}`, { content: newContent });
    } catch (err) {
      console.error('Failed to save note');
    }
  };

  const handleLoginSuccess = async () => {
    await refreshUser();
    contentApi.getChapterContent(activeChapterId).then(({ data }) => setChapterData({ ...data, locked: false }));
  };

  const headings = chapterData?.chapter?.headings || [];
  const activeHeadingId = useScrollSpy(headings, scrollRef);
  const progress = useReadingProgress(scrollRef);

  // Prev / Next logic
  const currentChapterIndex = chapters.findIndex(c => c._id === activeChapterId);
  const hasPrev = currentChapterIndex > 0;
  const hasNext = currentChapterIndex >= 0 && currentChapterIndex < chapters.length - 1;
  
  const handlePrev = () => {
    if (hasPrev) setActiveChapterId(chapters[currentChapterIndex - 1]._id);
  };
  
  const handleNext = () => {
    if (hasNext) setActiveChapterId(chapters[currentChapterIndex + 1]._id);
  };

  const scrollToHeading = (id) => {
    scrollRef.current?.querySelector(`[data-id="${id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Progress calculation
  const studiedCount = chapters.filter((c) => c.studied).length;
  const totalCount = chapters.length;
  const pct = totalCount > 0 ? Math.round((studiedCount / totalCount) * 100) : 0;

  if (loading && !topic) {
    return (
      <div className="min-h-screen pt-20 bg-[#0E1015]">
        <ArticleSkeleton />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0E1015] text-on-surface-variant">
        Topic not found.
      </div>
    );
  }

  return (
    <div className="lg:h-[calc(100vh-64px)] flex flex-col lg:overflow-hidden bg-[#0E1015] text-on-surface">
      {/* ── Three-column layout ── */}
      <div 
        className={`flex-1 lg:min-h-0 max-w-[1500px] mx-auto w-full flex flex-col lg:grid gap-0 lg:gap-8 xl:gap-12 transition-all duration-300 ease-in-out px-4 sm:px-6 lg:px-8 ${
          isReadingMode ? 'lg:grid-cols-[0px_1fr_0px]' : 'lg:grid-cols-[260px_1fr_260px] xl:grid-cols-[280px_1fr_280px]'
        }`}
      >

        {/* Left rail — Nested Sidebar */}
        <aside className={`order-1 overflow-hidden transition-all duration-300 ease-in-out ${isReadingMode ? 'opacity-0 w-0' : 'opacity-100'}`}>
          <div className="h-full lg:overflow-y-auto">
            <NestedSidebar
              topicName={topic.name}
              tracks={tracks}
              activeTrackId={activeTrack?._id}
              chapters={chapters}
              activeChapterId={activeChapterId}
              onSelectTrack={setActiveTrack}
              onSelectChapter={(ch) => setActiveChapterId(ch._id)}
              studiedCount={studiedCount}
              totalCount={totalCount}
            />
          </div>
        </aside>

        {/* Center — Chapter content */}
        <section 
          ref={scrollRef} 
          className="order-2 lg:overflow-y-auto lg:min-h-0 relative pb-32 pt-8"
        >
          {chapterData && (
            <>
              <ChapterReader
                chapterData={chapterData}
                subjectName={subject?.name}
                topicName={topic?.name}
                locked={chapterData.locked}
                onToggleStudied={handleToggleStudied}
                onToggleBookmark={handleToggleBookmark}
                isBookmarked={bookmarkedIds.has(activeChapterId)}
                onLoginSuccess={handleLoginSuccess}
              />
              
              <FloatingActionBar
                onPrev={handlePrev}
                onNext={handleNext}
                hasPrev={hasPrev}
                hasNext={hasNext}
                isBookmarked={bookmarkedIds.has(activeChapterId)}
                onToggleBookmark={() => handleToggleBookmark(activeChapterId)}
                isReadingMode={isReadingMode}
                onToggleReadingMode={() => setIsReadingMode(!isReadingMode)}
                noteContent={noteContent}
                onNoteChange={user ? handleNoteChange : undefined}
              />
            </>
          )}
        </section>

        {/* Right rail — Sticky TOC */}
        <aside className={`order-3 overflow-hidden transition-all duration-300 ease-in-out hidden lg:block ${isReadingMode ? 'opacity-0 w-0' : 'opacity-100'}`}>
          <div className="h-full lg:overflow-y-auto">
            <StickyTableOfContents 
              headings={headings}
              activeHeadingId={activeHeadingId}
              onHeadingClick={scrollToHeading}
            />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TopicPage;
