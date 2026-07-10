import { useEffect, useState } from 'react';
import { Bug, LifeBuoy, Star, Mail, Search, Bell, HelpCircle, User, Star as StarOutline, MoreVertical, Reply, CheckCircle2 } from 'lucide-react';
import { contactApi } from '../../core/api/contact';
import { ListSkeleton } from '../../core/components/ui/Skeleton';

const TYPE_META = {
  bug: { label: 'Bug report', icon: Bug, color: '#F87171' },
  support: { label: 'Support', icon: LifeBuoy, color: '#FFB454' },
  review: { label: 'Review', icon: Star, color: '#A78BFA' },
};

const FILTERS = [
  { key: '', label: 'All Messages' },
  { key: 'bug', label: 'Bugs' },
  { key: 'support', label: 'Support' },
  { key: 'review', label: 'Reviews' },
];

const ContactSubmissions = () => {
  const [contacts, setContacts] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  const load = (type) => {
    setLoading(true);
    contactApi.getAll(type || undefined)
      .then(({ data }) => {
        setContacts(data.contacts);
        if (data.contacts.length > 0 && !selectedMessageId) {
          setSelectedMessageId(data.contacts[0]._id);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => load(filter), [filter]);

  const handleMarkRead = async (id) => {
    await contactApi.markAsRead(id);
    setContacts((prev) => prev.map((c) => (c._id === id ? { ...c, isRead: true } : c)));
  };

  const selectedMessage = contacts.find((c) => c._id === selectedMessageId);
  const unreadCount = contacts.filter((c) => !c.isRead).length;

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full overflow-hidden bg-[#0A0A0A] text-on-surface">
      {/* ── CUSTOM TOP HEADER ── */}
      <header className="h-[60px] shrink-0 border-b border-[#1C202B] bg-[#0E1015] flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold text-white">Contact Box</h1>
          <nav className="flex gap-4">
            <button className="text-sm font-medium text-white border-b-2 border-[#4375FF] pb-[19px] pt-5">Inbox</button>
            <button className="text-sm font-medium text-[#8B949E] hover:text-white transition-colors">Analytics</button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]" />
            <input 
              type="text" 
              placeholder="Search system logs..." 
              className="w-64 bg-[#111113] border border-[#2D3342] text-sm text-white rounded-full py-1.5 pl-9 pr-4 outline-none focus:border-[#4375FF]"
            />
          </div>
          <button className="text-[#8B949E] hover:text-white"><Bell size={18} /></button>
          <button className="text-[#8B949E] hover:text-white"><HelpCircle size={18} /></button>
          <div className="w-8 h-8 rounded-full bg-[#1C202B] border border-[#2D3342] flex items-center justify-center overflow-hidden">
             <User size={16} className="text-[#8B949E]" />
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT (2 COLUMNS) ── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ── LEFT PANE: INBOX LIST ── */}
        <aside className="w-[320px] flex-shrink-0 border-r border-[#1C202B] bg-[#0E1015] flex flex-col h-full z-10">
          <div className="p-4 border-b border-[#1C202B]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Inbox</h2>
              {unreadCount > 0 && (
                <span className="bg-[#4375FF]/20 text-[#4375FF] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} New
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-1.5">
              {FILTERS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className="px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: filter === key ? '#1C202B' : 'transparent',
                    color: filter === key ? 'white' : '#8B949E',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-4"><ListSkeleton count={5} /></div>
            ) : contacts.length === 0 ? (
              <p className="text-center py-12 text-[#8B949E] text-sm">Nothing here yet.</p>
            ) : (
              <div className="flex flex-col">
                {contacts.map((c) => {
                  const meta = TYPE_META[c.type];
                  const Icon = meta.icon;
                  const isSelected = selectedMessageId === c._id;
                  return (
                    <div
                      key={c._id}
                      onClick={() => setSelectedMessageId(c._id)}
                      className={`p-4 border-b border-[#1C202B] cursor-pointer transition-colors ${isSelected ? 'bg-[#1C202B]' : 'hover:bg-[#161B22]'}`}
                    >
                      <div className="flex items-start justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md flex items-center justify-center text-white" style={{ backgroundColor: meta.color }}>
                            <Icon size={12} />
                          </div>
                          <span className="text-sm font-bold text-white truncate max-w-[140px]">{c.name}</span>
                        </div>
                        <span className="text-[10px] text-[#8B949E] whitespace-nowrap">
                          {formatDate(c.createdAt)}
                        </span>
                      </div>
                      
                      <div className="text-xs text-[#8B949E] mb-2 truncate">{c.email}</div>
                      
                      <div className="text-sm text-white font-medium mb-1 truncate">
                        {c.type === 'review' ? `Review: "${c.role}"` : c.subject}
                      </div>
                      <div className="text-xs text-[#8B949E] truncate mb-2">
                        {c.type === 'review' ? c.review : c.message}
                      </div>

                      <div className="flex items-center gap-2">
                        {!c.isRead && (
                          <span className="bg-[#FFB454]/10 text-[#FFB454] border border-[#FFB454]/20 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded">
                            UNREAD
                          </span>
                        )}
                        {c.isRead && (
                          <span className="bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded">
                            RESOLVED
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* ── RIGHT PANE: MESSAGE DETAIL ── */}
        <main className="flex-1 flex flex-col bg-[#0A0A0A] overflow-hidden">
          {!selectedMessage ? (
            <div className="flex-1 flex items-center justify-center text-[#8B949E]">
              Select a message to view details
            </div>
          ) : (
            <div className="flex flex-col h-full">
              
              {/* Message Header */}
              <div className="px-8 py-6 border-b border-[#1C202B] bg-[#0E1015]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg" style={{ backgroundColor: TYPE_META[selectedMessage.type].color }}>
                      {selectedMessage.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h2 className="text-xl font-bold text-white">{selectedMessage.name}</h2>
                        {selectedMessage.type === 'review' && (
                          <span className="bg-[#A78BFA]/20 text-[#A78BFA] text-[10px] font-bold px-1.5 py-0.5 rounded">
                            {selectedMessage.role}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-[#8B949E]">
                        {selectedMessage.email}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-full border border-[#2D3342] flex items-center justify-center text-[#8B949E] hover:text-white hover:bg-[#161B22] transition-colors">
                      <StarOutline size={14} />
                    </button>
                    <button className="w-8 h-8 rounded-full border border-[#2D3342] flex items-center justify-center text-[#8B949E] hover:text-white hover:bg-[#161B22] transition-colors">
                      <MoreVertical size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Message Body */}
              <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
                <div className="flex items-start justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">
                    {selectedMessage.type === 'review' ? 'Platform Review' : selectedMessage.subject}
                  </h3>
                  <div className="text-xs text-[#8B949E] flex flex-col items-end whitespace-nowrap">
                    <span>{new Date(selectedMessage.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span>{new Date(selectedMessage.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="bg-[#111113] border border-[#1C202B] rounded-2xl p-6 text-[15px] leading-relaxed text-[#C9D1D9] whitespace-pre-wrap">
                  {selectedMessage.type === 'review' ? selectedMessage.review : selectedMessage.message}
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="px-8 py-4 border-t border-[#1C202B] bg-[#0E1015] flex items-center justify-between">
                <div className="flex gap-4">
                  <a 
                    href={`mailto:${selectedMessage.email}?subject=RE: ${selectedMessage.type === 'review' ? 'Your Review' : selectedMessage.subject}`}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#cbe1f8] text-[#1a5eb8] hover:bg-[#b0d2f4] text-sm font-semibold transition-colors"
                  >
                    <Reply size={16} /> Reply to Sender
                  </a>
                  {!selectedMessage.isRead && (
                    <button 
                      onClick={() => handleMarkRead(selectedMessage._id)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#2D3342] bg-[#111113] hover:bg-[#161B22] text-white text-sm font-semibold transition-colors"
                    >
                      <CheckCircle2 size={16} /> Mark Resolved
                    </button>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-xs font-mono text-[#8B949E]">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4375FF]"></span> 
                    Via Help Widget
                  </span>
                </div>
              </div>

            </div>
          )}
        </main>

      </div>
    </div>
  );
};

export default ContactSubmissions;
