import { useEffect, useState } from 'react';
import { Search, MessagesSquare } from 'lucide-react';
import { forumApi } from '../api/forum';
import CategoryCard from '../components/CategoryCard';
import TopicRow from '../components/TopicRow';

const ForumHome = () => {
  const [categories, setCategories] = useState([]);
  const [recentTopics, setRecentTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, topicsRes] = await Promise.all([
          forumApi.getCategories(),
          forumApi.getRecentTopics()
        ]);
        setCategories(categoriesRes.data);
        setRecentTopics(topicsRes.data);
      } catch (err) {
        console.error('Failed to fetch forum data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section (Superhuman Style) */}
      <div 
        className="relative overflow-hidden w-full px-4 py-24 flex flex-col items-center justify-center text-center"
        style={{ backgroundColor: '#2C1B2E', color: 'white' }}
      >
        {/* Animated Background Blobs */}
        <div 
          className="absolute top-0 left-0 w-96 h-96 rounded-full mix-blend-screen filter blur-[80px] opacity-70 animate-blob"
          style={{ backgroundColor: '#8B5CF6', transform: 'translate(-30%, -30%)' }}
        />
        <div 
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full mix-blend-screen filter blur-[80px] opacity-70 animate-blob animation-delay-2000"
          style={{ backgroundColor: '#10B981', transform: 'translate(30%, 30%)' }}
        />
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-normal tracking-tight mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
            Welcome to the<br />
            <span className="font-semibold">httpTechNex Community</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto font-light">
            Discover, discuss, and dive deeper with our powerful network of developers.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative mb-8 group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
              <Search size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-lg shadow-2xl"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-all hover:scale-105" style={{ backgroundColor: '#6366F1', color: 'white' }}>
              <span className="text-lg">⛳</span> Get Started
            </button>
            <button className="px-8 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 font-medium flex items-center gap-2 transition-all hover:bg-white/20 hover:scale-105">
              <span className="text-lg">?</span> Ask the Community
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-16 grid lg:grid-cols-12 gap-8">
        
        {/* Left Column: Categories */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-2xl font-light tracking-tight">Categories</h2>
          </div>
          
          {isLoading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-2xl bg-black/5 dark:bg-white/5 animate-pulse" />)}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {categories.map(category => (
                <div key={category._id} className="bg-surface rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <CategoryCard category={category} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Top Conversations */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-2xl font-light tracking-tight">Top Conversations</h2>
          </div>
          
          <div className="bg-surface rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            {isLoading ? (
              <div className="flex flex-col">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-24 border-b bg-black/5 dark:bg-white/5 animate-pulse" style={{ borderColor: 'var(--border)' }} />)}
              </div>
            ) : recentTopics.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                <MessagesSquare size={48} className="mb-4 opacity-20" />
                <p>No conversations yet.</p>
              </div>
            ) : (
              <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
                {recentTopics.map(topic => (
                  <div key={topic._id} className="relative group">
                    <TopicRow topic={topic} />
                    {topic.category && (
                      <div className="absolute top-4 right-4 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {topic.category.name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ForumHome;
