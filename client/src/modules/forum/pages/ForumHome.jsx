import { useEffect, useState } from 'react';
import { MessagesSquare } from 'lucide-react';
import { forumApi } from '../api/forum';
import CategoryCard from '../components/CategoryCard';

const ForumHome = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await forumApi.getCategories();
        setCategories(res.data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6">
          <MessagesSquare size={32} />
        </div>
        <h1 className="text-4xl font-black font-mono-display mb-4">Community Forum</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Join the conversation, ask questions, and share your knowledge with the community.
        </p>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-40 rounded-2xl bg-black/5 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
          {categories.map(category => (
            <CategoryCard key={category._id} category={category} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ForumHome;
