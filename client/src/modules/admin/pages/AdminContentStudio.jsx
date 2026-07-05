import { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Plus, Trash2, Pencil, ChevronRight, ChevronDown, Undo2,
  Image as ImageIcon, Loader2, X, Lock, Unlock, Search, Save, Bell, Moon, Eye, Type, Clock
} from 'lucide-react';
import { contentApi } from '../../learn/api/content';
import { adminApi } from '../api/admin';
import { blogApi } from '../../blog/api/blog';
import { ContentTreeSkeleton } from '../components/AdminSkeleton';
import BlockEditor from '../../core/components/ui/BlockEditor';

const inputClass = 'px-4 py-3 rounded-xl border text-[15px] outline-none w-full input-focus shadow-sm';
const inputStyle = { borderColor: '#1C202B', backgroundColor: '#111113', color: 'white' };
const textareaClass = 'px-4 py-3 rounded-xl border text-[15px] outline-none w-full input-focus resize-none shadow-sm';

const emptySubjectForm = { name: '', description: '', icon: 'layers', color: '#5EEAD4', coverImage: '' };
const emptyChapter = {
  title: '',
  content: '',
  contentBlocks: null,
  headings: [],
  isFreePreview: false,
  estimatedMinutes: 10,
  tags: []
};

const InlineForm = ({ children, onSave, onCancel, saveLabel = 'Save' }) => (
  <div className="flex flex-col gap-3 p-3 rounded-xl bg-[#161B22] border border-[#2D3342] mt-1">
    {children}
    <div className="flex gap-2">
      <button onClick={onSave} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#4375FF] text-white hover:bg-[#3460E0]">
        {saveLabel}
      </button>
      <button onClick={onCancel} className="px-3 py-1.5 rounded-lg text-xs text-[#8B949E] hover:text-white">
        Cancel
      </button>
    </div>
  </div>
);

const UndoToast = ({ message, onUndo, onDismiss }) => (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-5 py-3 rounded-2xl border border-[#2D3342] bg-[#111113] shadow-2xl z-50">
    <span className="text-sm text-[#8B949E]">{message}</span>
    <button onClick={onUndo} className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg bg-[#4375FF]/10 text-[#4375FF]">
      <Undo2 size={13} /> Undo
    </button>
    <button onClick={onDismiss} className="text-xs text-[#8B949E]">Dismiss</button>
  </div>
);

const AdminContentStudio = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Tree State
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [chapters, setChapters] = useState({});
  
  const [addingSubject, setAddingSubject] = useState(false);
  const [subjectForm, setSubjectForm] = useState(emptySubjectForm);
  const [editingSubjectId, setEditingSubjectId] = useState(null);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  // Editor State
  const isEditingChapter = id && id !== 'new';
  const isCreatingChapter = id === 'new';
  const subjectIdFromQuery = searchParams.get('subject');
  const [chapter, setChapter] = useState(emptyChapter);
  const [breadcrumb, setBreadcrumb] = useState(null);
  const [existingChapterCount, setExistingChapterCount] = useState(0);
  const [savingChapter, setSavingChapter] = useState(false);
  const [chapterLoaded, setChapterLoaded] = useState(false);
  
  const [tagInput, setTagInput] = useState('');

  const wordCount = chapter.content ? chapter.content.trim().split(/\s+/).filter(Boolean).length : 0;
  const readTime = Math.max(1, Math.round(wordCount / 200));

  const showToast = useCallback((message, onUndo) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, onUndo });
    toastTimer.current = setTimeout(() => { setToast(null); toastTimer.current = null; }, 5000);
  }, []);
  const dismissToast = () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(null);
  };

  useEffect(() => {
    contentApi.getSubjects().then(({ data }) => {
      setSubjects(data.subjects);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!id) {
      setChapterLoaded(true);
      return;
    }
    setChapterLoaded(false);
    
    if (isCreatingChapter) {
      setChapter(emptyChapter);
      if (subjectIdFromQuery) {
        contentApi.getChaptersForSubject(subjectIdFromQuery).then(({ data }) => {
          setBreadcrumb({
            subjectName: data.subject?.name,
          });
          setExistingChapterCount(data.chapters.length);
          setChapterLoaded(true);
        });
      } else {
        setChapterLoaded(true);
      }
    } else {
      contentApi.getChapterContent(id).then(({ data }) => {
        const found = data.chapter;
        setChapter({
          title: found.title,
          content: found.content,
          contentBlocks: found.contentBlocks || null,
          headings: found.headings || [],
          isFreePreview: found.isFreePreview || false,
          estimatedMinutes: found.estimatedMinutes || 10,
          tags: found.tags || [],
          coverImage: found.coverImage || ''
        });
        setBreadcrumb({
          subjectName: found.subject?.name,
        });
        
        // Ensure subject is loaded and expanded in tree to show "Recently Modified"
        if (found.subject) {
          contentApi.getChaptersForSubject(found.subject._id).then(res => {
            setChapters(prev => ({ ...prev, [found.subject._id]: res.data.chapters }));
          });
        }

        setChapterLoaded(true);
      });
    }
  }, [id, isCreatingChapter, subjectIdFromQuery]);

  // Tree Handlers
  const toggleSubject = async (subject) => {
    if (expandedSubject === subject._id) {
      setExpandedSubject(null);
      return;
    }
    setExpandedSubject(subject._id);
    if (!chapters[subject._id]) {
      const { data } = await contentApi.getChaptersForSubject(subject._id);
      setChapters((prev) => ({ ...prev, [subject._id]: data.chapters }));
    }
  };

  const refreshChapters = async (subjectId) => {
    const { data } = await contentApi.getChaptersForSubject(subjectId);
    setChapters((prev) => ({ ...prev, [subjectId]: data.chapters }));
  };

  const handleAddSubject = async () => {
    if (!subjectForm.name.trim()) return;
    const { data } = await adminApi.createSubject(subjectForm);
    setSubjects((prev) => [...prev, data.subject]);
    setSubjectForm(emptySubjectForm);
    setAddingSubject(false);
  };
  
  const handleSaveSubjectEdit = async () => {
    if (!subjectForm.name.trim()) return;
    const { data } = await adminApi.updateSubject(editingSubjectId, subjectForm);
    setSubjects((prev) => prev.map((s) => (s._id === editingSubjectId ? data.subject : s)));
    setEditingSubjectId(null);
  };
  
  const handleDeleteSubject = async (subjectId, subjectName) => {
    const snapshot = [...subjects];
    setSubjects((prev) => prev.filter((s) => s._id !== subjectId));
    let undone = false;
    showToast(`Deleted subject "${subjectName}"`, () => { undone = true; setSubjects(snapshot); dismissToast(); });
    setTimeout(async () => { if (!undone) try { await adminApi.deleteSubject(subjectId); } catch {} }, 5100);
  };

  const handleDeleteChapter = async (subjectId, chapterId, chapterTitle) => {
    const snapshot = chapters[subjectId] ? [...chapters[subjectId]] : [];
    setChapters((prev) => ({ ...prev, [subjectId]: (prev[subjectId] || []).filter((c) => c._id !== chapterId) }));
    let undone = false;
    showToast(`Deleted chapter "${chapterTitle}"`, () => { undone = true; setChapters((prev) => ({ ...prev, [subjectId]: snapshot })); dismissToast(); });
    setTimeout(async () => { if (!undone) try { await adminApi.deleteChapter(chapterId); } catch {} }, 5100);
    if (id === chapterId) {
      navigate('/admin-portal/content');
    }
  };

  // Editor Handlers
  const handleEditorChange = ({ blocks, headings, plainText }) => {
    setChapter((c) => ({ ...c, contentBlocks: blocks, headings, content: plainText }));
  };

  const handleSaveChapter = async () => {
    if (!chapter.title.trim() || !chapter.content.trim()) {
      alert('Title and content are required.');
      return;
    }
    setSavingChapter(true);
    try {
      if (isEditingChapter) {
        await adminApi.updateChapter(id, chapter);
        showToast('Chapter updated successfully.');
      } else {
        if (!subjectIdFromQuery) {
          alert('No subject specified for this new chapter.');
          setSavingChapter(false);
          return;
        }
        await adminApi.createChapter({
          ...chapter,
          subject: subjectIdFromQuery,
          chapterNumber: existingChapterCount + 1,
        });
        showToast('Chapter created successfully.');
        refreshChapters(subjectIdFromQuery);
        navigate('/admin-portal/content');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save chapter.');
    } finally {
      setSavingChapter(false);
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toUpperCase().replace('#', '');
      if (!chapter.tags.includes(newTag)) {
        setChapter(c => ({ ...c, tags: [...c.tags, newTag] }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setChapter(c => ({ ...c, tags: c.tags.filter(t => t !== tagToRemove) }));
  };
  
  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { data } = await blogApi.uploadImage(file);
      setChapter(c => ({ ...c, coverImage: data.url }));
    } catch {
      alert('Upload failed');
    }
  };

  const activeSubjectId = subjectIdFromQuery || (breadcrumb?.subjectName && Object.keys(chapters).find(sId => chapters[sId]?.some(c => c._id === id)));

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-[#0A0A0A] text-on-surface">
      {/* ── LEFT SIDEBAR: CURRICULUM TREE ── */}
      <aside className="w-[280px] flex-shrink-0 border-r border-[#1C202B] bg-[#0E1015] flex flex-col h-full z-10">
        <div className="p-4 border-b border-[#1C202B] flex flex-col gap-3">
          <h2 className="text-xs font-bold tracking-widest text-[#8B949E] uppercase mb-1">Curriculum</h2>
          <button onClick={() => alert("Navigate to a subject to add a chapter first")} className="flex items-center justify-center gap-2 py-2 bg-[#4375FF] hover:bg-[#3460E0] text-white rounded-lg text-sm font-medium transition-colors">
            <Plus size={14} /> New Chapter
          </button>
          {addingSubject ? (
            <InlineForm onSave={handleAddSubject} onCancel={() => { setAddingSubject(false); setSubjectForm(emptySubjectForm); }} saveLabel="Add Subject">
              <input value={subjectForm.name} onChange={e => setSubjectForm(f => ({ ...f, name: e.target.value }))} placeholder="Subject Name" className="bg-[#111113] border border-[#2D3342] text-sm text-white rounded-md px-2 py-1.5 outline-none focus:border-[#4375FF]" />
            </InlineForm>
          ) : (
            <button onClick={() => setAddingSubject(true)} className="flex items-center justify-center gap-2 py-2 border border-[#2D3342] hover:bg-[#161B22] text-[#8B949E] hover:text-white rounded-lg text-sm font-medium transition-colors">
              <Plus size={14} /> Add Subject
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {loading ? (
            <div className="p-4 text-sm text-[#8B949E]">Loading...</div>
          ) : (
            subjects.map(subject => (
              <div key={subject._id} className="flex flex-col">
                <div className={`flex items-center gap-2 p-2 rounded-lg group ${expandedSubject === subject._id ? 'bg-[#1C202B]' : 'hover:bg-[#161B22]'}`}>
                  <button onClick={() => toggleSubject(subject)} className="flex items-center gap-2 flex-1 text-left">
                    {expandedSubject === subject._id ? <ChevronDown size={14} className="text-[#8B949E]" /> : <ChevronRight size={14} className="text-[#8B949E]" />}
                    <span className="font-semibold text-sm text-white">{subject.name}</span>
                  </button>
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                    <button onClick={() => { setEditingSubjectId(subject._id); setSubjectForm({ name: subject.name }); }} className="text-[#8B949E] hover:text-white p-1"><Pencil size={12} /></button>
                    <button onClick={() => handleDeleteSubject(subject._id, subject.name)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={12} /></button>
                  </div>
                </div>
                
                {editingSubjectId === subject._id && (
                  <div className="ml-6 mr-2 mb-2">
                    <InlineForm onSave={handleSaveSubjectEdit} onCancel={() => setEditingSubjectId(null)}>
                      <input value={subjectForm.name} onChange={e => setSubjectForm(f => ({ ...f, name: e.target.value }))} className="bg-[#111113] border border-[#2D3342] text-xs text-white rounded-md px-2 py-1 outline-none" />
                    </InlineForm>
                  </div>
                )}

                {expandedSubject === subject._id && (
                  <div className="ml-4 pl-2 border-l border-[#2D3342] my-1 flex flex-col gap-0.5">
                    {(chapters[subject._id] || []).map(chap => (
                      <div key={chap._id} className="flex items-center justify-between group">
                        <Link 
                          to={`/admin-portal/content/chapters/${chap._id}?subject=${subject._id}`} 
                          className={`block px-2 py-1 text-[11px] rounded transition-colors w-full ${id === chap._id ? 'text-[#4375FF] font-medium bg-[#4375FF]/10' : 'text-[#8B949E] hover:text-white hover:bg-[#1C202B]'}`}
                        >
                          <span className="truncate block max-w-[180px]">{chap.title}</span>
                        </Link>
                        <button onClick={() => handleDeleteChapter(subject._id, chap._id, chap.title)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-1">
                          <Trash2 size={10} />
                        </button>
                      </div>
                    ))}
                    <Link to={`/admin-portal/content/chapters/new?subject=${subject._id}`} onClick={() => refreshChapters(subject._id)} className="flex items-center gap-1 px-2 py-1 text-[11px] text-[#4375FF] hover:underline mt-1">
                      <Plus size={10} /> Add Chapter
                    </Link>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </aside>

      {/* ── MIDDLE COLUMN: CHAPTER EDITOR ── */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0A0A0A] relative z-0">
        {!id ? (
          <div className="flex-1 flex items-center justify-center text-[#8B949E] flex-col gap-4">
            <div className="w-16 h-16 rounded-full bg-[#1C202B] flex items-center justify-center">
              <Type size={24} className="text-[#4375FF]" />
            </div>
            <p>Select a chapter from the curriculum tree or create a new one.</p>
          </div>
        ) : !chapterLoaded ? (
          <div className="flex-1 flex items-center justify-center text-[#8B949E]">Loading chapter...</div>
        ) : (
          <>
            <div className="px-8 py-5 border-b border-[#1C202B] flex flex-col gap-2 bg-[#0E1015]">
               {breadcrumb && (
                <div className="flex items-center gap-2 text-[13px] font-mono tracking-wide text-[#8B949E]">
                  <span className="text-white">Subjects</span>
                  <ChevronRight size={12} />
                  <span className="text-white font-medium">{breadcrumb.subjectName}</span>
                </div>
               )}
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-10 lg:px-16 pb-32 custom-scrollbar">
              <input
                value={chapter.title}
                onChange={(e) => setChapter((c) => ({ ...c, title: e.target.value }))}
                placeholder="Chapter title"
                className="w-full text-4xl font-bold mb-6 outline-none bg-transparent placeholder-[#4C5363] text-white"
              />
              
              <div className="mb-6 pb-6 border-b border-[#1C202B]">
                <BlockEditor
                  editorKey={isEditingChapter ? id : 'new'}
                  initialContent={chapter.contentBlocks}
                  onChange={handleEditorChange}
                  onUploadImage={async (file) => {
                    const { data } = await blogApi.uploadImage(file);
                    return data.url;
                  }}
                  minHeight="50vh"
                />
              </div>

              {/* Recently Modified Chapters (Matches mockup) */}
              {activeSubjectId && chapters[activeSubjectId] && chapters[activeSubjectId].length > 0 && (
                <div className="mt-12">
                  <h3 className="text-sm font-bold text-white mb-4">Recently Modified Chapters</h3>
                  <div className="border border-[#1C202B] rounded-xl overflow-hidden bg-[#0E1015]">
                    {chapters[activeSubjectId].map((c, i) => (
                      <Link 
                        key={c._id} 
                        to={`/admin-portal/content/chapters/${c._id}?subject=${activeSubjectId}`}
                        className={`flex items-center justify-between p-4 hover:bg-[#161B22] transition-colors ${i !== chapters[activeSubjectId].length - 1 ? 'border-b border-[#1C202B]' : ''}`}
                      >
                        <span className="text-sm text-white font-medium">{c.title}</span>
                        <span className="text-xs text-[#8B949E]">{c.estimatedMinutes} mins read</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* ── RIGHT SIDEBAR: SETTINGS ── */}
      {id && chapterLoaded && (
        <aside className="w-[300px] flex-shrink-0 border-l border-[#1C202B] bg-[#0E1015] flex flex-col h-full overflow-y-auto custom-scrollbar z-10">
          <div className="p-6 flex flex-col gap-8">
            
            {/* Status & Actions */}
            <div>
              <h3 className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider mb-4">Status & Visibility</h3>
              
              <div className="flex items-center justify-between p-3 border border-[#2D3342] rounded-xl bg-[#111113] mb-4">
                <span className="text-sm text-white font-medium">Free Preview</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={chapter.isFreePreview} onChange={() => setChapter(c => ({...c, isFreePreview: !c.isFreePreview}))} />
                  <div className="w-9 h-5 bg-[#2D3342] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#4375FF]"></div>
                </label>
              </div>
              <p className="text-[11px] text-[#8B949E] mb-6">Allow non-enrolled users to read this chapter.</p>

              <div className="flex gap-3">
                <button 
                  onClick={handleSaveChapter}
                  disabled={savingChapter}
                  className="flex-1 py-2.5 rounded-xl border border-[#2D3342] text-sm font-medium hover:bg-[#161B22] text-white transition-colors"
                >
                  Save Draft
                </button>
                <button 
                  onClick={handleSaveChapter}
                  disabled={savingChapter}
                  className="flex-1 py-2.5 rounded-xl bg-[#4375FF] text-white text-sm font-medium hover:bg-[#3460E0] transition-colors"
                >
                  {savingChapter ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </div>

            <hr className="border-[#1C202B]" />

            {/* Metadata */}
            <div>
              <h3 className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider mb-4">Metadata</h3>
              
              <div className="mb-4">
                <label className="text-xs text-[#8B949E] block mb-1.5">Estimated Read Time</label>
                <div className="relative">
                  <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]" />
                  <input 
                    type="number" 
                    value={chapter.estimatedMinutes} 
                    onChange={e => setChapter(c => ({...c, estimatedMinutes: Number(e.target.value)}))}
                    className="w-full bg-[#111113] border border-[#2D3342] rounded-lg py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-[#4375FF]"
                  />
                </div>
              </div>
            </div>

            <hr className="border-[#1C202B]" />

            {/* Tags */}
            <div>
              <h3 className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider mb-4">Tags</h3>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {chapter.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 bg-[#1C202B] text-xs text-[#C9D1D9] px-2 py-1 rounded-md font-mono">
                    #{tag}
                    <button onClick={() => handleRemoveTag(tag)} className="text-[#8B949E] hover:text-white"><X size={10} /></button>
                  </span>
                ))}
              </div>
              
              <div className="relative">
                <Plus size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]" />
                <input 
                  type="text" 
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Add Tag (press Enter)"
                  className="w-full bg-[#111113] border border-[#2D3342] rounded-lg py-1.5 pl-8 pr-3 text-xs text-white outline-none focus:border-[#4375FF]"
                />
              </div>
            </div>

            <hr className="border-[#1C202B]" />

            {/* Cover Image */}
            <div>
              <h3 className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider mb-4">Cover Image</h3>
              {chapter.coverImage ? (
                <div className="relative rounded-xl overflow-hidden h-32 border border-[#2D3342]">
                  <img src={chapter.coverImage} alt="Cover" className="w-full h-full object-cover" />
                  <button onClick={() => setChapter(c => ({...c, coverImage: ''}))} className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-[#2D3342] border-dashed rounded-xl cursor-pointer hover:bg-[#161B22] hover:border-[#4375FF] transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-[#8B949E]">
                    <ImageIcon size={20} className="mb-2" />
                    <p className="text-xs">Click to upload cover</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} />
                </label>
              )}
            </div>

          </div>
        </aside>
      )}

      {toast && <UndoToast message={toast.message} onUndo={toast.onUndo} onDismiss={dismissToast} />}
    </div>
  );
};

export default AdminContentStudio;
