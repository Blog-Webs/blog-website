'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Sparkles, Bot, User, Upload, X, FileText, Lightbulb, RefreshCw } from 'lucide-react';
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

type UploadedDoc = { id: string; name: string };

const QUICK_PROMPTS = [
  'Explain Paxos vs Raft consensus algorithms',
  'How do I optimize binary search tree balancing?',
  'Help me design a System Design study plan',
  'What are the key trade-offs in SQL vs NoSQL?',
  'Explain the CAP theorem with real examples',
  'Write a Python solution for the N-Queens problem',
];

function MessageBubble({ msg }: { msg: Message }) {
  const isAi = msg.sender === 'ai';

  // Render AI text with code block support
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
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isAi ? 'bg-blue-600' : 'bg-zinc-700'}`}>
        {isAi ? <Bot size={16} className="text-white" /> : <User size={16} className="text-white" />}
      </div>
      <div className={`max-w-[80%] ${isAi ? '' : ''}`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isAi ? 'bg-zinc-900 text-zinc-200 rounded-tl-sm' : 'bg-blue-600 text-white rounded-tr-sm'
        }`}>
          {renderText(msg.text)}
        </div>
        <p className="text-[10px] text-zinc-500 mt-1 px-1">{msg.timestamp}</p>
      </div>
    </div>
  );
}

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([{
    id: 'm-0',
    sender: 'ai',
    text: "Hello! I am your StudentOS AI Academic Tutor powered by Gemini. I can help with code debugging, system architecture, exam preparation, and your uploaded course syllabi. How can I assist you today?",
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Load existing uploaded docs
  useEffect(() => {
    api.get('/student-os/files')
      .then(res => {
        const docs = (res.data?.documents || []).map((d: any) => ({ id: d._id || d.id, name: d.filename || d.name || 'Document' }));
        setUploadedDocs(docs);
      })
      .catch(() => {});
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/student-os/ai/chat', { message: trimmed });
      const aiText = res.data?.response || res.data?.text || res.data?.message || 'I could not generate a response. Please try again.';
      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'ai',
        text: aiText,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: `e-${Date.now()}`,
        sender: 'ai',
        text: 'Sorry, I encountered an error. Please ensure your GEMINI_API_KEY is configured on the server.',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      }]);
    }
    setLoading(false);
  }, [loading]);

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

  const removeDoc = (id: string) => { setUploadedDocs(prev => prev.filter(d => d.id !== id)); };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-120px)] min-h-[500px]">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.txt,.docx,.doc,.pptx" className="hidden" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="text-blue-400" /> AI Academic Tutor
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">Powered by Gemini with RAG over your uploaded syllabi and course content.</p>
        </div>
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          variant="secondary"
          size="sm"
          className="gap-2 self-start sm:self-center"
        >
          {uploading ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
          {uploading ? 'Uploading...' : 'Upload Syllabus'}
        </Button>
      </div>

      {/* Uploaded Docs Context Badges */}
      {uploadedDocs.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 shrink-0">
          <span className="text-[10px] text-zinc-500 font-semibold uppercase self-center">Context:</span>
          {uploadedDocs.map(doc => (
            <span key={doc.id} className="flex items-center gap-1 text-[11px] px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-300">
              <FileText size={11} /> {doc.name}
              <button onClick={() => removeDoc(doc.id)} className="ml-1 hover:text-red-300"><X size={10} /></button>
            </span>
          ))}
        </div>
      )}

      {/* Quick Prompts */}
      <div className="flex gap-2 flex-wrap mb-3 shrink-0">
        {QUICK_PROMPTS.slice(0, 3).map((prompt) => (
          <button
            key={prompt}
            onClick={() => sendMessage(prompt)}
            disabled={loading}
            className="text-[11px] px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-300 hover:border-blue-500/50 hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Lightbulb size={11} className="text-amber-400 shrink-0" />
            <span className="truncate max-w-[180px]">{prompt}</span>
          </button>
        ))}
      </div>

      {/* Chat Window */}
      <Card className="flex-1 p-4 overflow-y-auto bg-zinc-950/80 border-zinc-800 space-y-4 min-h-0">
        {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center"><Bot size={16} className="text-white" /></div>
            <div className="bg-zinc-900 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </Card>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="mt-3 flex gap-2 shrink-0">
        <Input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about algorithms, concepts, code review, or study plans..."
          disabled={loading}
          className="flex-1 bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500"
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
        />
        <Button
          type="submit"
          disabled={loading || !input.trim()}
          variant="apple"
          className="px-4 h-10 gap-2"
        >
          {loading ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
          <span className="hidden sm:inline">Send</span>
        </Button>
      </form>
    </div>
  );
}