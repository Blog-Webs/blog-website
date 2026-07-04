import { useEffect, useState } from 'react';
import { Mail, Search, Star, Archive, Trash2, Reply, MoreVertical } from 'lucide-react';
import SearchForm from '../components/SearchForm';
import { studentOSApi } from '../api';

const CATEGORY_STYLE = {
  placement: { color: '#5EEAD4', bg: 'rgba(94,234,212,0.1)', label: 'Placement' },
  teacher: { color: '#A78BFA', bg: 'rgba(167,139,250,0.1)', label: 'Teacher' },
  general: { color: 'var(--text-muted)', bg: 'var(--surface-raised)', label: 'General' },
};

const Skeleton = () => (
  <div className="space-y-3">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--surface)' }} />
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
    if (!search.trim()) return;
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
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-mono-display" style={{ color: 'var(--accent)' }}>// google.gmail</p>
        <h1 className="text-2xl font-bold">Gmail</h1>
        <p style={{ color: 'var(--text-muted)' }}>{emails.filter((e) => e.isUnread).length} unread emails</p>
      </div>

      {/* Search */}
      <SearchForm 
        search={search} 
        setSearch={setSearch} 
        handleSearch={handleSearch} 
        handleReset={handleReset} 
        searching={searching} 
        placeholder="Search your emails..." 
      />

      {/* Category filter */}
      <div className="flex gap-2">
        {['all', 'teacher', 'placement', 'general'].map((cat) => (
          <button key={cat} onClick={() => setFilter(cat)}
            className="px-3 py-1.5 rounded-full text-xs font-medium btn-press capitalize transition-all"
            style={{
              backgroundColor: filter === cat ? 'var(--accent)' : 'var(--surface)',
              color: filter === cat ? 'var(--bg)' : 'var(--text-muted)',
              border: `1px solid ${filter === cat ? 'var(--accent)' : 'var(--border)'}`,
            }}>
            {cat === 'all' ? `All (${emails.length})` : cat}
          </button>
        ))}
      </div>

      {/* AI summary panel */}
      {(summary || summarizing) && (
        <div className="p-4 rounded-2xl border"
          style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--accent)', borderWidth: 1 }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--accent)' }}>
              <Sparkles size={13} /> AI Summary
            </p>
            <button onClick={() => setSummary(null)}><X size={14} style={{ color: 'var(--text-muted)' }} /></button>
          </div>
          {summarizing
            ? <div className="h-4 rounded animate-pulse" style={{ backgroundColor: 'var(--surface)' }} />
            : <p className="text-sm leading-relaxed">{summary?.text}</p>
          }
        </div>
      )}

      {loading ? <Skeleton /> : (
        <div className="space-y-2">
          {filtered.length === 0
            ? <p className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No emails found</p>
            : filtered.map((email) => {
              const cat = CATEGORY_STYLE[email.category] || CATEGORY_STYLE.general;
              const isSelected = selected === email.id;
              return (
                <div key={email.id}
                  className={`rounded-2xl border transition-all cursor-pointer ${isSelected ? 'border-[var(--accent)]' : ''}`}
                  style={{ backgroundColor: 'var(--surface)', borderColor: isSelected ? 'var(--accent)' : 'var(--border)' }}>
                  <div className="flex items-start gap-3 p-4" onClick={() => setSelected(isSelected ? null : email.id)}>
                    {email.isUnread && (
                      <span className="w-2 h-2 rounded-full shrink-0 mt-2" style={{ backgroundColor: 'var(--accent)' }} />
                    )}
                    {!email.isUnread && <span className="w-2 h-2 shrink-0 mt-2" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`text-sm truncate ${email.isUnread ? 'font-semibold' : ''}`}>{email.subject || '(no subject)'}</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.bg, color: cat.color }}>
                          {cat.label}
                        </span>
                      </div>
                      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{email.from}</p>
                      <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{email.snippet}</p>
                    </div>
                    <p className="text-[10px] shrink-0" style={{ color: 'var(--text-muted)' }}>
                      {new Date(email.date).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Expanded email actions */}
                  {isSelected && (
                    <div className="px-4 pb-3 pt-0 flex items-center gap-2 border-t" style={{ borderColor: 'var(--border)' }}>
                      <button
                        onClick={() => handleSummarize(email.id, email.subject)}
                        disabled={summarizing}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg btn-press"
                        style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
                        <Sparkles size={11} /> AI Summary
                      </button>
                      {email.isUnread && (
                        <button onClick={() => markRead(email.id)}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg btn-press border"
                          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                          <Eye size={11} /> Mark Read
                        </button>
                      )}
                      <a href={`https://mail.google.com/mail/u/0/#inbox/${email.id}`}
                        target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg btn-press border ml-auto"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                        <ExternalLink size={11} /> Open in Gmail
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
