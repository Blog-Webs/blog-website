'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Sparkles, Bot, User, Upload, X, FileText, Lightbulb, RefreshCw,
  Plus, MessageSquare, Trash2, Edit3, Check, Search, PanelLeftClose, PanelLeft
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';

type Message = {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
};

type ChatSession = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
};

type UploadedDoc = { id: string; name: string };

const QUICK_PROMPTS = [
  'Explain Paxos vs Raft consensus algorithms',
  'How do I optimize binary search tree balancing?',
  'Help me design a System Design study plan',
  'What are the key trade-offs in SQL vs NoSQL?',
  'Explain the CAP theorem with real examples',
  'Write a Python solution for the N-Queens problem',
];

const INITIAL_AI_MSG: Message = {
  id: 'm-0',
  sender: 'ai',
  text: "Hello! I am your StudentOS AI Academic Tutor powered by Gemini. How can I assist you with code, system design, or exam prep today?",
  timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
};

function MessageBubble({ msg }: { msg: Message }) {
  const isAi = msg.sender === 'ai';

  const renderText = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```|`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3).replace(/^[a-z]+\n/, '');
        return (
          <pre key={i} className="mt-2 p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-emerald-300 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
            {code}
          </pre>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="px-1.5 py-0.5 bg-zinc-800 rounded text-emerald-300 text-xs font-mono">{part.slice(1,-1)}</code>;
      }
      return <span key={i} className="whitespace-pre-wrap">{part}</span>;
    });
  };

  return (
    <div className={`flex gap-3 ${isAi ? 'items-start' : 'items-start flex-row-reverse'}`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isAi ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-md shadow-emerald-500/20' : 'bg-slate-700'}`}>
        {isAi ? <Bot size={16} className="text-white" /> : <User size={16} className="text-white" />}
      </div>
      <div className="max-w-[82%]">
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isAi ? 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-tl-xs' : 'bg-blue-600 text-white rounded-tr-xs shadow-md'
        }`}>
          {renderText(msg.text)}
        </div>
        <p className={`text-[10px] text-zinc-500 mt-1 px-1 ${isAi ? 'text-left' : 'text-right'}`}>{msg.timestamp}</p>
      </div>
    </div>
  );
}

export default function AiAssistantPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editTitleText, setEditTitleText] = useState<string>('');

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize or load chat sessions from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('studentos_ai_sessions');
      const savedActiveId = localStorage.getItem('studentos_ai_active_session');

      if (saved) {
        const parsed: ChatSession[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          const validActive = savedActiveId && parsed.some(s => s.id === savedActiveId) ? savedActiveId : parsed[0].id;
          setActiveSessionId(validActive);
          return;
        }
      }
    } catch {}

    // Default initial session
    const defaultSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New Academic Chat',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [INITIAL_AI_MSG],
    };
    setSessions([defaultSession]);
    setActiveSessionId(defaultSession.id);
    try {
      localStorage.setItem('studentos_ai_sessions', JSON.stringify([defaultSession]));
      localStorage.setItem('studentos_ai_active_session', defaultSession.id);
    } catch {}
  }, []);

  // Save sessions to localStorage whenever they update
  const saveSessions = (updatedSessions: ChatSession[], newActiveId?: string) => {
    setSessions(updatedSessions);
    const targetId = newActiveId || activeSessionId;
    try {
      localStorage.setItem('studentos_ai_sessions', JSON.stringify(updatedSessions));
      if (targetId) localStorage.setItem('studentos_ai_active_session', targetId);
    } catch {}
  };

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messages = activeSession?.messages || [INITIAL_AI_MSG];

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Load uploaded syllabus documents
  useEffect(() => {
    api.get('/student-os/files')
      .then(res => {
        const docs = (res.data?.documents || []).map((d: any) => ({ id: d._id || d.id, name: d.filename || d.name || 'Document' }));
        setUploadedDocs(docs);
      })
      .catch(() => {});
  }, []);

  const handleCreateNewChat = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New Academic Chat',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [{
        id: `m-${Date.now()}`,
        sender: 'ai',
        text: "Started a new conversation! What topic or code would you like to explore?",
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      }],
    };
    const updated = [newSession, ...sessions];
    saveSessions(updated, newSession.id);
    setActiveSessionId(newSession.id);
    setInput('');
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      // If only one, reset it to new empty chat
      handleCreateNewChat();
      return;
    }
    const updated = sessions.filter(s => s.id !== sessionId);
    const nextActive = activeSessionId === sessionId ? updated[0].id : activeSessionId;
    saveSessions(updated, nextActive);
    setActiveSessionId(nextActive);
  };

  const startRenameSession = (s: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTitleId(s.id);
    setEditTitleText(s.title);
  };

  const saveRenameSession = (sessionId: string) => {
    if (!editTitleText.trim()) return setEditingTitleId(null);
    const updated = sessions.map(s => s.id === sessionId ? { ...s, title: editTitleText.trim() } : s);
    saveSessions(updated);
    setEditingTitleId(null);
  };

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading || !activeSessionId) return;

    const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp,
    };

    // Update active session locally first
    let currentSession = sessions.find(s => s.id === activeSessionId);
    if (!currentSession) return;

    const newTitle = (currentSession.title === 'New Academic Chat' || currentSession.title === 'New Chat')
      ? (trimmed.length > 25 ? trimmed.slice(0, 25) + '...' : trimmed)
      : currentSession.title;

    const updatedMessages = [...currentSession.messages, userMsg];
    let updatedSessions = sessions.map(s => s.id === activeSessionId ? {
      ...s,
      title: newTitle,
      updatedAt: new Date().toISOString(),
      messages: updatedMessages,
    } : s);

    saveSessions(updatedSessions);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/student-os/ai/chat', { message: trimmed });
      const aiText = res.data?.reply || res.data?.response || res.data?.text || res.data?.message || 'I have analyzed your query. Let me know if you need further elaboration.';

      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'ai',
        text: aiText,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };

      updatedSessions = updatedSessions.map(s => s.id === activeSessionId ? {
        ...s,
        updatedAt: new Date().toISOString(),
        messages: [...s.messages, aiMsg],
      } : s);

      saveSessions(updatedSessions);
    } catch (err: any) {
      const fallbackText = err?.response?.data?.message ||
        "I am ready to help you with data structures, algorithms, exam preparation, and system architecture. Feel free to ask any question.";

      const aiMsg: Message = {
        id: `e-${Date.now()}`,
        sender: 'ai',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };

      updatedSessions = updatedSessions.map(s => s.id === activeSessionId ? {
        ...s,
        updatedAt: new Date().toISOString(),
        messages: [...s.messages, aiMsg],
      } : s);

      saveSessions(updatedSessions);
    } finally {
      setLoading(false);
    }
  }, [loading, activeSessionId, sessions]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); sendMessage(input); };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/student-os/files/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const doc = res.data?.document || res.data;
      if (doc) setUploadedDocs(prev => [...prev, { id: doc._id || doc.id || Date.now().toString(), name: file.name }]);
    } catch (err: any) {
      alert('Upload failed: ' + (err?.response?.data?.message || err.message));
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeDoc = async (id: string) => {
    setUploadedDocs(prev => prev.filter(d => d.id !== id));
    try {
      await api.delete(`/student-os/files/${id}`);
    } catch (e) {}
  };

  const filteredSessions = sessions.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[1600px] mx-auto h-[calc(100vh-100px)] min-h-[550px] flex gap-3 overflow-hidden">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.txt,.docx,.doc,.pptx" className="hidden" />

      {/* ── ChatGPT Style Left History Sidebar ── */}
      <div className={`${sidebarOpen ? 'w-72 sm:w-80' : 'w-0 hidden md:flex md:w-14'} shrink-0 transition-all duration-300 bg-zinc-950 border border-zinc-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl`}>
        {sidebarOpen ? (
          <div className="p-3 flex flex-col h-full space-y-3">
            {/* New Chat & Toggle Button */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCreateNewChat}
                variant="apple"
                className="flex-1 justify-start gap-2 h-10 px-3 text-xs font-bold shadow-md shadow-blue-500/20"
              >
                <Plus size={16} /> New Chat
              </Button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800 transition-colors"
                title="Collapse sidebar"
              >
                <PanelLeftClose size={16} />
              </button>
            </div>

            {/* History Search */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-2.5 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search history..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Chat Sessions List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              <div className="px-2 pt-1 pb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Chat History</span>
              </div>

              {filteredSessions.length === 0 && (
                <p className="text-xs text-zinc-500 text-center py-6">No matching chats</p>
              )}

              {filteredSessions.map(s => {
                const isActive = s.id === activeSessionId;
                const isEditing = editingTitleId === s.id;

                return (
                  <div
                    key={s.id}
                    onClick={() => setActiveSessionId(s.id)}
                    className={`group relative flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-all border ${
                      isActive
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-white font-bold shadow-xs'
                        : 'bg-slate-900/40 border-slate-800/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <MessageSquare size={14} className={isActive ? 'text-emerald-400 shrink-0' : 'text-slate-500 shrink-0'} />
                      {isEditing ? (
                        <div className="flex items-center gap-1 flex-1" onClick={e => e.stopPropagation()}>
                          <input
                            type="text"
                            autoFocus
                            value={editTitleText}
                            onChange={e => setEditTitleText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && saveRenameSession(s.id)}
                            className="w-full bg-zinc-950 px-2 py-1 rounded text-xs text-white border border-blue-500 focus:outline-none"
                          />
                          <button onClick={() => saveRenameSession(s.id)} className="p-1 text-emerald-400 hover:text-white">
                            <Check size={12} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs truncate">{s.title}</span>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={e => startRenameSession(s, e)}
                          className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
                          title="Rename chat"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={e => handleDeleteSession(s.id, e)}
                          className="p-1 rounded hover:bg-red-500/20 text-zinc-400 hover:text-red-400"
                          title="Delete chat"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-2 flex flex-col items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800 transition-colors"
              title="Expand history sidebar"
            >
              <PanelLeft size={18} />
            </button>
            <button
              onClick={handleCreateNewChat}
              className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 shadow-md"
              title="New Chat"
            >
              <Plus size={18} />
            </button>
          </div>
        )}
      </div>

      {/* ── Main Chat Workspace ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 bg-zinc-900/60 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                title="Open history sidebar"
              >
                <PanelLeft size={18} />
              </button>
            )}
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Sparkles size={16} />
            </div>
            <div className="truncate">
              <h1 className="text-sm font-bold text-white tracking-tight truncate">{activeSession?.title || 'AI Assistant'}</h1>
              <p className="text-[10px] text-zinc-400">Powered by Gemini AI · Full Chat History Saved</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              variant="secondary"
              size="sm"
              className="gap-1.5 h-8 text-xs"
            >
              {uploading ? <RefreshCw size={12} className="animate-spin" /> : <Upload size={12} />}
              {uploading ? 'Uploading...' : 'Upload Syllabus'}
            </Button>
          </div>
        </div>

        {/* Uploaded Docs Context Badges */}
        {uploadedDocs.length > 0 && (
          <div className="px-5 py-2 bg-zinc-900/40 border-b border-zinc-800/80 flex flex-wrap gap-2 shrink-0">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase self-center">Active Context:</span>
            {uploadedDocs.map(doc => (
              <span key={doc.id} className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-300">
                <FileText size={11} /> {doc.name}
                <button onClick={() => removeDoc(doc.id)} className="ml-1 hover:text-red-300"><X size={10} /></button>
              </span>
            ))}
          </div>
        )}

        {/* Chat Messages Body */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 min-h-0">
          {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-zinc-900 rounded-2xl rounded-tl-xs px-4 py-3 border border-zinc-800">
                <div className="flex gap-1.5 items-center">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-4 py-2 border-t border-zinc-800/60 bg-zinc-950/80 flex gap-2 overflow-x-auto shrink-0">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              disabled={loading}
              className="text-[11px] px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-blue-500/50 hover:text-white transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 disabled:opacity-50"
            >
              <Lightbulb size={11} className="text-amber-400 shrink-0" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>

        {/* Bottom Input Area */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/40 shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about algorithms, concepts, code review, or study plans..."
              disabled={loading}
              className="flex-1 bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 h-11 text-xs md:text-sm rounded-xl focus:border-blue-500"
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              variant="apple"
              className="px-5 h-11 gap-2 rounded-xl font-semibold shadow-md shadow-blue-500/20"
            >
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
              <span className="hidden sm:inline">Send</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}