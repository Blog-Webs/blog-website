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
  { key: 'general', label: 'General', icon: Mail, color: 'text-gray-600' },
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
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">Placement</span>;
      case 'faculty':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-medium">Academic</span>;
      case 'ads':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-medium">Promotion</span>;
      default:
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded-md text-gray-600 bg-gray-100 border border-gray-200 font-medium">General</span>;
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
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight flex items-center gap-2">
            <Mail className="text-blue-600" size={20} /> Academic Gmail Hub
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Smart inbox filtered by category with inline AI summarization and instant preview.
          </p>
        </div>
        <button 
          onClick={fetchEmails} 
          disabled={loading} 
          className="p-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 text-xs transition-colors self-start"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-blue-600' : ''} />
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORY_TABS.map(tab => {
          const count = getCategoryCount(tab.key);
          const isActive = activeCategory === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveCategory(tab.key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Icon size={13} className={isActive ? 'text-white' : tab.color} />
              <span>{tab.label}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Email List Card */}
      <div className="p-0 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-xs">
        <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between text-xs font-medium text-gray-600">
          <div className="flex items-center gap-4">
            <span className="text-gray-900 flex items-center gap-1.5 font-semibold text-xs">
              <Inbox size={14} className="text-blue-600" /> {filteredEmails.length} Emails
            </span>
          </div>
          <span className="text-[11px] text-gray-400 font-mono">Select row to read</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400 text-xs animate-pulse flex items-center justify-center gap-2">
            <RefreshCw size={14} className="animate-spin text-blue-600" /> Fetching Gmail messages...
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            No emails found in this category.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredEmails.map(mail => {
              const isExpanded = expandedId === mail.id;
              const body = bodyMap[mail.id];
              const summary = summaryMap[mail.id];
              return (
                <div key={mail.id} className={`transition-colors ${mail.unread ? 'bg-blue-50/30' : ''}`}>
                  {/* Email Row (Toggles open/close on click) */}
                  <div
                    className="p-3.5 hover:bg-gray-50 flex items-center gap-3 cursor-pointer select-none"
                    onClick={() => toggleExpand(mail)}
                  >
                    <Star
                      size={15}
                      className="text-gray-300 hover:text-amber-400 shrink-0"
                      onClick={e => e.stopPropagation()}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-xs ${mail.unread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {mail.sender}
                        </p>
                        {mail.unread && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />}
                        {getCategoryBadge(mail.category)}
                      </div>
                      <p className="text-xs font-semibold text-gray-900 truncate mt-0.5">{mail.subject}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{mail.snippet}</p>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-[11px] font-mono text-gray-400">{mail.time}</span>
                      <button
                        disabled={summarizingId === mail.id}
                        onClick={e => {
                          e.stopPropagation();
                          handleSummarize(mail);
                        }}
                        className="flex items-center gap-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-2.5 py-1 rounded-md text-xs font-medium shadow-xs transition-colors"
                      >
                        <Bot size={12} className="text-blue-600" />
                        <span>{summarizingId === mail.id ? '...' : 'Summarize'}</span>
                      </button>
                      {isExpanded ? (
                        <ChevronUp size={14} className="text-blue-600" />
                      ) : (
                        <ChevronDown size={14} className="text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Inline Full Reading Pane */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-3 bg-gray-50 border-t border-gray-200 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="text-sm font-semibold text-gray-900">{mail.subject}</h3>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><User size={12} /> {mail.sender}</span>
                            <span className="flex items-center gap-1 font-mono"><Calendar size={12} /> {mail.time}</span>
                            {getCategoryBadge(mail.category)}
                          </div>
                        </div>
                        <button
                          onClick={() => setExpandedId(null)}
                          className="p-1 rounded-md hover:bg-gray-200 text-gray-500 hover:text-gray-900"
                          title="Close Reading Pane"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      {/* Full Message Body */}
                      <div className="bg-white rounded-md border border-gray-200 p-3.5 text-xs text-gray-800 leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto font-sans shadow-xs">
                        {loadingBodyId === mail.id ? (
                          <span className="text-gray-400 animate-pulse">Loading email body from Google API...</span>
                        ) : (
                          body || mail.snippet || 'No body text available.'
                        )}
                      </div>

                      {/* Inline AI Summary */}
                      {summary && (
                        <div className="bg-blue-50/70 border border-blue-200 rounded-md p-3.5 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-900">
                            <Sparkles size={13} className="text-blue-600" /> AI Academic Summary
                          </div>
                          <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{summary}</p>
                        </div>
                      )}

                      {!summary && (
                        <button
                          disabled={summarizingId === mail.id}
                          onClick={() => handleSummarize(mail)}
                          className="flex items-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 px-3 py-1.5 rounded-md text-xs font-medium shadow-xs transition-colors"
                        >
                          <Sparkles size={13} className="text-blue-600" />
                          <span>{summarizingId === mail.id ? 'Generating AI Summary...' : 'Generate AI Summary'}</span>
                        </button>
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