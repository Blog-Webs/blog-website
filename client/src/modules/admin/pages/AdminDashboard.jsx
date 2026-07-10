import { useState } from 'react';
import { Users, Cpu, Server, Eye, ExternalLink, Plus, Edit2, Trash2, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [publications] = useState([
    { id: 1, title: 'Building with Next.js 15', category: 'Tutorial', engagement: '1.2k', status: 'Published', icon: '📝' },
    { id: 2, title: 'System Arch Guide', category: 'Whitepaper', engagement: '843', status: 'Draft', icon: '📄' },
    { id: 3, title: 'V8 Engine Internals', category: 'Blog', engagement: '2.5k', status: 'Published', icon: '⚙️' },
  ]);

  return (
    <div className="p-6 lg:p-10 max-w-[1400px] mx-auto">
      
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-display font-bold text-white mb-2">Systems Status</h1>
        <p className="text-sm text-on-surface-variant w-full max-w-[800px] leading-relaxed">
          Manage your technical ecosystem, monitor AI workloads, and curate educational content across the HTTPTechNex grid.
        </p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Metric 1 */}
        <div className="bg-[#111113] border border-[#1C202B] rounded-xl p-6 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#1C202B] flex items-center justify-center text-[#abc4ff]">
              <Users size={18} />
            </div>
            <span className="text-[10px] font-mono font-bold text-[#abc4ff]">+12% vs last week</span>
          </div>
          <div>
            <p className="text-[10px] font-mono tracking-widest text-on-surface-variant uppercase mb-1">Active Learners</p>
            <p className="text-4xl font-display font-bold text-white tracking-tight">24,892</p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#abc4ff] opacity-[0.02] rounded-full blur-[30px] group-hover:opacity-[0.05] transition-opacity"></div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#111113] border border-[#1C202B] rounded-xl p-6 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#1C202B] flex items-center justify-center text-[#38bdf8]">
              <Cpu size={18} />
            </div>
            <span className="text-[10px] font-mono font-bold text-[#38bdf8]">System Healthy</span>
          </div>
          <div>
            <p className="text-[10px] font-mono tracking-widest text-on-surface-variant uppercase mb-1">AI Compute Load</p>
            <p className="text-4xl font-display font-bold text-white tracking-tight">42.8%</p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#38bdf8] opacity-[0.02] rounded-full blur-[30px] group-hover:opacity-[0.05] transition-opacity"></div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#111113] border border-[#1C202B] rounded-xl p-6 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#1C202B] flex items-center justify-center text-[#c084fc]">
              <Server size={18} />
            </div>
            <span className="text-[10px] font-mono font-bold text-[#c084fc]">Edge Latency: 24ms</span>
          </div>
          <div>
            <p className="text-[10px] font-mono tracking-widest text-on-surface-variant uppercase mb-1">Nodes Active</p>
            <p className="text-4xl font-display font-bold text-white tracking-tight">114</p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#c084fc] opacity-[0.02] rounded-full blur-[30px] group-hover:opacity-[0.05] transition-opacity"></div>
        </div>

      </div>

      {/* Middle Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Recent Publications Table (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-[#111113] border border-[#1C202B] rounded-xl flex flex-col">
          <div className="p-6 border-b border-[#1C202B] flex justify-between items-center">
            <h2 className="text-lg font-display font-bold text-white">Recent Publications</h2>
            <Link to="/admin-portal/blogs" className="text-[11px] font-mono font-bold text-[#abc4ff] hover:text-[#b9cdff] flex items-center gap-1 transition-colors uppercase tracking-wide">
              View Archive <ExternalLink size={12} />
            </Link>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] font-mono text-on-surface-variant uppercase bg-[#161B22]/50 border-b border-[#1C202B]">
                <tr>
                  <th className="px-6 py-3 font-medium">Title</th>
                  <th className="px-6 py-3 font-medium">Category</th>
                  <th className="px-6 py-3 font-medium">Engagement</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C202B]">
                {publications.map((pub) => (
                  <tr key={pub.id} className="hover:bg-[#161B22] transition-colors group">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-[#1C202B] flex items-center justify-center text-xs opacity-70">
                        {pub.icon}
                      </div>
                      <span className="font-medium text-white max-w-[150px] truncate">{pub.title}</span>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">{pub.category}</td>
                    <td className="px-6 py-4 text-on-surface-variant flex items-center gap-1.5">
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
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-on-surface-variant hover:text-white hover:bg-[#1C202B] rounded"><Edit2 size={14} /></button>
                        <button className="p-1.5 text-on-surface-variant hover:text-red-400 hover:bg-[#1C202B] rounded"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-[#1C202B] flex items-center justify-between text-[11px] text-on-surface-variant font-mono">
            <span>Showing 3 of 142 entries</span>
            <div className="flex gap-1">
              <button className="w-6 h-6 flex items-center justify-center rounded bg-[#161B22] hover:text-white border border-[#1C202B]">&lt;</button>
              <button className="w-6 h-6 flex items-center justify-center rounded bg-[#161B22] hover:text-white border border-[#1C202B]">&gt;</button>
            </div>
          </div>
        </div>

        {/* Right Column Stack */}
        <div className="flex flex-col gap-6">
          
          {/* AI Agent Health */}
          <div className="bg-[#111113] border border-[#1C202B] rounded-xl p-6">
            <h2 className="text-lg font-display font-bold text-white mb-6">AI Agent Health</h2>
            <div className="space-y-6">
              
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-white flex items-center gap-2"><span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> TutorBot-Alpha</span>
                  <span className="text-on-surface-variant">99.9% Uptime</span>
                </div>
                <div className="h-1.5 w-full bg-[#1C202B] rounded-full overflow-hidden">
                  <div className="h-full bg-[#abc4ff] w-[99.9%]"></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-white flex items-center gap-2"><span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> CodeAssist-v2</span>
                  <span className="text-on-surface-variant">98.4% Uptime</span>
                </div>
                <div className="h-1.5 w-full bg-[#1C202B] rounded-full overflow-hidden">
                  <div className="h-full bg-[#38bdf8] w-[98.4%]"></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-white flex items-center gap-2"><span className="w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_8px_#fbbf24]"></span> ForumModerator</span>
                  <span className="text-amber-400">High Latency</span>
                </div>
                <div className="h-1.5 w-full bg-[#1C202B] rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 w-[65%]"></div>
                </div>
              </div>

            </div>
          </div>

          {/* Community Pulse */}
          <div className="bg-[#111113] border border-[#1C202B] rounded-xl p-6 relative">
            <h2 className="text-lg font-display font-bold text-white mb-2">Community Pulse</h2>
            <p className="text-xs text-on-surface-variant mb-5">Latest threads requiring staff attention.</p>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded flex items-center justify-center bg-red-500/10 text-red-400 shrink-0 mt-0.5">!</div>
                <div>
                  <p className="text-sm font-medium text-white truncate max-w-[200px]">Deployment issue with...</p>
                  <p className="text-[10px] font-mono text-on-surface-variant mt-0.5">12 new replies</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded flex items-center justify-center bg-blue-500/10 text-blue-400 shrink-0 mt-0.5"><MessageSquare size={10} /></div>
                <div>
                  <p className="text-sm font-medium text-white truncate max-w-[200px]">Pro Member inquiry abou...</p>
                  <p className="text-[10px] font-mono text-on-surface-variant mt-0.5">Waiting for response</p>
                </div>
              </div>
            </div>

            <button className="w-full mt-6 py-2.5 bg-[#1C202B] hover:bg-[#2D3342] text-white text-xs font-bold font-mono tracking-wider uppercase rounded-lg border border-[#2D3342] transition-colors">
              Enter Forum Admin
            </button>
            
            <button className="absolute -right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#abc4ff] hover:bg-[#b9cdff] text-[#0E1015] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(171,196,255,0.3)] transition-transform hover:scale-110">
              <Plus size={20} />
            </button>
          </div>

        </div>
      </div>

      {/* Course Architecture */}
      <div className="mb-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-xl font-display font-bold text-white mb-1">Course Architecture</h2>
            <p className="text-xs text-on-surface-variant">Map and sequence learning paths for the global platform.</p>
          </div>
          <button className="px-4 py-2 bg-[#1C202B] hover:bg-[#2D3342] text-on-surface-variant hover:text-white border border-[#2D3342] rounded-lg text-xs font-mono tracking-wide uppercase transition-colors flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg> 
            Visual Path Editor
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#111113] border border-[#1C202B] rounded-xl p-6 text-center hover:border-[#38bdf8] transition-colors cursor-pointer group">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#1C202B] flex items-center justify-center text-[#38bdf8] mb-4 group-hover:scale-110 transition-transform">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3"></circle><line x1="12" y1="22" x2="12" y2="8"></line><path d="m5 12 7-4 7 4"></path><path d="m5 22 7-10 7 10"></path></svg>
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Foundations</h3>
            <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">12 Chapters • 48 Labs</p>
          </div>
          
          <div className="bg-[#111113] border border-[#1C202B] rounded-xl p-6 text-center hover:border-[#c084fc] transition-colors cursor-pointer group">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#1C202B] flex items-center justify-center text-[#c084fc] mb-4 group-hover:scale-110 transition-transform">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"></path><path d="m17 5-5-3-5 3"></path><path d="m5 17 7 5 7-5"></path></svg>
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Advanced Systems</h3>
            <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">8 Chapters • 22 Labs</p>
          </div>

          <div className="bg-[#111113] border border-[#1C202B] rounded-xl p-6 text-center hover:border-[#34d399] transition-colors cursor-pointer group">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#1C202B] flex items-center justify-center text-[#34d399] mb-4 group-hover:scale-110 transition-transform">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
            </div>
            <h3 className="text-sm font-bold text-white mb-1">DevOps Pipeline</h3>
            <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">15 Chapters • 60 Labs</p>
          </div>

          <div className="border border-dashed border-[#2D3342] rounded-xl p-6 flex flex-col items-center justify-center text-on-surface-variant hover:text-white hover:border-white/20 hover:bg-white/5 transition-all cursor-pointer">
            <div className="w-10 h-10 rounded-full border border-dashed border-current flex items-center justify-center mb-3">
              <Plus size={16} />
            </div>
            <span className="text-sm font-medium">Create Module</span>
          </div>
        </div>
      </div>

      {/* Internal Footer */}
      <footer className="mt-16 pt-8 border-t border-[#1C202B] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h2 className="text-lg font-display font-bold text-white mb-3">HTTPTechNex</h2>
          <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
            The unified command layer for engineering education and digital publication.
          </p>
          <p className="text-[10px] text-on-surface-variant/70 font-mono">
            © 2024 HTTPTechNex. Built for the modern developer.
          </p>
        </div>
        
        <div>
          <h3 className="text-xs font-bold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2 text-xs text-on-surface-variant">
            <li><a href="#" className="hover:text-white">Documentation</a></li>
            <li><a href="#" className="hover:text-white">Server Logs</a></li>
            <li><a href="#" className="hover:text-white">AI Monitoring</a></li>
            <li><a href="#" className="hover:text-white">Support Grid</a></li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-xs font-bold text-white mb-4">System</h3>
          <ul className="space-y-2 text-xs text-on-surface-variant">
            <li><a href="#" className="hover:text-white">Privacy Ops</a></li>
            <li><a href="#" className="hover:text-white">Terms of Use</a></li>
            <li><a href="#" className="hover:text-white">Cluster Status</a></li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-xs font-bold text-white mb-4">Connect</h3>
          <div className="flex items-center gap-4 text-on-surface-variant">
            <a href="#" className="hover:text-white"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></a>
            <a href="#" className="hover:text-white"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></a>
            <a href="#" className="hover:text-white"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg></a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default AdminDashboard;
