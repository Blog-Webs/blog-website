'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Sparkles, Bot, User, Upload, X, FileText, Lightbulb, RefreshCw,
  Plus, MessageSquare, Trash2, Edit3, Check, Search, PanelLeftClose, PanelLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';

type AgentMeta = { id: string; name: string; role: string; emoji: string };

type Message = {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  agents?: AgentMeta[];
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
  text: "Hello! We are your StudentOS Multi-Agent Intelligence Team (Sophia 🎓, Dev 👨‍💻, Atlas 🏗️, Sage 📋, Nova 🔍). How can our specialized agents collaborate on your code, system design, or exam prep today?",
  timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  agents: [
    { id: 'sophia', name: 'Sophia', role: 'Academic Tutor', emoji: '🎓' },
    { id: 'dev', name: 'Dev', role: 'Code Specialist', emoji: '👨‍💻' },
    { id: 'atlas', name: 'Atlas', role: 'System Architect', emoji: '🏗️' },
  ],
};

function MessageBubble({ msg }: { msg: Message }) {
  const isAi = msg.sender === 'ai';

  const renderText = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```|`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3).replace(/^[a-z]+\n/, '');
        return (
          <pre key={i} className="mt-2 p-3 bg-gray-900 rounded-md border border-gray-800 text-emerald-300 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
            {code}
          </pre>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="px-1.5 py-0.5 bg-blue-50 text-blue-800 rounded-sm text-xs font-mono border border-blue-200">{part.slice(1,-1)}</code>;
      }
      return <span key={i} className="whitespace-pre-wrap">{part}</span>;
    });
  };

  return (
    <div className={`flex gap-2.5 ${isAi ? 'items-start' : 'items-start flex-row-reverse'}`}>
      <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${isAi ? 'bg-blue-600 text-white shadow-xs' : 'bg-gray-800 text-white'}`}>
        {isAi ? <Bot size={15} /> : <User size={15} />}
      </div>
      <div className="max-w-[84%]">
        {isAi && msg.agents && msg.agents.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1">
            <span className="text-[10px] text-blue-700 font-semibold uppercase tracking-wider self-center mr-1">Collaborated:</span>
            {msg.agents.map(a => (
              <span key={a.id} className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 flex items-center gap-1 font-medium">
                <span>{a.emoji}</span> {a.name} <span className="text-blue-500 font-mono">({a.role})</span>
              </span>
            ))}
          </div>
        )}
        <div className={`rounded-lg px-3.5 py-2.5 text-xs leading-relaxed ${
          isAi ? 'bg-white text-gray-800 border border-gray-200 shadow-xs' : 'bg-blue-600 text-white shadow-xs'
        }`}>
          {renderText(msg.text)}
        </div>
        <p className={`text-[10px] text-gray-400 mt-1 px-1 font-mono ${isAi ? 'text-left' : 'text-right'}`}>{msg.timestamp}</p>
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
        agents: res.data?.agents || [],
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
    <div className="max-w-[1600px] mx-auto h-[calc(100vh-120px)] min-h-[550px] flex gap-3 overflow-hidden">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.txt,.docx,.doc,.pptx" className="hidden" />

      {/* ── Left History Sidebar ── */}
      <div className={`${sidebarOpen ? 'w-64 sm:w-72' : 'w-0 hidden md:flex md:w-12'} shrink-0 transition-all duration-200 bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden shadow-xs`}>
        {sidebarOpen ? (
          <div className="p-3 flex flex-col h-full space-y-2.5">
            {/* New Chat & Toggle Button */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCreateNewChat}
                className="flex-1 flex items-center justify-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium shadow-xs bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                <Plus size={14} /> New Chat
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 transition-colors"
                title="Collapse sidebar"
              >
                <PanelLeftClose size={15} />
              </button>
            </div>

            {/* History Search */}
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-2.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search history..."
                className="w-full pl-7 pr-3 py-1 rounded-md bg-white border border-gray-300 text-xs text-gray-900 placeholder:text-gray-400 focus:border-blue-500"
              />
            </div>

            {/* Chat Sessions List */}
            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              <div className="px-1.5 pt-1 pb-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Chat History</span>
              </div>

              {filteredSessions.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-6">No matching chats</p>
              )}

              {filteredSessions.map(s => {
                const isActive = s.id === activeSessionId;
                const isEditing = editingTitleId === s.id;

                return (
                  <div
                    key={s.id}
                    onClick={() => setActiveSessionId(s.id)}
                    className={`group relative flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors border ${
                      isActive
                        ? 'bg-blue-50 border-blue-200 text-blue-900 font-semibold'
                        : 'bg-white border-transparent text-gray-700 hover:bg-gray-50 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <MessageSquare size={13} className={isActive ? 'text-blue-600 shrink-0' : 'text-gray-400 shrink-0'} />
                      {isEditing ? (
                        <div className="flex items-center gap-1 flex-1" onClick={e => e.stopPropagation()}>
                          <input
                            type="text"
                            autoFocus
                            value={editTitleText}
                            onChange={e => setEditTitleText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && saveRenameSession(s.id)}
                            className="w-full bg-white px-1.5 py-0.5 rounded-sm text-xs text-gray-900 border border-blue-500 focus:outline-none"
                          />
                          <button onClick={() => saveRenameSession(s.id)} className="p-0.5 text-blue-600 hover:text-blue-800">
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
                          className="p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700"
                          title="Rename chat"
                        >
                          <Edit3 size={11} />
                        </button>
                        <button
                          onClick={e => handleDeleteSession(s.id, e)}
                          className="p-0.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"
                          title="Delete chat"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-2 flex flex-col items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 transition-colors"
              title="Expand history sidebar"
            >
              <PanelLeft size={16} />
            </button>
            <button
              onClick={handleCreateNewChat}
              className="p-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
              title="New Chat"
            >
              <Plus size={16} />
            </button>
          </div>
        )}
      </div>

      {/* ── Main Chat Workspace ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 bg-gray-50 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                title="Open history sidebar"
              >
                <PanelLeft size={16} />
              </button>
            )}
            <div className="w-7 h-7 rounded-md bg-white border border-gray-200 text-blue-600 flex items-center justify-center shrink-0">
              <Sparkles size={15} />
            </div>
            <div className="truncate">
              <h1 className="text-xs font-semibold text-gray-900 tracking-tight truncate">{activeSession?.title || 'AI Assistant'}</h1>
              <p className="text-[10px] text-gray-500 font-mono">StudentOS AI Tutor · Multi-Agent Orchestration</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1 rounded-md text-xs font-medium shadow-xs transition-colors"
            >
              {uploading ? <RefreshCw size={12} className="animate-spin text-blue-600" /> : <Upload size={12} />}
              <span>{uploading ? 'Uploading...' : 'Upload Syllabus'}</span>
            </button>
          </div>
        </div>

        {/* Uploaded Docs Context Badges */}
        {uploadedDocs.length > 0 && (
          <div className="px-4 py-1.5 bg-gray-50 border-b border-gray-200 flex flex-wrap gap-1.5 shrink-0">
            <span className="text-[10px] text-gray-500 font-semibold uppercase self-center mr-1">Active Context:</span>
            {uploadedDocs.map(doc => (
              <span key={doc.id} className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 bg-white border border-gray-300 rounded-md text-gray-700">
                <FileText size={11} /> {doc.name}
                <button onClick={() => removeDoc(doc.id)} className="ml-1 hover:text-red-600"><X size={10} /></button>
              </span>
            ))}
          </div>
        )}

        {/* Chat Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 min-h-0 bg-gray-50/40">
          {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}

          {loading && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <Bot size={15} />
              </div>
              <div className="bg-white rounded-lg px-3.5 py-2.5 border border-gray-200 shadow-xs">
                <div className="flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-3 py-1.5 border-t border-gray-200 bg-white flex gap-1.5 overflow-x-auto shrink-0">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              disabled={loading}
              className="text-[11px] px-2.5 py-1 rounded-md bg-white border border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 disabled:opacity-50 font-medium"
            >
              <Lightbulb size={11} className="text-blue-600 shrink-0" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>

        {/* Bottom Input Area */}
        <div className="p-3 border-t border-gray-200 bg-white shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about algorithms, concepts, code review, or study plans..."
              disabled={loading}
              className="flex-1 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 h-9 text-xs rounded-md focus:border-blue-500"
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-3.5 h-9 flex items-center gap-1.5 rounded-md font-medium text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors disabled:opacity-50"
            >
              {loading ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}