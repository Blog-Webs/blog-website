import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Image as ImageIcon, X, Save, Send, Layers, Maximize2, Minimize2, Type, Clock } from 'lucide-react';
import { blogApi } from '../../api/blog';
import { seriesApi } from '../../api/series';
import BlockEditor from '../../components/ui/BlockEditor';

const emptyPost = {
  title: '',
  subtitle: '',
  coverImage: '',
  content: '',
  contentBlocks: null,
  headings: [],
  excerpt: '',
  tags: '',
  category: 'General',
  series: '',
  seriesOrder: 0,
};

const BlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id && id !== 'new';
  const fileInputRef = useRef(null);

  const [post, setPost] = useState(emptyPost);
  const [seriesList, setSeriesList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(!isEditing);
  const [focusMode, setFocusMode] = useState(false);

  // Live word count & read time
  const wordCount = post.content ? post.content.trim().split(/\s+/).filter(Boolean).length : 0;
  const readTime = Math.max(1, Math.round(wordCount / 200));

  useEffect(() => {
    seriesApi.getAll().then(({ data }) => setSeriesList(data.series)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEditing) return;
    blogApi.getByIdAdmin(id).then(({ data }) => {
      const found = data.blog;
      setPost({
        title: found.title,
        subtitle: found.subtitle || '',
        coverImage: found.coverImage || '',
        content: found.content,
        contentBlocks: found.contentBlocks || null,
        headings: found.headings || [],
        excerpt: found.excerpt || '',
        tags: (found.tags || []).join(', '),
        category: found.category || 'General',
        series: found.series?._id || '',
        seriesOrder: found.seriesOrder || 0,
      });
      setLoaded(true);
    });
  }, [id, isEditing]);

  // Lock body scroll when focus mode is active
  useEffect(() => {
    document.body.style.overflow = focusMode ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [focusMode]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await blogApi.uploadImage(file);
      setPost((p) => ({ ...p, coverImage: data.url }));
    } catch {
      alert('Image upload failed. Check your Cloudinary configuration.');
    } finally {
      setUploading(false);
    }
  };

  const handleEditorChange = ({ blocks, headings, plainText }) => {
    setPost((p) => ({ ...p, contentBlocks: blocks, headings, content: plainText }));
  };

  const handleSave = async (status) => {
    if (!post.title.trim() || !post.content.trim()) {
      alert('Title and content are required.');
      return;
    }
    setSaving(true);
    const payload = { ...post, series: post.series || null, status };
    try {
      if (isEditing) {
        await blogApi.update(id, payload);
      } else {
        await blogApi.create(payload);
      }
      navigate('/admin-portal/blogs');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save post.');
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return <p style={{ color: 'var(--text-muted)' }}>Loading…</p>;

  /* ── Shared editor fields (used in both normal and focus mode) ── */
  const editorFields = (
    <>
      {/* Cover image */}
      <div className="mb-6">
        {post.coverImage ? (
          <div className="relative rounded-2xl overflow-hidden">
            <img src={post.coverImage} alt="" className="w-full h-56 object-cover" />
            <button
              onClick={() => setPost((p) => ({ ...p, coverImage: '' }))}
              className="absolute top-3 right-3 p-1.5 rounded-full btn-press"
              style={{ backgroundColor: 'var(--bg)' }}
            >
              <X size={15} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 btn-press"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            <ImageIcon size={22} />
            <span className="text-sm">{uploading ? 'Uploading…' : 'Add a cover image'}</span>
          </button>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImageUpload} />
      </div>

      <input
        value={post.title}
        onChange={(e) => setPost((p) => ({ ...p, title: e.target.value }))}
        placeholder="Title"
        className="w-full text-3xl font-bold mb-3 outline-none bg-transparent"
      />
      <input
        value={post.subtitle}
        onChange={(e) => setPost((p) => ({ ...p, subtitle: e.target.value }))}
        placeholder="Subtitle (optional)"
        className="w-full text-lg mb-4 outline-none bg-transparent"
        style={{ color: 'var(--text-muted)' }}
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

      <p className="text-xs font-mono-display uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Body</p>

      <div className="mb-6">
        <BlockEditor
          editorKey={isEditing ? id : 'new'}
          initialContent={post.contentBlocks}
          onChange={handleEditorChange}
          onUploadImage={async (file) => {
            const { data } = await blogApi.uploadImage(file);
            return data.url;
          }}
          minHeight={focusMode ? '70vh' : '800px'}
        />
      </div>

      <textarea
        value={post.excerpt}
        onChange={(e) => setPost((p) => ({ ...p, excerpt: e.target.value }))}
        placeholder="Short excerpt shown on blog cards (optional, auto-generated if left blank)"
        rows={2}
        className="w-full p-3 rounded-xl border outline-none mb-4 text-sm input-focus"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
      />

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <input
          value={post.category}
          onChange={(e) => setPost((p) => ({ ...p, category: e.target.value }))}
          placeholder="Category (e.g. DSA)"
          className="px-3.5 py-2.5 rounded-xl border outline-none text-sm input-focus"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
        />
        <input
          value={post.tags}
          onChange={(e) => setPost((p) => ({ ...p, tags: e.target.value }))}
          placeholder="Tags, comma separated"
          className="px-3.5 py-2.5 rounded-xl border outline-none text-sm input-focus"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="relative">
          <Layers size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <select
            value={post.series}
            onChange={(e) => setPost((p) => ({ ...p, series: e.target.value }))}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border outline-none text-sm input-focus"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            <option value="">No series</option>
            {seriesList.map((s) => <option key={s._id} value={s._id}>{s.title}</option>)}
          </select>
        </div>
        {post.series && (
          <input
            type="number"
            min={0}
            value={post.seriesOrder}
            onChange={(e) => setPost((p) => ({ ...p, seriesOrder: Number(e.target.value) }))}
            placeholder="Order within series (0, 1, 2…)"
            className="px-3.5 py-2.5 rounded-xl border outline-none text-sm input-focus"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
          />
        )}
      </div>
    </>
  );

  /* ── Action bar (reused in both modes) ── */
  const actionBar = (
    <div className="flex items-center gap-3">
      <button
        onClick={() => handleSave('draft')}
        disabled={saving}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border btn-press"
        style={{ borderColor: 'var(--border)' }}
      >
        <Save size={15} /> Save draft
      </button>
      <button
        onClick={() => handleSave('published')}
        disabled={saving}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium btn-press"
        style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
      >
        <Send size={15} /> Publish
      </button>
    </div>
  );

  /* ── Focus / Fullscreen Mode ── */
  if (focusMode) {
    return (
      <div className="focus-mode-overlay">
        {/* Sticky top bar */}
        <div className="focus-mode-bar">
          <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            {isEditing ? 'Editing post' : 'New post'} &nbsp;·&nbsp;
            <span style={{ color: 'var(--accent)' }}>{wordCount} words</span>
          </span>
          <div className="flex items-center gap-3">
            {actionBar}
            <button
              onClick={() => setFocusMode(false)}
              className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl border btn-press"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              title="Exit focus mode"
            >
              <Minimize2 size={14} /> Exit focus
            </button>
          </div>
        </div>

        {/* Centered writing area */}
        <div className="focus-mode-inner">
          {editorFields}
        </div>
      </div>
    );
  }

  /* ── Normal mode ── */
  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{isEditing ? 'Edit post' : 'New post'}</h1>
        <button
          onClick={() => setFocusMode(true)}
          className="flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-xl border btn-press"
          style={{ borderColor: 'var(--border)', color: 'var(--accent)' }}
          title="Enter focus / fullscreen writing mode"
        >
          <Maximize2 size={14} /> Focus mode
        </button>
      </div>

      {editorFields}
      {actionBar}
    </div>
  );
};

export default BlogEditor;
