import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Image as ImageIcon, X, Save, Send, Eye, CloudUpload, Settings, Plus, LayoutList, Calendar, Link as LinkIcon, Image, Code, List, ListOrdered, Quote, Bot, Edit2, Trash2, ArrowRight } from 'lucide-react';
import { blogApi } from '../api/blog';
import { seriesApi } from '../api/series';
import BlockEditor from '../../core/components/ui/BlockEditor';

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
  publishedAt: '',
};

const PAGE_SIZE = 5;

const AdminBlogStudio = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id && id !== 'new';
  const fileInputRef = useRef(null);

  // Editor State
  const [post, setPost] = useState(emptyPost);
  const [seriesList, setSeriesList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(!isEditing);

  // List State
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    seriesApi.getAll().then(({ data }) => setSeriesList(data.series)).catch(() => {});
  }, []);

  // Fetch blogs for table
  const loadBlogs = (p = page) => {
    setLoadingBlogs(true);
    let statusFilter = undefined;
    if (filter === 'Drafts') statusFilter = 'draft';
    if (filter === 'Published') statusFilter = 'published';
    
    // Note: Assuming getAllAdmin supports filtering by status if needed, or we just fetch all
    blogApi
      .getAllAdmin({ page: p, limit: PAGE_SIZE })
      .then(({ data }) => {
        let filteredBlogs = data.blogs;
        if (statusFilter) {
           filteredBlogs = filteredBlogs.filter(b => b.status === statusFilter);
        }
        setBlogs(filteredBlogs);
        setPages(data.pages || 1);
      })
      .finally(() => setLoadingBlogs(false));
  };

  useEffect(() => {
    loadBlogs(page);
  }, [page, filter]);

  // Fetch single blog for editor
  useEffect(() => {
    if (!isEditing) {
      setPost(emptyPost);
      setLoaded(true);
      return;
    }
    setLoaded(false);
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
        publishedAt: found.publishedAt ? new Date(found.publishedAt).toISOString().slice(0, 16) : '',
      });
      setLoaded(true);
    }).catch((err) => {
      console.error(err);
      setLoaded(true);
    });
  }, [id, isEditing]);

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
    if (post.publishedAt) {
      payload.publishedAt = new Date(post.publishedAt).toISOString();
    } else {
      payload.publishedAt = new Date().toISOString();
    }
    
    // Split tags string to array
    payload.tags = post.tags ? post.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

    try {
      if (isEditing) {
        await blogApi.update(id, payload);
      } else {
        await blogApi.create(payload);
      }
      setPost(emptyPost);
      navigate('/admin-portal/blogs'); // Reset editor URL
      loadBlogs(); // Refresh table
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save post.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (deleteId) => {
    if (!window.confirm('Delete this post permanently?')) return;
    await blogApi.remove(deleteId);
    if (id === deleteId) {
      navigate('/admin-portal/blogs');
    }
    loadBlogs();
  };

  if (!loaded) return <p className="text-on-surface-variant p-10">Loading editor...</p>;

  return (
    <div className="max-w-[1400px] mx-auto pb-20 p-6 lg:p-10">
      
      {/* Header section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[32px] font-display font-bold text-white mb-2">Content Studio</h1>
        </div>
        <div className="flex items-center gap-4">
          {isEditing && (
             <button 
               onClick={() => navigate('/admin-portal/blogs')}
               className="px-4 py-2 text-sm text-on-surface-variant hover:text-white transition-colors"
             >
               Clear Editor
             </button>
          )}
          <button 
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#1C202B] hover:bg-[#2D3342] border border-[#2D3342] text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Eye size={16} /> Save Draft
          </button>
          <button 
            onClick={() => handleSave('published')}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-[#4375FF] hover:bg-[#3460E0] text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-[#4375FF]/20"
          >
            <Send size={16} /> Publish Now
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Editor Area) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Title & Metadata Card */}
          <div className="bg-[#111113] border border-[#1C202B] rounded-xl p-8 relative overflow-hidden">
            <input
              value={post.title}
              onChange={(e) => setPost((p) => ({ ...p, title: e.target.value }))}
              placeholder="Post Title..."
              className="w-full text-4xl font-display font-bold mb-4 bg-transparent outline-none text-white placeholder-[#2D3342]"
            />
            <input
              value={post.subtitle}
              onChange={(e) => setPost((p) => ({ ...p, subtitle: e.target.value }))}
              placeholder="Subtitle or brief summary (optional)"
              className="w-full text-lg mb-8 bg-transparent outline-none text-on-surface-variant placeholder-[#2D3342]"
            />
            
            <div className="flex items-center gap-3 border-t border-[#1C202B] pt-6">
              <span className="flex items-center gap-1.5 text-xs text-on-surface-variant whitespace-nowrap">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg> Tags:
              </span>
              <input
                value={post.tags}
                onChange={(e) => setPost((p) => ({ ...p, tags: e.target.value }))}
                placeholder="Comma separated (e.g. Next.js, Architecture)"
                className="w-full bg-transparent outline-none text-sm text-white placeholder-[#2D3342]"
              />
            </div>
            
            {/* Soft gradient border top */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#4375FF] via-[#c084fc] to-transparent opacity-30"></div>
          </div>

          {/* Block Editor Wrapper */}
          <div className="bg-[#111113] border border-[#1C202B] rounded-xl overflow-hidden flex flex-col">
            {/* Custom Mock Toolbar matching screenshot */}
            <div className="h-12 border-b border-[#1C202B] bg-[#161B22] flex items-center px-4 gap-4 text-on-surface-variant overflow-x-auto">
              <button className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 hover:bg-[#1C202B] rounded">
                Paragraph <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              <div className="w-px h-4 bg-[#2D3342] shrink-0"></div>
              <div className="flex items-center gap-1 shrink-0">
                <button className="p-1.5 hover:bg-[#1C202B] rounded font-serif font-bold text-[14px]">B</button>
                <button className="p-1.5 hover:bg-[#1C202B] rounded font-serif italic text-[14px]">I</button>
                <button className="p-1.5 hover:bg-[#1C202B] rounded font-serif underline text-[14px]">U</button>
                <button className="p-1.5 hover:bg-[#1C202B] rounded line-through text-[14px]">S</button>
              </div>
              <div className="w-px h-4 bg-[#2D3342] shrink-0"></div>
              <div className="flex items-center gap-1 shrink-0">
                <button className="p-1.5 hover:bg-[#1C202B] rounded"><LinkIcon size={14} /></button>
                <button className="p-1.5 hover:bg-[#1C202B] rounded"><Image size={14} /></button>
                <button className="p-1.5 hover:bg-[#1C202B] rounded"><Code size={14} /></button>
              </div>
              <div className="w-px h-4 bg-[#2D3342] shrink-0"></div>
              <div className="flex items-center gap-1 shrink-0">
                <button className="p-1.5 hover:bg-[#1C202B] rounded"><List size={14} /></button>
                <button className="p-1.5 hover:bg-[#1C202B] rounded"><ListOrdered size={14} /></button>
                <button className="p-1.5 hover:bg-[#1C202B] rounded"><Quote size={14} /></button>
              </div>
            </div>
            
            <div className="p-8 min-h-[500px]">
              <BlockEditor
                editorKey={isEditing ? id : 'new'}
                initialContent={post.contentBlocks}
                onChange={handleEditorChange}
                onUploadImage={async (file) => {
                  const { data } = await blogApi.uploadImage(file);
                  return data.url;
                }}
              />
            </div>
          </div>
          
        </div>

        {/* Right Column (Sidebar Settings) */}
        <div className="flex flex-col gap-6">
          
          {/* Publishing Card */}
          <div className="bg-[#111113] border border-[#1C202B] rounded-xl p-6">
            <h3 className="text-[14px] font-bold text-white mb-6 flex items-center gap-2">
              <Settings size={16} className="text-[#abc4ff]" /> Publishing
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="text-[11px] font-mono text-on-surface-variant block mb-2">Category</label>
                <input 
                  value={post.category}
                  onChange={(e) => setPost((p) => ({ ...p, category: e.target.value }))}
                  placeholder="Engineering Blog"
                  className="w-full bg-[#0E1015] border border-[#1C202B] text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#4375FF]"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-on-surface-variant block mb-2">Series (Optional)</label>
                <select 
                  value={post.series}
                  onChange={(e) => setPost((p) => ({ ...p, series: e.target.value }))}
                  className="w-full bg-[#0E1015] border border-[#1C202B] text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#4375FF]"
                >
                  <option value="">None</option>
                  {seriesList.map(s => (
                    <option key={s._id} value={s._id}>{s.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-on-surface-variant block mb-2">Schedule Date</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input 
                    type="datetime-local"
                    value={post.publishedAt}
                    onChange={(e) => setPost((p) => ({ ...p, publishedAt: e.target.value }))}
                    className="w-full bg-[#0E1015] border border-[#1C202B] text-white text-sm rounded-lg pl-9 pr-3 py-2.5 outline-none focus:border-[#4375FF]"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cover Image Card */}
          <div className="bg-[#111113] border border-[#1C202B] rounded-xl p-6">
            <h3 className="text-[14px] font-bold text-white mb-6 flex items-center gap-2">
              <ImageIcon size={16} className="text-[#38bdf8]" /> Cover Image
            </h3>
            
            {post.coverImage ? (
              <div className="relative rounded-lg overflow-hidden group">
                <img src={post.coverImage} alt="Cover" className="w-full h-40 object-cover" />
                <button
                  onClick={() => setPost((p) => ({ ...p, coverImage: '' }))}
                  className="absolute top-2 right-2 p-1.5 bg-[#0E1015]/80 hover:bg-[#0E1015] text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full h-40 rounded-xl border border-dashed border-[#2D3342] hover:border-[#4375FF] hover:bg-[#4375FF]/5 flex flex-col items-center justify-center gap-3 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-[#1C202B] flex items-center justify-center group-hover:bg-[#4375FF]/20 group-hover:text-[#4375FF] text-on-surface-variant transition-colors">
                  <CloudUpload size={18} />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-white mb-1">{uploading ? 'Uploading...' : 'Click to upload or drag & drop'}</p>
                  <p className="text-[10px] text-on-surface-variant font-mono">SVG, PNG, JPG or GIF (max. 5MB)</p>
                  <p className="text-[10px] text-on-surface-variant font-mono">Recommended: 1200 x 630px</p>
                </div>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImageUpload} />
          </div>

          {/* SEO Meta Card */}
          <div className="bg-[#111113] border border-[#1C202B] rounded-xl p-6 flex justify-between items-center cursor-pointer hover:border-[#4375FF] transition-colors">
            <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#c084fc]"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> SEO Meta
            </h3>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-on-surface-variant"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>

        </div>
      </div>

      {/* Recent Content Table (Bottom Area) */}
      <div className="mt-12 pt-12 border-t border-[#1C202B]">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-[20px] font-display font-bold text-white">Recent Content</h2>
          <div className="flex bg-[#111113] border border-[#1C202B] rounded-lg p-1">
            <button 
              onClick={() => setFilter('All')}
              className={`px-4 py-1.5 text-xs rounded-md shadow-sm transition-colors ${filter === 'All' ? 'bg-[#1C202B] text-white' : 'text-on-surface-variant hover:text-white'}`}
            >All</button>
            <button 
              onClick={() => setFilter('Drafts')}
              className={`px-4 py-1.5 text-xs rounded-md transition-colors ${filter === 'Drafts' ? 'bg-[#1C202B] text-white' : 'text-on-surface-variant hover:text-white'}`}
            >Drafts</button>
            <button 
              onClick={() => setFilter('Published')}
              className={`px-4 py-1.5 text-xs rounded-md transition-colors ${filter === 'Published' ? 'bg-[#1C202B] text-white' : 'text-on-surface-variant hover:text-white'}`}
            >Published</button>
          </div>
        </div>

        <div className="bg-[#111113] border border-[#1C202B] rounded-xl overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] font-mono text-on-surface-variant uppercase bg-[#161B22]/50 border-b border-[#1C202B]">
              <tr>
                <th className="px-6 py-4 font-medium">Title</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Engagement</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C202B]">
              {loadingBlogs ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-on-surface-variant text-sm">Loading contents...</td>
                </tr>
              ) : blogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-on-surface-variant text-sm">No blogs found.</td>
                </tr>
              ) : blogs.map(b => (
                <tr key={b._id} className="hover:bg-[#161B22] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-[#1C202B] flex items-center justify-center shrink-0">
                        {b.coverImage ? (
                          <img src={b.coverImage} alt="" className="w-full h-full object-cover rounded opacity-80" />
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#38bdf8]"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white mb-0.5 truncate max-w-sm">{b.title}</p>
                        <p className="text-[10px] text-on-surface-variant flex items-center gap-1">
                           <span className="truncate">{b.author?.name || 'Admin User'}</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit ${
                      b.status === 'published' ? 'bg-[#0C4A6E] text-[#38bdf8]' : 'bg-[#2D3342] text-[#D4D4D8]'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${b.status === 'published' ? 'bg-[#38bdf8]' : 'bg-[#D4D4D8]'}`}></span> {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-on-surface-variant">
                    {new Date(b.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-on-surface-variant flex items-center gap-3 h-[72px]">
                    <span className="flex items-center gap-1" title="Views"><Eye size={12} /> {b.views || 0}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => navigate(`/admin-portal/blogs/${b._id}`)} className="p-1.5 text-on-surface-variant hover:text-white hover:bg-[#1C202B] rounded"><Edit2 size={14} /></button>
                       <button onClick={() => handleDelete(b._id)} className="p-1.5 text-on-surface-variant hover:text-red-400 hover:bg-[#1C202B] rounded"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination controls */}
          {pages > 1 && (
            <div className="p-4 border-t border-[#1C202B] flex items-center justify-between text-[11px] text-on-surface-variant font-mono">
              <span>Page {page} of {pages}</span>
              <div className="flex gap-1">
                <button 
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 flex items-center justify-center rounded bg-[#161B22] hover:text-white border border-[#1C202B] disabled:opacity-50"
                >Prev</button>
                <button 
                  disabled={page >= pages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 flex items-center justify-center rounded bg-[#161B22] hover:text-white border border-[#1C202B] disabled:opacity-50"
                >Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default AdminBlogStudio;
