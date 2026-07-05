import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
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
  const [allTopics, setAllTopics] = useState([]);
  const [activeTopic, setActiveTopic] = useState(null);
  
  const [chaptersByTopic, setChaptersByTopic] = useState({});
  const [activeChapterId, setActiveChapterId] = useState(null);
  const [chapterData, setChapterData] = useState(null);
  
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [noteContent, setNoteContent] = useState('');

  // Initial Load: Fetch Subject, Topics, and all Chapters
  useEffect(() => {
    setLoading(true);
    contentApi.getSubjectBySlug(subjectSlug).then(async ({ data }) => {
      setSubject(data.subject);
      const subjectTopics = data.topics || [];
      setAllTopics(subjectTopics);
      
      let initialTopic = subjectTopics.find((t) => t.slug === topicSlug);
      if (!initialTopic && subjectTopics.length > 0) {
        initialTopic = subjectTopics[0];
      }
      setActiveTopic(initialTopic || null);
      
      // Fetch chapters for all topics to populate the sidebar tree
      const map = {};
      let firstChapterId = null;
      
      await Promise.all(
        subjectTopics.map(async (t) => {
          try {
            const tracksRes = await contentApi.getTracksForTopic(t._id);
            const tracks = tracksRes.data.tracks;
            if (tracks && tracks.length > 0) {
              const chaptersRes = await contentApi.getChaptersForTrack(tracks[0]._id);
              const chaps = chaptersRes.data.chapters;
              map[t._id] = chaps;
              
              if (t._id === initialTopic?._id && chaps.length > 0 && !firstChapterId) {
                firstChapterId = chaps[0]._id;
              }
            } else {
              map[t._id] = [];
            }
          } catch (e) {
            map[t._id] = [];
          }
        })
      );
      
      setChaptersByTopic(map);
      
      if (firstChapterId) {
        setActiveChapterId(firstChapterId);
      } else {
        // If initial topic has no chapters, fallback to very first available chapter
        for (const t of subjectTopics) {
           if (map[t._id] && map[t._id].length > 0) {
             setActiveChapterId(map[t._id][0]._id);
             setActiveTopic(t);
             break;
           }
        }
      }
      
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [subjectSlug, topicSlug]);

  // Load Chapter Content when active chapter changes
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
    
    setChaptersByTopic((prev) => {
       const next = { ...prev };
       for (const topicId in next) {
          next[topicId] = next[topicId].map(c => c._id === chapterId ? { ...c, studied: data.studied } : c);
       }
       return next;
    });
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

  // Flatten chapters for prev/next logic
  const flattenedChapters = useMemo(() => {
    return allTopics.flatMap(t => chaptersByTopic[t._id] || []);
  }, [allTopics, chaptersByTopic]);

  const currentChapterIndex = flattenedChapters.findIndex(c => c._id === activeChapterId);
  const hasPrev = currentChapterIndex > 0;
  const hasNext = currentChapterIndex >= 0 && currentChapterIndex < flattenedChapters.length - 1;
  
  const handlePrev = () => {
    if (hasPrev) {
      const prevCh = flattenedChapters[currentChapterIndex - 1];
      setActiveChapterId(prevCh._id);
      const tId = allTopics.find(t => chaptersByTopic[t._id]?.some(c => c._id === prevCh._id))?._id;
      if (tId) setActiveTopic(allTopics.find(t => t._id === tId));
    }
  };
  
  const handleNext = () => {
    if (hasNext) {
      const nextCh = flattenedChapters[currentChapterIndex + 1];
      setActiveChapterId(nextCh._id);
      const tId = allTopics.find(t => chaptersByTopic[t._id]?.some(c => c._id === nextCh._id))?._id;
      if (tId) setActiveTopic(allTopics.find(t => t._id === tId));
    }
  };

  const scrollToHeading = (id) => {
    scrollRef.current?.querySelector(`[data-id="${id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Progress calculation across entire subject
  const totalCount = flattenedChapters.length;
  const studiedCount = flattenedChapters.filter(c => c.studied).length;

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-[#0E1015]">
        <ArticleSkeleton />
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0E1015] text-on-surface-variant">
        Subject not found.
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
              subjectName={subject.name}
              topics={allTopics}
              activeTopicId={activeTopic?._id}
              chaptersByTopic={chaptersByTopic}
              activeChapterId={activeChapterId}
              onSelectTopic={setActiveTopic}
              onSelectChapter={(ch, t) => {
                setActiveChapterId(ch._id);
                setActiveTopic(t);
              }}
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
                topicName={activeTopic?.name}
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
