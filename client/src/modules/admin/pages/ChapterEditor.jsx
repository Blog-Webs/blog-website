import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Lock, Unlock, Maximize2, Minimize2, Type, Clock } from 'lucide-react';
import { contentApi } from '../../learn/api/content';
import { adminApi } from '../api/admin';
import { blogApi } from '../../blog/api/blog';
import BlockEditor from '../../core/components/ui/BlockEditor';

const emptyChapter = {
  title: '',
  content: '',
  contentBlocks: null,
  headings: [],
  isFreePreview: false,
  estimatedMinutes: 10,
};

/**
 * Full-page chapter editor, reached from the Content Tree by clicking a
 * chapter (to edit) or "Add chapter" (to create). Mirrors BlogEditor's
 * structure so admins get one consistent rich-text editing experience
 * across blogs and learning chapters.
 *
 * Route: /admin-portal/content/chapters/:id  (":id" is "new" for creation)
 * Requires ?track=<trackId> on creation, since a brand new chapter has no
 * existing track relationship to infer.
 */
const ChapterEditor = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditing = id && id !== 'new';
  const trackIdFromQuery = searchParams.get('track');

  const [chapter, setChapter] = useState(emptyChapter);
  const [breadcrumb, setBreadcrumb] = useState(null); // { subjectName, topicName, trackName }
  const [existingChapterCount, setExistingChapterCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(!isEditing);
  const [focusMode, setFocusMode] = useState(false);

  // Live word count
  const wordCount = chapter.content ? chapter.content.trim().split(/\s+/).filter(Boolean).length : 0;
  const readTime = Math.max(1, Math.round(wordCount / 200));

  useEffect(() => {
    if (!isEditing) {
      if (!trackIdFromQuery) {
        setLoaded(true);
        return;
      }
      contentApi.getChaptersForTrack(trackIdFromQuery).then(({ data }) => {
        setBreadcrumb({
          subjectName: data.track?.topic?.subject?.name,
          topicName: data.track?.topic?.name,
          trackName: data.track?.name,
        });
        setExistingChapterCount(data.chapters.length);
        setLoaded(true);
      });
      return;
    }

    contentApi.getChapterContent(id).then(({ data }) => {
      const found = data.chapter;
      setChapter({
        title: found.title,
        content: found.content,
        contentBlocks: found.contentBlocks || null,
        headings: found.headings || [],
        isFreePreview: found.isFreePreview,
        estimatedMinutes: found.estimatedMinutes,
      });
      setBreadcrumb({
        subjectName: found.track?.topic?.subject?.name,
        topicName: found.track?.topic?.name,
        trackName: found.track?.name,
      });
      setLoaded(true);
    });
  }, [id, isEditing, trackIdFromQuery]);

  // Lock body scroll in focus mode
  useEffect(() => {
    document.body.style.overflow = focusMode ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [focusMode]);

  const handleEditorChange = ({ blocks, headings, plainText }) => {
    setChapter((c) => ({ ...c, contentBlocks: blocks, headings, content: plainText }));
  };

  const handleSave = async () => {
    if (!chapter.title.trim() || !chapter.content.trim()) {
      alert('Title and content are required.');
      return;
    }
    setSaving(true);
    try {
      if (isEditing) {
        await adminApi.updateChapter(id, chapter);
      } else {
        if (!trackIdFromQuery) {
          alert('No track specified for this new chapter.');
          setSaving(false);
          return;
        }
        await adminApi.createChapter({
          ...chapter,
          track: trackIdFromQuery,
          chapterNumber: existingChapterCount + 1,
        });
      }
      navigate('/admin-portal/content');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save chapter.');
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return <p style={{ color: 'var(--text-muted)' }}>Loading…</p>;

  /* ── Shared editor fields ── */
  const editorFields = (
    <>
      <input
        value={chapter.title}
        onChange={(e) => setChapter((c) => ({ ...c, title: e.target.value }))}
        placeholder="Chapter title (e.g. Introduction)"
        className="w-full text-2xl font-bold mb-4 outline-none bg-transparent"
      />

      {/* Live stats */}
      <div className="flex items-center gap-4 mb-4 text-xs" style={{ color: 'var(--text-muted)' }}>
        <span className="flex items-center gap-1.5">
          <Type size={12} style={{ color: 'var(--accent)' }} />
          {wordCount.toLocaleString()} words
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={12} style={{ color: 'var(--accent)' }} />
          ~{readTime} min read
        </span>
      </div>

      <p className="text-xs font-mono-display uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Content</p>

      <div className="mb-6">
        <BlockEditor
          editorKey={isEditing ? id : 'new'}
          initialContent={chapter.contentBlocks}
          onChange={handleEditorChange}
          onUploadImage={async (file) => {
            const { data } = await blogApi.uploadImage(file);
            return data.url;
          }}
          minHeight={focusMode ? '70vh' : '800px'}
        />
      </div>

      <div className="flex flex-wrap items-center gap-6 mb-8">
        <button
          onClick={() => setChapter((c) => ({ ...c, isFreePreview: !c.isFreePreview }))}
          className="flex items-center gap-2 text-sm px-3.5 py-2 rounded-lg border btn-press"
          style={{
            borderColor: 'var(--border)',
            color: chapter.isFreePreview ? 'var(--accent)' : 'var(--text-muted)',
            backgroundColor: chapter.isFreePreview ? 'var(--accent-soft)' : 'transparent',
          }}
        >
          {chapter.isFreePreview ? <Unlock size={14} /> : <Lock size={14} />}
          {chapter.isFreePreview ? 'Free preview — anyone can read this' : 'Locked — sign-in required'}
        </button>

        <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          Estimated minutes
          <input
            type="number"
            min={1}
            value={chapter.estimatedMinutes}
            onChange={(e) => setChapter((c) => ({ ...c, estimatedMinutes: Number(e.target.value) || 1 }))}
            className="w-20 px-2.5 py-1.5 rounded-lg border text-sm outline-none input-focus"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
          />
        </label>
      </div>
    </>
  );

  /* ── Save button ── */
  const saveButton = (
    <button
      onClick={handleSave}
      disabled={saving}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium btn-press"
      style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
    >
      <Save size={15} /> {isEditing ? 'Save changes' : 'Create chapter'}
    </button>
  );

  /* ── Focus Mode ── */
  if (focusMode) {
    return (
      <div className="focus-mode-overlay">
        <div className="focus-mode-bar">
          <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            {breadcrumb && (
              <span style={{ color: 'var(--text-muted)' }}>
                {breadcrumb.subjectName} / {breadcrumb.topicName} &nbsp;·&nbsp;
              </span>
            )}
            <span style={{ color: 'var(--accent)' }}>{wordCount} words</span>
          </span>
          <div className="flex items-center gap-3">
            {saveButton}
            <button
              onClick={() => setFocusMode(false)}
              className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl border btn-press"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              <Minimize2 size={14} /> Exit focus
            </button>
          </div>
        </div>

        <div className="focus-mode-inner">
          {editorFields}
          {saveButton}
        </div>
      </div>
    );
  }

  /* ── Normal Mode ── */
  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/admin-portal/content')}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border btn-press"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={14} /> Back to content tree
        </button>
        <button
          onClick={() => setFocusMode(true)}
          className="flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-xl border btn-press"
          style={{ borderColor: 'var(--border)', color: 'var(--accent)' }}
          title="Enter focus / fullscreen writing mode"
        >
          <Maximize2 size={14} /> Focus mode
        </button>
      </div>

      {breadcrumb && (
        <p className="text-xs font-mono-display mb-2" style={{ color: 'var(--text-muted)' }}>
          {breadcrumb.subjectName} / {breadcrumb.topicName} / {breadcrumb.trackName}
        </p>
      )}

      <h1 className="text-2xl font-bold mb-6">{isEditing ? 'Edit chapter' : 'New chapter'}</h1>

      {editorFields}
      {saveButton}
    </div>
  );
};

export default ChapterEditor;
