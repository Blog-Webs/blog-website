'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Mail, Sparkles, Inbox, Send, Star, RefreshCw, Bot, ChevronDown,
  ChevronUp, X, User, Calendar, Tag, Briefcase, GraduationCap, Megaphone
} from 'lucide-react';
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
  category: 'general' | 'placement' | 'ads' | 'faculty';
};

function classifyEmail(sender: string, subject: string, snippet: string): 'general' | 'placement' | 'ads' | 'faculty' {
  const text = `${sender} ${subject} ${snippet}`.toLowerCase();
  if (/interview|placement|offer|hiring|recruiter|job|referral|shortlisted|application|career|internship/.test(text)) {
    return 'placement';
  }
  if (/faculty|professor|dean|hod|department|university|college|lecture|exam|assignment|grade|syllabus|submission/.test(text)) {
    return 'faculty';
  }
  if (/discount|sale|deal|promotion|promo|off|newsletter|ad|sponsored|marketing|subscribe|coupons/.test(text)) {
    return 'ads';
  }
  return 'general';
}

const CATEGORY_TABS: { key: string; label: string; icon: any; color: string }[] = [
  { key: 'all', label: 'All Inboxes', icon: Inbox, color: 'text-blue-400' },
  { key: 'general', label: 'General', icon: Mail, color: 'text-zinc-300' },
  { key: 'placement', label: 'Placement & Jobs', icon: Briefcase, color: 'text-emerald-400' },
  { key: 'faculty', label: 'Faculty & Academic', icon: GraduationCap, color: 'text-purple-400' },
  { key: 'ads', label: 'Ads & Promotions', icon: Megaphone, color: 'text-amber-400' },
];

export default function GmailPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
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
      const parsed: Email[] = raw.map((m: any) => {
        const sender = m.from || m.sender || 'Unknown Sender';
        const subject = m.subject || 'No Subject';
        const snippet = m.snippet || '';
        return {
          id: m.id,
          sender,
          subject,
          snippet,
          time: m.date || m.time || 'Recent',
          unread: m.isUnread ?? m.unread ?? false,
          category: m.category || classifyEmail(sender, subject, snippet),
        };
      });
      setEmails(parsed);
    } catch {
      setEmails([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const toggleExpand = async (email: Email) => {
    // If clicking the same email that is already open, collapse/close it
    if (expandedId === email.id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(email.id);

    if (!bodyMap[email.id]) {
      setLoadingBodyId(email.id);
      try {
        const res = await api.get(`/student-os/gmail/${email.id}/body`);
        setBodyMap(prev => ({ ...prev, [email.id]: res.data?.body || 'No body content available.' }));
        api.patch(`/student-os/gmail/${email.id}/read`).catch(() => {});
      } catch {
        setBodyMap(prev => ({ ...prev, [email.id]: email.snippet || 'Could not load email body.' }));
      } finally {
        setLoadingBodyId(null);
      }
    }
  };

  const handleSummarize = async (email: Email) => {
    if (summaryMap[email.id]) return;
    setSummarizingId(email.id);
    try {
      const res = await api.get(`/student-os/gmail/${email.id}/summarize`);
      setSummaryMap(prev => ({ ...prev, [email.id]: res.data?.summary || 'Could not generate summary.' }));
    } catch {
      setSummaryMap(prev => ({ ...prev, [email.id]: `Summary for "${email.subject}": ${email.snippet}` }));
    } finally {
      setSummarizingId(null);
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'placement':
        return <Badge className="text-[9px] py-0 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">Placement</Badge>;
      case 'faculty':
        return <Badge className="text-[9px] py-0 bg-purple-500/10 text-purple-400 border-purple-500/30">Academic</Badge>;
      case 'ads':
        return <Badge className="text-[9px] py-0 bg-amber-500/10 text-amber-400 border-amber-500/30">Promotion</Badge>;
      default:
        return <Badge variant="secondary" className="text-[9px] py-0 text-zinc-400">General</Badge>;
    }
  };

  const filteredEmails = activeCategory === 'all'
    ? emails
    : emails.filter(e => e.category === activeCategory);

  const getCategoryCount = (key: string) => {
    if (key === 'all') return emails.length;
    return emails.filter(e => e.category === key).length;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Mail className="text-rose-400" /> Academic Gmail Hub
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Smart inbox filtered by category with inline AI summarization and instant preview.
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchEmails} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </Button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORY_TABS.map(tab => {
          const count = getCategoryCount(tab.key);
          const isActive = activeCategory === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveCategory(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isActive
                  ? 'bg-zinc-800 text-white border-zinc-700 shadow-sm'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <Icon size={14} className={tab.color} />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-zinc-700 text-white' : 'bg-zinc-900 text-zinc-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Email List Card */}
      <Card className="p-0 overflow-hidden bg-zinc-950/80 border-zinc-800 shadow-xl">
        <div className="p-3 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-xs font-semibold text-zinc-400">
          <div className="flex items-center gap-4">
            <span className="text-blue-400 flex items-center gap-1.5">
              <Inbox size={14} /> Showing {filteredEmails.length} Emails
            </span>
          </div>
          <span className="text-[11px] text-zinc-500">Click row to open/close reading pane</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-zinc-500 text-sm animate-pulse flex items-center justify-center gap-2">
            <RefreshCw size={16} className="animate-spin" /> Fetching Gmail messages...
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-sm">
            No emails found in this category.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {filteredEmails.map(mail => {
              const isExpanded = expandedId === mail.id;
              const body = bodyMap[mail.id];
              const summary = summaryMap[mail.id];
              return (
                <div key={mail.id} className={`transition-colors ${mail.unread ? 'bg-blue-500/5' : ''}`}>
                  {/* Email Row (Toggles open/close on click) */}
                  <div
                    className="p-4 hover:bg-zinc-900/80 flex items-center gap-4 cursor-pointer select-none"
                    onClick={() => toggleExpand(mail)}
                  >
                    <Star
                      size={16}
                      className="text-zinc-600 hover:text-amber-400 shrink-0"
                      onClick={e => e.stopPropagation()}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm ${mail.unread ? 'font-bold text-white' : 'font-medium text-zinc-300'}`}>
                          {mail.sender}
                        </p>
                        {mail.unread && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                        {getCategoryBadge(mail.category)}
                      </div>
                      <p className="text-xs font-semibold text-zinc-200 truncate mt-0.5">{mail.subject}</p>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">{mail.snippet}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-zinc-500">{mail.time}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={summarizingId === mail.id}
                        onClick={e => {
                          e.stopPropagation();
                          handleSummarize(mail);
                        }}
                        className="h-7 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 gap-1"
                      >
                        <Bot size={13} /> {summarizingId === mail.id ? '...' : 'Summarize'}
                      </Button>
                      {isExpanded ? (
                        <ChevronUp size={16} className="text-blue-400" />
                      ) : (
                        <ChevronDown size={16} className="text-zinc-500" />
                      )}
                    </div>
                  </div>

                  {/* Inline Full Reading Pane */}
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-3 bg-[#0c0c0e] border-t border-zinc-800/80 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="text-base font-bold text-white">{mail.subject}</h3>
                          <div className="flex items-center gap-3 text-xs text-zinc-400">
                            <span className="flex items-center gap-1"><User size={12} /> {mail.sender}</span>
                            <span className="flex items-center gap-1"><Calendar size={12} /> {mail.time}</span>
                            {getCategoryBadge(mail.category)}
                          </div>
                        </div>
                        <button
                          onClick={() => setExpandedId(null)}
                          className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
                          title="Close Reading Pane"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Full Message Body */}
                      <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-4 text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto font-sans">
                        {loadingBodyId === mail.id ? (
                          <span className="text-zinc-500 animate-pulse">Loading email body from Google API...</span>
                        ) : (
                          body || mail.snippet || 'No body text available.'
                        )}
                      </div>

                      {/* Inline AI Summary */}
                      {summary && (
                        <div className="bg-blue-950/40 border border-blue-500/30 rounded-2xl p-4 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
                            <Sparkles size={14} /> AI Academic Summary
                          </div>
                          <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">{summary}</p>
                        </div>
                      )}

                      {!summary && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="gap-1.5 text-xs h-8"
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