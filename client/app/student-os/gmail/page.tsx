'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Sparkles, Inbox, Send, Star, RefreshCw, Bot, ChevronDown, ChevronUp, X, User, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';

type Email = {
  id: string;
  sender?: string;
  from?: string;
  subject: string;
  snippet?: string;
  time?: string;
  date?: string;
  unread?: boolean;
  isUnread?: boolean;
  category?: string;
};

type EmailPreview = { body: string; subject: string; from: string; date: string } | null;

export default function GmailPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [bodyMap, setBodyMap] = useState<Record<string, string>>({});
  const [summaryMap, setSummaryMap] = useState<Record<string, string>>({});
  const [loadingBodyId, setLoadingBodyId] = useState<string | null>(null);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/student-os/gmail/emails');
      const raw = res.data?.emails || res.data?.messages || [];
      setEmails(raw.map((m: any) => ({
        id: m.id,
        sender: m.from || m.sender || 'Unknown',
        subject: m.subject || 'No Subject',
        snippet: m.snippet || '',
        time: m.date || m.time || 'Recent',
        unread: m.isUnread ?? m.unread ?? false,
        category: m.category || 'general',
      })));
    } catch { setEmails([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchEmails(); }, [fetchEmails]);

  const toggleExpand = async (email: Email) => {
    if (expandedId === email.id) { setExpandedId(null); return; }
    setExpandedId(email.id);

    if (!bodyMap[email.id]) {
      setLoadingBodyId(email.id);
      try {
        const res = await api.get(`/student-os/gmail/${email.id}/body`);
        setBodyMap(prev => ({ ...prev, [email.id]: res.data?.body || 'No body content available.' }));
        // Mark as read
        api.patch(`/student-os/gmail/${email.id}/read`).catch(() => {});
      } catch {
        setBodyMap(prev => ({ ...prev, [email.id]: email.snippet || 'Could not load email body.' }));
      }
      setLoadingBodyId(null);
    }
  };

  const handleSummarize = async (email: Email) => {
    if (summaryMap[email.id]) return; // Already summarized
    setSummarizingId(email.id);
    try {
      const res = await api.get(`/student-os/gmail/${email.id}/summarize`);
      setSummaryMap(prev => ({ ...prev, [email.id]: res.data?.summary || 'Could not generate summary.' }));
    } catch {
      setSummaryMap(prev => ({ ...prev, [email.id]: `Summary for "${email.subject}": ${email.snippet}` }));
    }
    setSummarizingId(null);
  };

  const getCategoryColor = (cat?: string) => {
    if (cat === 'placement') return 'text-emerald-400 bg-emerald-500/10';
    if (cat === 'teacher') return 'text-blue-400 bg-blue-500/10';
    return 'text-zinc-400 bg-zinc-800';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Mail className="text-rose-400" /> Academic Gmail Hub
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Smart inbox filtered for university and recruiter communications.</p>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchEmails} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </Button>
      </div>

      <Card className="p-0 overflow-hidden bg-zinc-950/80 border-zinc-800">
        <div className="p-3 border-b border-zinc-800 bg-zinc-900/60 flex items-center gap-4 text-xs font-semibold text-zinc-400">
          <span className="text-blue-400 flex items-center gap-1.5"><Inbox size={14} /> Inbox ({emails.length})</span>
          <span className="flex items-center gap-1.5"><Star size={14} /> Starred</span>
          <span className="flex items-center gap-1.5"><Send size={14} /> Sent</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-zinc-500 text-sm animate-pulse">Loading inbox...</div>
        ) : emails.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm">No unread emails found.</div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {emails.map(mail => {
              const isExpanded = expandedId === mail.id;
              const body = bodyMap[mail.id];
              const summary = summaryMap[mail.id];
              return (
                <div key={mail.id} className={`transition-colors ${mail.unread ? 'bg-blue-500/5' : ''}`}>
                  {/* Email Row */}
                  <div
                    className="p-4 hover:bg-zinc-900/80 flex items-center gap-4 cursor-pointer"
                    onClick={() => toggleExpand(mail)}
                  >
                    <Star size={16} className="text-zinc-600 hover:text-amber-400 shrink-0" onClick={e => e.stopPropagation()} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm ${mail.unread ? 'font-bold text-white' : 'font-medium text-zinc-300'}`}>{mail.sender}</p>
                        {mail.unread && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                        {mail.category && (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold uppercase ${getCategoryColor(mail.category)}`}>{mail.category}</span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-zinc-200 truncate mt-0.5">{mail.subject}</p>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">{mail.snippet}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-zinc-500">{mail.time}</span>
                      <Button
                        variant="ghost" size="sm"
                        disabled={summarizingId === mail.id}
                        onClick={e => { e.stopPropagation(); handleSummarize(mail); }}
                        className="h-7 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 gap-1"
                      >
                        <Bot size={13} /> {summarizingId === mail.id ? '...' : 'Summarize'}
                      </Button>
                      {isExpanded ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
                    </div>
                  </div>

                  {/* Inline Preview Panel */}
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 bg-zinc-950 border-t border-zinc-800/60 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="text-base font-bold text-white">{mail.subject}</h3>
                          <div className="flex items-center gap-3 text-xs text-zinc-400">
                            <span className="flex items-center gap-1"><User size={12} /> {mail.sender}</span>
                            <span className="flex items-center gap-1"><Calendar size={12} /> {mail.time}</span>
                          </div>
                        </div>
                        <button onClick={() => setExpandedId(null)} className="text-zinc-500 hover:text-white">
                          <X size={14} />
                        </button>
                      </div>

                      {/* Body */}
                      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
                        {loadingBodyId === mail.id
                          ? <span className="text-zinc-500 animate-pulse">Loading email body...</span>
                          : body || mail.snippet
                        }
                      </div>

                      {/* AI Summary */}
                      {summary && (
                        <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-4 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
                            <Sparkles size={14} /> AI Summary
                          </div>
                          <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">{summary}</p>
                        </div>
                      )}

                      {!summary && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="gap-1.5 text-xs"
                          disabled={summarizingId === mail.id}
                          onClick={() => handleSummarize(mail)}
                        >
                          <Sparkles size={13} />
                          {summarizingId === mail.id ? 'Generating AI Summary...' : 'Generate AI Summary'}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}