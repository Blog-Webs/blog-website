import { useEffect, useState } from 'react';
import { adminApi } from '../api/admin';
import { ListSkeleton } from '../../core/components/ui/Skeleton';
import { Download, Trash2, Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const Subscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    adminApi.getSubscribers().then(({ data }) => setSubscribers(data.subscribers)).finally(() => setLoading(false));
  }, []);

  const toggleSelectAll = () => {
    if (selectedIds.length === subscribers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(subscribers.map(s => s._id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const isAllSelected = subscribers.length > 0 && selectedIds.length === subscribers.length;

  return (
    <div className="p-8 lg:p-12 w-full max-w-6xl mx-auto text-on-surface">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Newsletter Subscribers</h1>
        <div className="flex items-center gap-2 text-[#8B949E]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#34D399]"></span>
          <span className="font-medium">{subscribers.length.toLocaleString()} Active Subscribers</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-[#111113] border border-[#2D3342] hover:bg-[#161B22] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#8B949E]"><line x1="21" y1="4" x2="14" y2="4"></line><line x1="10" y1="4" x2="3" y2="4"></line><line x1="21" y1="12" x2="12" y2="12"></line><line x1="8" y1="12" x2="3" y2="12"></line><line x1="21" y1="20" x2="16" y2="20"></line><line x1="12" y1="20" x2="3" y2="20"></line><line x1="14" y1="2" x2="14" y2="6"></line><line x1="8" y1="10" x2="8" y2="14"></line><line x1="16" y1="18" x2="16" y2="22"></line></svg>
            All Subscribers
            <ChevronDown size={14} className="text-[#8B949E] ml-1" />
          </button>
          <button className="flex items-center gap-2 bg-[#111113] border border-[#2D3342] hover:bg-[#161B22] text-[#8B949E] px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <Calendar size={14} />
            Date range
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-[#111113] border border-[#2D3342] hover:bg-[#161B22] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <Download size={14} className="text-[#8B949E]" />
            Export CSV
          </button>
          <button className="flex items-center gap-2 bg-[#FF4C4C]/10 border border-[#FF4C4C]/20 hover:bg-[#FF4C4C]/20 text-[#FF4C4C] px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <Trash2 size={14} />
            Delete Selected
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#111113] border border-[#1C202B] rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        
        {/* Table Header */}
        <div className="grid grid-cols-[40px_1fr_1fr] items-center px-6 py-4 border-b border-[#1C202B] bg-[#0E1015] text-[10px] font-bold text-[#8B949E] tracking-widest uppercase">
          <button onClick={toggleSelectAll} className="flex items-center justify-center h-4 w-4 rounded-full border border-[#4C5363] hover:border-white transition-colors relative">
             {isAllSelected && <span className="w-2 h-2 rounded-full bg-[#4375FF]"></span>}
          </button>
          <div>Email Address</div>
          <div>Join Date</div>
        </div>

        {/* Table Body */}
        {loading ? (
          <div className="p-6"><ListSkeleton count={5} /></div>
        ) : subscribers.length === 0 ? (
          <div className="p-12 text-center text-[#8B949E] text-sm">No subscribers found.</div>
        ) : (
          <div className="flex flex-col">
            {subscribers.map((s, i) => {
              const isSelected = selectedIds.includes(s._id);
              return (
                <div 
                  key={s._id} 
                  className={`grid grid-cols-[40px_1fr_1fr] items-center px-6 py-4 transition-colors ${i !== subscribers.length - 1 ? 'border-b border-[#1C202B]' : ''} ${isSelected ? 'bg-[#1C202B]/50' : 'hover:bg-[#161B22]'}`}
                >
                  <button onClick={() => toggleSelect(s._id)} className="flex items-center justify-center h-4 w-4 rounded-full border border-[#4C5363] hover:border-[#4375FF] transition-colors relative">
                    {isSelected && <span className="w-2 h-2 rounded-full bg-[#4375FF]"></span>}
                  </button>
                  <div className="flex flex-col">
                    <span className="text-[15px] font-bold text-white mb-0.5">{s.email}</span>
                    <span className="text-[11px] text-[#8B949E]">Source: Direct Opt-in</span>
                  </div>
                  <div className="text-[13px] text-[#C9D1D9]">
                    {new Date(s.subscribedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Table Footer / Pagination */}
        <div className="px-6 py-4 border-t border-[#1C202B] bg-[#0E1015] flex items-center justify-between">
          <div className="text-xs text-[#8B949E]">
            Showing 1-{Math.min(5, subscribers.length)} of {subscribers.length.toLocaleString()} subscribers
          </div>
          <div className="flex items-center gap-2">
            <button className="w-7 h-7 flex items-center justify-center rounded-lg text-[#8B949E] hover:text-white hover:bg-[#1C202B] transition-colors">
              <ChevronLeft size={14} />
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#4375FF] text-white text-xs font-bold shadow-lg shadow-[#4375FF]/20">
              1
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-lg text-white text-xs font-medium hover:bg-[#1C202B] transition-colors">
              2
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-lg text-white text-xs font-medium hover:bg-[#1C202B] transition-colors">
              3
            </button>
            <span className="text-[#8B949E] text-xs">...</span>
            <button className="w-7 h-7 flex items-center justify-center rounded-lg text-white text-xs font-medium hover:bg-[#1C202B] transition-colors">
              250
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-lg text-[#8B949E] hover:text-white hover:bg-[#1C202B] transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Subscribers;
