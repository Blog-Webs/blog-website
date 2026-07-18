import { useEffect, useState } from 'react';
import { Search, Sparkles, X, Eye, ExternalLink, Mail } from 'lucide-react';
import { studentOSApi } from '../api';

const CATEGORY_STYLE = {
  placement: { color: '#5EEAD4', bg: 'rgba(94,234,212,0.15)', label: 'Placement' },
  teacher: { color: '#A78BFA', bg: 'rgba(167,139,250,0.15)', label: 'Teacher' },
  general: { color: '#9ca3af', bg: 'rgba(156,163,175,0.15)', label: 'General' },
};

const Skeleton = () => (
  <div className="space-y-3">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="h-24 rounded-2xl animate-pulse bg-[#161b22]" />
    ))}
  </div>
);

const GmailPage = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [summary, setSummary] = useState(null);
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => {
    studentOSApi.getEmails()
      .then(({ data }) => setEmails(data.emails || []))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) {
      handleReset();
      return;
    }
    setSearching(true);
    try {
      const { data } = await studentOSApi.searchEmails(search.trim());
      setEmails(data.emails || []);
    } finally {
      setSearching(false);
    }
  };

  const handleReset = () => {
    setSearch('');
    setLoading(true);
    studentOSApi.getEmails().then(({ data }) => setEmails(data.emails || [])).finally(() => setLoading(false));
  };

  const markRead = async (id) => {
    await studentOSApi.markAsRead(id);
    setEmails((prev) => prev.map((e) => e.id === id ? { ...e, isUnread: false } : e));
  };

  const handleSummarize = async (id, subject) => {
    setSummarizing(true);
    setSummary(null);
    try {
      const { data } = await studentOSApi.summarizeEmail(id);
      setSummary({ text: data.summary, available: data.available });
    } catch {
      setSummary({ text: 'Could not generate summary. Please try again.', available: false });
    } finally {
      setSummarizing(false);
    }
  };

  const filtered = filter === 'all' ? emails : emails.filter((e) => e.category === filter);

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-8 bg-[#0d1117] min-h-full text-white font-sans">
      <div className="space-y-1">
        <p className="text-sm font-mono text-gray-500">// google.gmail</p>
        <h1 className="text-4xl font-bold tracking-tight text-white">Gmail</h1>
        <p className="text-gray-400 text-sm">{emails.filter((e) => e.isUnread).length} unread emails</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 items-center">
        <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#161b22] border border-[#30363d] focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
          <Search size={18} className="text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your emails..."
            className="flex-1 bg-transparent text-sm text-gray-300 outline-none placeholder-gray-600"
          />
        </div>
        <button type="submit" disabled={searching}
          className="px-8 py-3 rounded-xl text-sm font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-colors">
          {searching ? '...' : 'Search'}
        </button>
      </form>

      {/* Category filter */}
      <div className="flex gap-1 items-center pb-2">
        {['all', 'teacher', 'placement', 'general'].map((cat) => (
          <button 
            key={cat} 
            onClick={() => setFilter(cat)}
            className={`px-5 py-2 rounded-lg text-xs font-semibold capitalize transition-colors ${
              filter === cat 
                ? 'bg-[#30363d] text-white' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#161b22]'
            }`}
          >
            {cat === 'all' ? `All (${emails.length})` : cat}
          </button>
        ))}
      </div>

      {/* AI summary panel */}
      {(summary || summarizing) && (
        <div className="p-5 rounded-2xl bg-[#161b22] border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold flex items-center gap-2 text-blue-400">
              <Sparkles size={16} /> AI Summary
            </p>
            <button onClick={() => setSummary(null)} className="text-gray-400 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
          {summarizing
            ? <div className="h-5 rounded bg-[#30363d] animate-pulse w-3/4" />
            : <p className="text-sm leading-relaxed text-gray-300">{summary?.text}</p>
          }
        </div>
      )}

      {loading ? <Skeleton /> : (
        <div className="space-y-4 pb-10">
          {filtered.length === 0
            ? <p className="py-20 text-center text-gray-500">No emails found matching your criteria</p>
            : filtered.map((email) => {
              const cat = CATEGORY_STYLE[email.category] || CATEGORY_STYLE.general;
              const isSelected = selected === email.id;
              
              return (
                <div key={email.id}
                  className={`rounded-2xl transition-all cursor-pointer bg-[#161b22] border ${
                    isSelected ? 'border-blue-500' : 'border-[#30363d] hover:border-[#4b5563]'
                  }`}
                >
                  <div className="flex items-start gap-4 p-5" onClick={() => setSelected(isSelected ? null : email.id)}>
                    <div className="mt-1">
                      {email.isUnread ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-transparent" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <p className={`text-sm truncate ${email.isUnread ? 'font-bold text-white' : 'font-semibold text-gray-300'}`}>
                          {email.subject || '(no subject)'}
                        </p>
                        <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded uppercase"
                          style={{ backgroundColor: cat.bg, color: cat.color }}>
                          {cat.label}
                        </span>
                      </div>
                      <p className="text-xs truncate text-gray-400 font-medium mb-2">{email.from}</p>
                      <p className="text-[13px] text-gray-500 line-clamp-2 leading-relaxed">{email.snippet}</p>
                    </div>
                    
                    <p className="text-[11px] font-medium text-gray-500 shrink-0">
                      {new Date(email.date).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Expanded email actions */}
                  {isSelected && (
                    <div className="px-5 pb-4 pt-2 flex items-center gap-4 border-t border-[#30363d] mt-2">
                      <button
                        onClick={() => handleSummarize(email.id, email.subject)}
                        disabled={summarizing}
                        className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors">
                        <Sparkles size={14} /> AI Summary
                      </button>
                      {email.isUnread && (
                        <button onClick={() => markRead(email.id)}
                          className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg bg-[#30363d] text-gray-300 hover:bg-[#3b434b] transition-colors">
                          <Eye size={14} /> Mark Read
                        </button>
                      )}
                      <a href={`https://mail.google.com/mail/u/0/#inbox/${email.id}`}
                        target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg bg-[#30363d] text-gray-300 hover:bg-[#3b434b] transition-colors ml-auto">
                        <ExternalLink size={14} /> Open in Gmail
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default GmailPage;
