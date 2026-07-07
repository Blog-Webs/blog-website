import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Send, Sparkles, Loader2 } from 'lucide-react';
import { forumApi } from '../api/forum';
import { useAuth } from '../../core/context/AuthContext';
import BlockEditor from '../../core/components/ui/BlockEditor';

const CreateTopicPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingCats, setLoadingCats] = useState(true);

  useEffect(() => {
    forumApi.getCategories()
      .then(({ data }) => {
        setCategories(data || []);
        if (data && data.length > 0) {
          setCategoryId(data[0]._id);
        }
      })
      .catch(err => console.error('Failed to load categories:', err))
      .finally(() => setLoadingCats(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !categoryId) return;
    
    setIsSubmitting(true);
    try {
      const res = await forumApi.createTopic({ title, content, categoryId });
      // Navigate to the newly created topic details page
      navigate(`/forum/topic/${res.data.slug}`);
    } catch (err) {
      console.error('Failed to create topic:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 bg-[#0a0a0a] text-gray-400">
        <p className="mb-4">You must be logged in to start a new discussion.</p>
        <button 
          onClick={() => navigate('/forum')}
          className="px-6 py-2.5 rounded-xl bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-all active:scale-95"
        >
          Back to Forum
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E1015] text-on-surface font-sans">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 pt-24 pb-32 text-left">
        
        {/* Navigation Header */}
        <div className="mb-8">
          <Link 
            to="/forum"
            className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface mb-6 transition-colors duration-200"
          >
            <ChevronLeft size={16} /> Back to Forum
          </Link>
          <div className="flex items-center gap-3">
            <Sparkles className="text-[#abc4ff]" size={24} />
            <h1 className="text-3xl font-display font-bold leading-tight text-white tracking-tight">
              Start a New Discussion
            </h1>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* Topic Title */}
          <div>
            <label className="block text-xs font-bold font-mono tracking-widest text-on-surface-variant uppercase mb-2">Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What is your topic about?"
              className="w-full px-5 py-3.5 rounded-xl border border-outline-variant/10 bg-[#161B22] text-white focus:outline-none focus:border-[#4375FF] transition-all"
              required
            />
          </div>

          {/* Subject/Category Selector */}
          <div>
            <label className="block text-xs font-bold font-mono tracking-widest text-on-surface-variant uppercase mb-2">Category</label>
            {loadingCats ? (
              <div className="h-12 w-full rounded-xl bg-[#161B22]/50 animate-pulse border border-outline-variant/10"></div>
            ) : (
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-5 py-3.5 rounded-xl border border-outline-variant/10 bg-[#161B22] text-white focus:outline-none focus:border-[#4375FF] transition-all cursor-pointer"
                required
              >
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id} className="bg-[#161B22] text-white">
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Description / Content Editor */}
          <div className="flex flex-col min-h-[400px]">
            <label className="block text-xs font-bold font-mono tracking-widest text-on-surface-variant uppercase mb-2">Content</label>
            <div className="flex-1 rounded-xl overflow-hidden bg-[#161B22] border border-outline-variant/10">
              <BlockEditor onChange={({ plainText }) => setContent(plainText)} minHeight="300px" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-4 pt-6 border-t border-outline-variant/10">
            <button 
              type="button"
              onClick={() => navigate('/forum')}
              className="px-6 py-2.5 rounded-xl font-bold text-sm text-on-surface-variant hover:text-white hover:bg-white/5 transition-all active:scale-95 duration-200"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim() || !categoryId}
              className="px-6 py-2.5 rounded-xl bg-[#abc4ff] hover:bg-[#b9cdff] text-[#0E1015] font-bold text-sm transition-all hover:scale-[1.03] active:scale-95 duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Post Discussion
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default CreateTopicPage;
