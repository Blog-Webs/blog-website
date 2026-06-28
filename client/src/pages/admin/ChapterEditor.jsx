import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Lock, Unlock } from 'lucide-react';
import { contentApi } from '../../api/content';
import { adminApi } from '../../api/admin';
import { blogApi } from '../../api/blog';
import BlockEditor from '../../components/ui/BlockEditor';

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

  useEffect(() => {
    if (!isEditing) {
      // For a brand new chapter we still want the breadcrumb + next
      // chapter number, fetched from the track id passed in via the URL.
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

  return (
    <div className="max-w-4xl">
      <button
        onClick={() => navigate('/admin-portal/content')}
        className="flex items-center gap-1.5 text-sm mb-6 px-3 py-1.5 rounded-lg border btn-press"
        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
      >
        <ArrowLeft size={14} /> Back to content tree
      </button>

      {breadcrumb && (
        <p className="text-xs font-mono-display mb-2" style={{ color: 'var(--text-muted)' }}>
          {breadcrumb.subjectName} / {breadcrumb.topicName} / {breadcrumb.trackName}
        </p>
      )}

      <h1 className="text-2xl font-bold mb-6">{isEditing ? 'Edit chapter' : 'New chapter'}</h1>

      <input
        value={chapter.title}
        onChange={(e) => setChapter((c) => ({ ...c, title: e.target.value }))}
        placeholder="Chapter title (e.g. Introduction)"
        className="w-full text-2xl font-bold mb-6 outline-none bg-transparent"
      />

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
          minHeight="640px"
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

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium btn-press"
        style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
      >
        <Save size={15} /> {isEditing ? 'Save changes' : 'Create chapter'}
      </button>
    </div>
  );
};

export default ChapterEditor;
