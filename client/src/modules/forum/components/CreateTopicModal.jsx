import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import MarkdownEditor from '../../core/components/ui/MarkdownEditor';
import { forumApi } from '../../../api/forum';

const CreateTopicModal = ({ isOpen, onClose, categoryId, onTopicCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    
    setIsSubmitting(true);
    try {
      const res = await forumApi.createTopic({ title, content, categoryId });
      setTitle('');
      setContent('');
      onTopicCreated(res.data);
    } catch (err) {
      console.error('Failed to create topic:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className="w-full max-w-3xl rounded-2xl border shadow-2xl flex flex-col max-h-[90vh]"
        style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-xl font-bold">Create New Topic</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What is your topic about?"
              className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              required
            />
          </div>
          
          <div className="flex-1 min-h-[300px] flex flex-col">
            <label className="block text-sm font-medium mb-1">Content (Markdown supported)</label>
            <div className="flex-1 border rounded-xl overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              <MarkdownEditor value={content} onChange={setContent} />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-4">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 size={18} className="animate-spin" />}
              Post Topic
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTopicModal;
