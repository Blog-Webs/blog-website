'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Mail, Sparkles, Inbox, Star, RefreshCw, Bot, ChevronDown,
  ChevronUp, X, User, Calendar, Briefcase, GraduationCap, Megaphone
} from 'lucide-react';
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
  { key: 'all', label: 'All Inboxes', icon: Inbox, color: 'text-blue-600' },
  { key: 'general', label: 'General', icon: Mail, color: 'text-slate-600' },
  { key: 'placement', label: 'Placement & Jobs', icon: Briefcase, color: 'text-emerald-600' },
  { key: 'faculty', label: 'Faculty & Academic', icon: GraduationCap, color: 'text-blue-600' },
  { key: 'ads', label: 'Ads & Promotions', icon: Megaphone, color: 'text-amber-600' },
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
        return <Badge className="text-[9px] py-0 bg-emerald-50 text-emerald-700 border-emerald-200">Placement</Badge>;
      case 'faculty':
        return <Badge className="text-[9px] py-0 bg-blue-50 text-blue-700 border-blue-200">Academic</Badge>;
      case 'ads':
        return <Badge className="text-[9px] py-0 bg-amber-50 text-amber-700 border-amber-200">Promotion</Badge>;
      default:
        return <Badge variant="secondary" className="text-[9px] py-0 text-slate-600 bg-slate-100">General</Badge>;
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Mail className="text-blue-600" /> Academic Gmail Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Smart inbox filtered by category with inline AI summarization and instant preview.
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchEmails} disabled={loading} className="text-slate-600 hover:text-slate-900">
          <RefreshCw size={16} className={loading ? 'animate-spin text-blue-600' : ''} />
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
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-slate-900'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-white' : tab.color} />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Email List Card */}
      <div className="p-0 overflow-hidden bg-white border border-slate-200 rounded-3xl shadow-xs">
        <div className="p-3.5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-4">
            <span className="text-blue-700 flex items-center gap-1.5 font-bold">
              <Inbox size={14} className="text-blue-600" /> Showing {filteredEmails.length} Emails
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Click row to open/close reading pane</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm animate-pulse flex items-center justify-center gap-2">
            <RefreshCw size={16} className="animate-spin text-blue-600" /> Fetching Gmail messages...
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No emails found in this category.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredEmails.map(mail => {
              const isExpanded = expandedId === mail.id;
              const body = bodyMap[mail.id];
              const summary = summaryMap[mail.id];
              return (
                <div key={mail.id} className={`transition-colors ${mail.unread ? 'bg-blue-50/40' : ''}`}>
                  {/* Email Row (Toggles open/close on click) */}
                  <div
                    className="p-4 hover:bg-slate-50 flex items-center gap-4 cursor-pointer select-none"
                    onClick={() => toggleExpand(mail)}
                  >
                    <Star
                      size={16}
                      className="text-slate-300 hover:text-amber-400 shrink-0"
                      onClick={e => e.stopPropagation()}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm ${mail.unread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                          {mail.sender}
                        </p>
                        {mail.unread && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />}
                        {getCategoryBadge(mail.category)}
                      </div>
                      <p className="text-xs font-semibold text-slate-800 truncate mt-0.5">{mail.subject}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{mail.snippet}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-slate-400">{mail.time}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={summarizingId === mail.id}
                        onClick={e => {
                          e.stopPropagation();
                          handleSummarize(mail);
                        }}
                        className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1"
                      >
                        <Bot size={13} /> {summarizingId === mail.id ? '...' : 'Summarize'}
                      </Button>
                      {isExpanded ? (
                        <ChevronUp size={16} className="text-blue-600" />
                      ) : (
                        <ChevronDown size={16} className="text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Inline Full Reading Pane */}
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-3 bg-slate-50 border-t border-slate-200 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="text-base font-bold text-slate-900">{mail.subject}</h3>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><User size={12} /> {mail.sender}</span>
                            <span className="flex items-center gap-1"><Calendar size={12} /> {mail.time}</span>
                            {getCategoryBadge(mail.category)}
                          </div>
                        </div>
                        <button
                          onClick={() => setExpandedId(null)}
                          className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-900"
                          title="Close Reading Pane"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Full Message Body */}
                      <div className="bg-white rounded-2xl border border-slate-200 p-4 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto font-sans shadow-2xs">
                        {loadingBodyId === mail.id ? (
                          <span className="text-slate-400 animate-pulse">Loading email body from Google API...</span>
                        ) : (
                          body || mail.snippet || 'No body text available.'
                        )}
                      </div>

                      {/* Inline AI Summary */}
                      {summary && (
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900">
                            <Sparkles size={14} className="text-blue-600" /> AI Academic Summary
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{summary}</p>
                        </div>
                      )}

                      {!summary && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="gap-1.5 text-xs h-8 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                          disabled={summarizingId === mail.id}
                          onClick={() => handleSummarize(mail)}
                        >
                          <Sparkles size={13} className="text-blue-600" />
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
      </div>
    </div>
  );
}