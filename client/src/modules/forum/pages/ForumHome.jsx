import { useEffect, useState } from 'react';
import { Search, MessagesSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { forumApi } from '../api/forum';

const ForumHome = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [categories, setCategories] = useState([]);
  const [recentTopics, setRecentTopics] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setIsLoading(true);
      const res = await forumApi.getRecentTopics();
      setRecentTopics(res.data || []);
      setIsLoading(false);
      return;
    }
    setIsSearching(true);
    setIsLoading(true);
    try {
      const res = await forumApi.searchTopics(searchQuery);
      setRecentTopics(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
      setIsLoading(false);
    }
  };

  const formatRelativeTime = (dateStr) => {
    const diffMs = new Date() - new Date(dateStr);
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  const displayedTopics = selectedCategory 
    ? recentTopics.filter(t => (t.category?._id || t.category) === selectedCategory)
    : recentTopics;

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
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans pb-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10">
        
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Column: Sidebar */}
          <div className="lg:col-span-3 flex flex-col gap-8 hidden md:flex">
            <div>
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4 ml-3">Categories</h3>
              <div className="flex flex-col gap-1">
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg font-medium text-left ${!selectedCategory ? 'bg-[#abc4ff] text-[#0a0a0a]' : 'text-gray-400 hover:text-white hover:bg-white/5 transition-colors'}`}
                >
                  <span className="material-symbols-outlined text-[20px]">grid_view</span> All Threads
                </button>
                {categories.map(cat => (
                  <button 
                    key={cat._id}
                    onClick={() => setSelectedCategory(cat._id)}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg font-medium text-left ${selectedCategory === cat._id ? 'bg-[#abc4ff] text-[#0a0a0a]' : 'text-gray-400 hover:text-white hover:bg-white/5 transition-colors'}`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {cat.slug === 'general' ? 'chat_bubble' : cat.slug === 'q-a' ? 'contact_support' : 'campaign'}
                    </span> 
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4 ml-3">My Activity</h3>
              <div className="flex flex-col gap-1">
                <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">star</span> Following
                </button>
                <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">history</span> Recent
                </button>
              </div>
            </div>
          </div>

          {/* Center Column: Main Feed */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-white tracking-tight">Community Forum</h1>
              <button onClick={() => navigate('/forum/create')} className="flex items-center gap-2 bg-[#abc4ff] text-[#0a0a0a] px-4 py-2 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity">
                <span className="material-symbols-outlined text-[18px]">add</span> New Discussion
              </button>
            </div>

            {/* Search Input Bar */}
            <form onSubmit={handleSearch} className="mb-6 flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-[#131315] focus-within:border-[#abc4ff] transition-colors text-left">
              <Search size={18} className="text-gray-500 shrink-0 ml-1" />
              <input 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search topics by title or keyword..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-gray-500 focus:ring-0"
              />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => {
                    setSearchQuery('');
                    setIsLoading(true);
                    forumApi.getRecentTopics().then(res => setRecentTopics(res.data || [])).finally(() => setIsLoading(false));
                  }} 
                  className="text-xs text-gray-500 hover:text-white px-2"
                >
                  Clear
                </button>
              )}
            </form>
            
            <div className="flex flex-col gap-4">
              {isLoading ? (
                <div className="flex flex-col gap-4">
                  {[1, 2, 3, 4].map(i => <div key={i} className="h-32 rounded-xl bg-white/5 animate-pulse border border-white/5" />)}
                </div>
              ) : displayedTopics.length === 0 ? (
                <div className="p-12 text-center text-gray-500 flex flex-col items-center border border-white/5 rounded-xl bg-[#131315]">
                  <MessagesSquare size={48} className="mb-4 opacity-20" />
                  <p>No conversations yet.</p>
                </div>
              ) : (
                <>
                  {displayedTopics.map(topic => (
                    <div key={topic._id} className="p-5 rounded-xl border border-white/5 bg-[#131315] hover:bg-white/5 transition-colors flex gap-5 cursor-pointer text-left" onClick={() => navigate(`/forum/${topic._id}`)}>
                      {/* Voting */}
                      <div className="flex flex-col items-center gap-1">
                        <button className="text-gray-500 hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-[24px]">arrow_drop_up</span>
                        </button>
                        <span className="font-bold text-white text-sm">{topic.likes?.length || 0}</span>
                        <button className="text-gray-500 hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-[24px]">arrow_drop_down</span>
                        </button>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="bg-[#1f2937] text-[#9ca3af] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                            {topic.category?.name || 'General'}
                          </span>
                          <span className="text-[12px] text-gray-400">
                            Posted by <span className="text-white font-medium">{topic.author?.name || 'Anonymous'}</span> • {formatRelativeTime(topic.createdAt)}
                          </span>
                        </div>
                        <h2 className="text-lg font-bold text-white mb-2 leading-tight">
                          {topic.title}
                        </h2>
                        <p className="text-sm text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                          {topic.content?.substring(0, 150) || 'No description provided.'}
                        </p>
                        
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-2">
                            {topic.tags?.slice(0, 3).map(tag => (
                              <span key={tag} className="bg-white/5 text-gray-400 px-2 py-0.5 rounded text-[11px] font-medium border border-white/10">
                                #{tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-4 text-gray-400 text-[12px] font-medium">
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">chat_bubble</span> {topic.replies?.length || 0}</span>
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">visibility</span> 1.2k</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-6 pb-2 flex justify-center">
                    <button className="text-[#abc4ff] font-bold text-sm hover:underline">
                      Load more discussions...
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Active Discussions & Stats */}
          <div className="lg:col-span-3 hidden lg:flex flex-col gap-8">
            <div className="rounded-xl border border-white/5 bg-[#131315] p-5">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4">Active Discussions</h3>
              <div className="flex flex-col gap-5">
                <div>
                  <h4 className="font-semibold text-white text-sm mb-1 line-clamp-2 cursor-pointer hover:text-[#6366F1] transition-colors">How to build a custom CLI with Node.js and TUI libraries?</h4>
                  <p className="text-[11px] text-gray-500">24 new comments today</p>
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm mb-1 line-clamp-2 cursor-pointer hover:text-[#6366F1] transition-colors">Migrating from Prisma to Drizzle: A post-mortem.</h4>
                  <p className="text-[11px] text-gray-500">12 new comments today</p>
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm mb-1 line-clamp-2 cursor-pointer hover:text-[#6366F1] transition-colors">Best practices for AuthN in Next.js App Router?</h4>
                  <p className="text-[11px] text-gray-500">8 new comments today</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-[#131315] p-5">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4">Top Contributors</h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-900 border border-blue-700 flex items-center justify-center text-xs font-bold text-white">AR</div>
                    <div>
                      <p className="text-[13px] font-semibold text-white">Alex River</p>
                      <p className="text-[11px] text-gray-400">2.4k Karma</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[#abc4ff] text-[18px]">workspace_premium</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-900 border border-purple-700 flex items-center justify-center text-xs font-bold text-white">SC</div>
                    <div>
                      <p className="text-[13px] font-semibold text-white">Sarah Connor</p>
                      <p className="text-[11px] text-gray-400">1.9k Karma</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-900 border border-orange-700 flex items-center justify-center text-xs font-bold text-white">MA</div>
                    <div>
                      <p className="text-[13px] font-semibold text-white">Marcus Aurelius</p>
                      <p className="text-[11px] text-gray-400">1.5k Karma</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-1 flex flex-col gap-3 text-sm text-gray-400">
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span>Active users</span>
                <span className="font-bold text-white">1,204</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span>Threads today</span>
                <span className="font-bold text-white">142</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ForumHome;
