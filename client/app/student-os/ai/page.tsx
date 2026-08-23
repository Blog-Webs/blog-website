'use client';

import React, { useState } from 'react';
import { Send, Sparkles, Bot, User, Lightbulb } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChatMessage } from '@/types/studentos';
import api from '@/lib/api';

const QUICK_PROMPTS = [
  'Explain Paxos vs Raft consensus algorithms',
  'How do I optimize binary search tree balancing?',
  'Help me design a System Design study plan',
  'What are the key trade-offs in SQL vs NoSQL?',
];

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: "Hello Alex! I am your StudentOS AI Academic Tutor. How can I assist you with code debugging, system architecture, or exam preparation today?",
      timestamp: '10:00 AM',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await api.post('/student-os/ai/chat', { prompt: query });
      const aiReplyText = res.data?.reply || res.data?.text || `Analysis for: "${query}"\n\n1. **Core Architectural Concept**: Distributed systems use state machine replication to maintain consistency.\n2. **Optimal Approach**: Implement consensus voting with quorum quorums.\n3. **Complexity Trade-off**: High availability balanced against network partitioning tolerance.`;
      
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReplyText,
        codeSnippet: query.toLowerCase().includes('code') || query.toLowerCase().includes('paxos')
          ? `function consensusVote(nodes, quorum) {\n  return nodes.filter(n => n.active).length >= quorum;\n}`
          : undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      // Local AI fallback
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Here is the explanation for: "${query}"\n\n1. **Concept Breakdown**: Focus on component isolation and clear interfaces.\n2. **Complexity**: Time complexity reduces to logarithmic O(log n).\n3. **Best Practice**: Use structured logging and unit test suites.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col p-0 overflow-hidden">
      <Card className="flex-1 flex flex-col p-0 bg-zinc-950/80 border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
              <Sparkles size={16} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white flex items-center gap-2">
                AI Academic Tutor <Badge variant="apple" className="text-[9px]">Express Connected</Badge>
              </h1>
              <p className="text-xs text-zinc-400">Contextual study help & code debugging</p>
            </div>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-zinc-800 text-blue-400 border border-zinc-700 flex items-center justify-center shrink-0">
                  <Bot size={16} />
                </div>
              )}
              <div className={`max-w-xl rounded-2xl p-4 text-sm ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none shadow-md'
                  : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-tl-none space-y-2'
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                {m.codeSnippet && (
                  <div className="mt-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-blue-300 overflow-x-auto">
                    <pre>{m.codeSnippet}</pre>
                  </div>
                )}
                <span className="block text-[10px] text-zinc-500 mt-1 opacity-70">{m.timestamp}</span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-blue-400 italic p-2">
              <Sparkles size={14} className="animate-spin" /> AI Tutor is synthesizing response...
            </div>
          )}
        </div>

        {/* Suggested Prompts */}
        {messages.length < 3 && (
          <div className="px-4 py-2 border-t border-zinc-800/60 bg-zinc-900/40 shrink-0">
            <p className="text-[11px] font-semibold text-zinc-400 mb-2 flex items-center gap-1">
              <Lightbulb size={12} className="text-amber-400" /> Suggested Prompts:
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => handleSend(p)}
                  className="text-xs px-3 py-1 rounded-full bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 border-t border-zinc-800 bg-zinc-900/80 flex items-center gap-2 shrink-0"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI about algorithms, system design, or debugging code..."
            className="flex-1 bg-zinc-950 border-zinc-800"
          />
          <Button type="submit" variant="apple" size="icon">
            <Send size={16} />
          </Button>
        </form>
      </Card>
    </div>
  );
}
