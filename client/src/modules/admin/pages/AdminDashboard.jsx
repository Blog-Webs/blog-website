import { useState, useEffect } from 'react';
import { Users, Cpu, Server, Eye, ExternalLink, Plus, Edit2, Trash2, MessageSquare, Loader2, BookOpen } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { adminApi } from '../api/admin';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchStats = async () => {
    try {
      const { data } = await adminApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleDeleteBlog = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    setDeletingId(id);
    try {
      await adminApi.deleteBlog(id);
      await fetchStats();
    } catch (err) {
      alert(`Failed to delete blog: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[600px] text-on-surface-variant">
        <Loader2 size={36} className="animate-spin text-[#4375FF] mb-4" />
        <p className="font-mono text-sm">Connecting to HttpTechNex command grid...</p>
      </div>
    );
  }

  const publications = stats?.recentBlogs || [];
  const communityItems = stats?.communityPulse || [];
  const subjects = stats?.courseArchitecture || [];
  const health = stats?.systemHealth || { nodeUptime: '0m', dbState: 'Connected', memoryUsage: '0 MB' };

  return (
    <div className="p-6 lg:p-10 max-w-[1400px] mx-auto">
      
      {/* Page Header */}
      <div className="mb-10 flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Systems Status</h1>
          <p className="text-sm text-on-surface-variant w-full max-w-[800px] leading-relaxed">
            Manage your technical ecosystem, monitor workloads, and curate educational content across the HTTPTechNex grid.
          </p>
        </div>
        <Link
          to="/admin-portal/editor"
          className="px-5 py-2.5 bg-[#4375FF] hover:bg-[#3460E0] text-white font-medium text-xs font-mono tracking-wider uppercase rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-[#4375FF]/20"
        >
          <Plus size={16} /> Create New Post
        </Link>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Metric 1: Active Learners */}
        <div className="bg-[#111113] border border-[#1C202B] rounded-xl p-6 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#1C202B] flex items-center justify-center text-[#abc4ff]">
              <Users size={18} />
            </div>
            <span className="text-[10px] font-mono font-bold text-[#34D399]">Live DB Sync</span>
          </div>
          <div>
            <p className="text-[10px] font-mono tracking-widest text-on-surface-variant uppercase mb-1">Active Registered Learners</p>
            <p className="text-4xl font-display font-bold text-white tracking-tight">
              {(stats?.totalUsers || 0).toLocaleString()}
            </p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#abc4ff] opacity-[0.02] rounded-full blur-[30px] group-hover:opacity-[0.05] transition-opacity"></div>
        </div>

        {/* Metric 2: Publications Status */}
        <div className="bg-[#111113] border border-[#1C202B] rounded-xl p-6 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#1C202B] flex items-center justify-center text-[#38bdf8]">
              <Cpu size={18} />
            </div>
            <span className="text-[10px] font-mono font-bold text-[#38bdf8]">
              {stats?.draftBlogs || 0} Drafts Pending
            </span>
          </div>
          <div>
            <p className="text-[10px] font-mono tracking-widest text-on-surface-variant uppercase mb-1">Published Content</p>
            <p className="text-4xl font-display font-bold text-white tracking-tight">
              {stats?.publishedBlogs || 0} <span className="text-sm font-normal text-on-surface-variant">/ {stats?.totalBlogs || 0} total</span>
            </p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#38bdf8] opacity-[0.02] rounded-full blur-[30px] group-hover:opacity-[0.05] transition-opacity"></div>
        </div>

        {/* Metric 3: Newsletter Subscribers */}
        <div className="bg-[#111113] border border-[#1C202B] rounded-xl p-6 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#1C202B] flex items-center justify-center text-[#c084fc]">
              <Server size={18} />
            </div>
            <span className="text-[10px] font-mono font-bold text-[#c084fc]">Brevo Active</span>
          </div>
          <div>
            <p className="text-[10px] font-mono tracking-widest text-on-surface-variant uppercase mb-1">Active Subscribers</p>
            <p className="text-4xl font-display font-bold text-white tracking-tight">
              {(stats?.totalSubscribers || 0).toLocaleString()}
            </p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#c084fc] opacity-[0.02] rounded-full blur-[30px] group-hover:opacity-[0.05] transition-opacity"></div>
        </div>

      </div>

      {/* Middle Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Recent Publications Table (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-[#111113] border border-[#1C202B] rounded-xl flex flex-col">
          <div className="p-6 border-b border-[#1C202B] flex justify-between items-center">
            <div>
              <h2 className="text-lg font-display font-bold text-white">Recent Publications</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">Real-time blog and tutorial posts from your database.</p>
            </div>
            <Link to="/admin-portal/blogs" className="text-[11px] font-mono font-bold text-[#abc4ff] hover:text-[#b9cdff] flex items-center gap-1 transition-colors uppercase tracking-wide">
              View Archive <ExternalLink size={12} />
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            {publications.length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant text-sm font-mono">
                No publications found. Click "Create New Post" to publish your first article.
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] font-mono text-on-surface-variant uppercase bg-[#161B22]/50 border-b border-[#1C202B]">
                  <tr>
                    <th className="px-6 py-3 font-medium">Title</th>
                    <th className="px-6 py-3 font-medium">Category</th>
                    <th className="px-6 py-3 font-medium">Views</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C202B]">
                  {publications.map((pub) => (
                    <tr key={pub.id} className="hover:bg-[#161B22] transition-colors group">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-[#1C202B] flex items-center justify-center text-xs shrink-0">
                          {pub.icon}
                        </div>
                        <span className="font-medium text-white max-w-[220px] truncate" title={pub.title}>
                          {pub.title}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant">{pub.category}</td>
                      <td className="px-6 py-4 text-on-surface-variant flex items-center gap-1.5 mt-2">
                        <Eye size={12} /> {pub.engagement}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          pub.status === 'Published' ? 'bg-[#064E3B] text-[#34D399]' : 'bg-[#3F3F46] text-[#D4D4D8]'
                        }`}>
                          {pub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => navigate(`/admin-portal/editor/${pub.id}`)}
                            title="Edit Post"
                            className="p-1.5 text-on-surface-variant hover:text-white hover:bg-[#1C202B] rounded transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteBlog(pub.id, pub.title)}
                            disabled={deletingId === pub.id}
                            title="Delete Post"
                            className="p-1.5 text-on-surface-variant hover:text-red-400 hover:bg-[#1C202B] rounded transition-colors"
                          >
                            {deletingId === pub.id ? <Loader2 size={14} className="animate-spin text-red-400" /> : <Trash2 size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="p-4 border-t border-[#1C202B] flex items-center justify-between text-[11px] text-on-surface-variant font-mono">
            <span>Showing {publications.length} of {stats?.totalBlogs || 0} entries</span>
            <Link to="/admin-portal/blogs" className="hover:text-white underline">Manage all in Blog Studio &rarr;</Link>
          </div>
        </div>

        {/* Right Column Stack */}
        <div className="flex flex-col gap-6">
          
          {/* Real Backend System Status */}
          <div className="bg-[#111113] border border-[#1C202B] rounded-xl p-6">
            <h2 className="text-lg font-display font-bold text-white mb-4">Node.js Engine Health</h2>
            <div className="space-y-4">
              
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-white flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> MongoDB Atlas
                  </span>
                  <span className="text-[#34D399] font-bold">{health.dbState}</span>
                </div>
                <div className="h-1.5 w-full bg-[#1C202B] rounded-full overflow-hidden">
                  <div className="h-full bg-green-400 w-full"></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-white flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#38bdf8] rounded-full"></span> Server Uptime
                  </span>
                  <span className="text-on-surface-variant">{health.nodeUptime}</span>
                </div>
                <div className="h-1.5 w-full bg-[#1C202B] rounded-full overflow-hidden">
                  <div className="h-full bg-[#38bdf8] w-[95%]"></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-white flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#c084fc] rounded-full"></span> Heap Memory Usage
                  </span>
                  <span className="text-[#c084fc] font-bold">{health.memoryUsage}</span>
                </div>
                <div className="h-1.5 w-full bg-[#1C202B] rounded-full overflow-hidden">
                  <div className="h-full bg-[#c084fc] w-[50%]"></div>
                </div>
              </div>

            </div>
          </div>

          {/* Community Pulse & Help Requests */}
          <div className="bg-[#111113] border border-[#1C202B] rounded-xl p-6 relative">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-display font-bold text-white">Community Pulse</h2>
              {stats?.unreadContacts > 0 && (
                <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                  {stats.unreadContacts} Unread
                </span>
              )}
            </div>
            <p className="text-xs text-on-surface-variant mb-5">Latest user submissions requiring staff attention.</p>
            
            <div className="space-y-4">
              {communityItems.length === 0 ? (
                <p className="text-xs text-on-surface-variant font-mono">No active user inquiries or unread submissions.</p>
              ) : (
                communityItems.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex gap-3 items-start border-b border-[#1C202B] pb-3 last:border-0 last:pb-0">
                    <div className="w-6 h-6 rounded flex items-center justify-center bg-[#4375FF]/10 text-[#4375FF] shrink-0 mt-0.5">
                      <MessageSquare size={12} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{item.title}</p>
                      <p className="text-[10px] font-mono text-on-surface-variant mt-0.5 truncate">{item.subtext}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => navigate('/admin-portal/contact')}
              className="w-full mt-6 py-2.5 bg-[#1C202B] hover:bg-[#2D3342] text-white text-xs font-bold font-mono tracking-wider uppercase rounded-lg border border-[#2D3342] transition-colors"
            >
              Enter Contact Inbox ({stats?.unreadContacts || 0}) &rarr;
            </button>
          </div>

        </div>
      </div>

      {/* Course Architecture (Subjects from Database) */}
      <div className="mb-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-xl font-display font-bold text-white mb-1">Course Architecture</h2>
            <p className="text-xs text-on-surface-variant">Real subjects and learning paths configured in your curriculum backend.</p>
          </div>
          <button
            onClick={() => navigate('/admin-portal/content')}
            className="px-4 py-2 bg-[#1C202B] hover:bg-[#2D3342] text-on-surface-variant hover:text-white border border-[#2D3342] rounded-lg text-xs font-mono tracking-wide uppercase transition-colors flex items-center gap-2"
          >
            <BookOpen size={14} /> 
            Curriculum Studio
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {subjects.map((subj) => (
            <div
              key={subj._id}
              onClick={() => navigate('/admin-portal/content')}
              className="bg-[#111113] border border-[#1C202B] rounded-xl p-6 text-center hover:border-[#4375FF] transition-colors cursor-pointer group"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-[#1C202B] flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
                {subj.icon || '🎓'}
              </div>
              <h3 className="text-sm font-bold text-white mb-1 truncate" title={subj.title}>
                {subj.title}
              </h3>
              <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">
                {subj.chapterCount} Chapters • {subj.isFree ? 'Free Subject' : 'Pro Subject'}
              </p>
            </div>
          ))}

          <div
            onClick={() => navigate('/admin-portal/content')}
            className="border border-dashed border-[#2D3342] rounded-xl p-6 flex flex-col items-center justify-center text-on-surface-variant hover:text-white hover:border-white/20 hover:bg-white/5 transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full border border-dashed border-current flex items-center justify-center mb-3">
              <Plus size={16} />
            </div>
            <span className="text-sm font-medium">Create Subject</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-[#1C202B] flex flex-wrap justify-between items-center gap-4 text-xs text-on-surface-variant">
        <div>
          <h2 className="text-sm font-display font-bold text-white">HTTPTechNex Command Console</h2>
          <p className="text-[11px] text-on-surface-variant">Connected to real MongoDB Atlas cluster & Brevo email service.</p>
        </div>
        <p className="font-mono text-[10px]">
          &copy; {new Date().getFullYear()} HTTPTechNex. All production systems nominal.
        </p>
      </footer>

    </div>
  );
};

export default AdminDashboard;
