import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, MessageCircle } from 'lucide-react';
import { forumApi } from '../api/forum';
import { useAuth } from '../../core/context/AuthContext';
import TopicRow from '../components/TopicRow';
import CreateTopicModal from '../components/CreateTopicModal';

const CategoryPage = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [category, setCategory] = useState(null);
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await forumApi.getCategoryBySlug(categorySlug);
        setCategory(res.data.category);
        setTopics(res.data.topics);
      } catch (err) {
        console.error('Failed to fetch category:', err);
        navigate('/forum');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategory();
  }, [categorySlug, navigate]);

  if (isLoading) {
    return <div className="p-12 text-center">Loading...</div>;
  }

  if (!category) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/forum" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ChevronLeft size={16} /> Back to Categories
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black font-mono-display mb-2">{category.name}</h1>
            <p className="text-muted-foreground">{category.description}</p>
          </div>
          <button 
            onClick={() => {
              if (!user) {
                // optionally trigger login modal or redirect
                alert('Please sign in to create a topic');
                return;
              }
              setIsModalOpen(true);
            }}
            className="shrink-0 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-lg shadow-primary/25"
          >
            <Plus size={20} />
            New Topic
          </button>
        </div>
      </div>

      {/* Topic List */}
      <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        {topics.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
            <MessageCircle size={48} className="mb-4 opacity-20" />
            <p>No topics yet. Be the first to start a conversation!</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {topics.map(topic => (
              <TopicRow key={topic._id} topic={topic} />
            ))}
          </div>
        )}
      </div>

      <CreateTopicModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categoryId={category._id}
        onTopicCreated={(newTopic) => {
          setTopics([newTopic, ...topics]);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default CategoryPage;
