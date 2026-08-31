import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Bot, User as UserIcon, Zap, AlertTriangle } from 'lucide-react';
import { useHouseWork } from '../context/HouseWorkContext';
import { AGENTS } from '../context/HouseWorkContext';

const AGENT_MAP = Object.fromEntries(AGENTS.map(a => [a.id, a]));

const QUICK_PROMPTS = [
  { label: '🐛 Fix bug',     text: 'Fix the login authentication bug in the backend' },
  { label: '🎨 Design',      text: 'Design a modern dark dashboard UI with glassmorphism' },
  { label: '📊 Analyze',     text: 'Analyze this week\'s user engagement and retention metrics' },
  { label: '🚀 Deploy',      text: 'Deploy the latest build to production with zero downtime' },
  { label: '🔍 QA Test',     text: 'Write comprehensive tests for the payment flow edge cases' },
  { label: '📋 Plan sprint', text: 'Plan and schedule the next two-week sprint for the team' },
];

// ── Message bubbles ────────────────────────────────────────────────────────

function UserBubble({ msg }) {
  return (
    <div className="flex justify-end items-end gap-2">
      <div className="max-w-[80%] flex flex-col items-end">
        <div className="bg-blue-600 text-white px-3.5 py-2.5 text-[13px] leading-relaxed rounded-2xl rounded-br-sm shadow-lg">
          {msg.text}
        </div>
        <span className="text-[9px] text-white/25 mt-1 font-mono">
          {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center shrink-0 mb-4">
        <UserIcon size={11} className="text-white/70" />
      </div>
    </div>
  );
}

function AgentBubble({ msg }) {
  const agent = AGENT_MAP[msg.agentId];
  if (!agent) return null;
  return (
    <div className="flex items-start gap-2 pl-2">
      {/* Agent avatar */}
      <div
        className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-base shadow-md mt-0.5"
        style={{ background: `${agent.color}22`, border: `1px solid ${agent.color}40` }}
        title={agent.name}
      >
        {agent.emoji}
      </div>
      <div className="max-w-[85%] flex flex-col">
        {/* Agent name + role */}
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[10px] font-bold" style={{ color: agent.color }}>{agent.name}</span>
          {msg.isPrimary && (
            <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold"
              style={{ background: `${agent.color}20`, color: agent.color, border: `1px solid ${agent.color}30` }}>
              PRIMARY
            </span>
          )}
          <span className="text-[9px] text-white/30">{agent.role}</span>
        </div>
        <div
          className="px-3 py-2.5 text-[12px] text-white/90 leading-relaxed rounded-xl rounded-tl-sm shadow-md"
          style={{ background: `${agent.color}10`, border: `1px solid ${agent.color}25` }}
        >
          {msg.text}
        </div>
        <span className="text-[9px] text-white/20 mt-1 font-mono">
          {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

function AIBubble({ msg }) {
  return (
    <div className="flex items-end gap-2">
      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-violet-500 flex items-center justify-center shrink-0 mb-4 shadow-lg shadow-blue-500/20">
        <Zap size={11} className="text-white" />
      </div>
      <div className="max-w-[85%] flex flex-col">
        {/* Multi-agent badges */}
        {msg.assignedAgents?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {msg.assignedAgents.map(agId => {
              const ag = AGENT_MAP[agId];
              if (!ag) return null;
              return (
                <span key={agId} className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                  style={{ background: `${ag.color}18`, color: ag.color, border: `1px solid ${ag.color}28` }}>
                  {ag.emoji} {ag.name}
                </span>
              );
            })}
          </div>
        )}
        <div className={`px-3.5 py-2.5 text-[13px] leading-relaxed rounded-2xl rounded-bl-sm shadow-md border ${
          msg.isError
            ? 'bg-red-950/30 border-red-500/20 text-red-300'
            : 'bg-[#1a2030] border-white/6 text-white/90'
        }`}>
          {msg.isError && <AlertTriangle size={12} className="inline mr-1.5 text-red-400" />}
          {msg.text}
        </div>
        <span className="text-[9px] text-white/20 mt-1 font-mono">
          {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-violet-500 flex items-center justify-center shrink-0 shadow-lg">
        <Zap size={11} className="text-white" />
      </div>
      <div className="bg-[#1a2030] rounded-2xl rounded-bl-sm border border-white/6 px-4 py-3 shadow-md">
        <div className="flex gap-1.5 items-center">
          {[0, 150, 300].map(delay => (
            <div key={delay} className="w-1.5 h-1.5 bg-blue-400 rounded-full"
              style={{ animationName: 'hwThinkBounce', animationDuration: '1s', animationIterationCount: 'infinite', animationDelay: `${delay}ms` }} />
          ))}
          <span className="text-[10px] text-white/30 ml-2 font-mono">dispatching agents…</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function ConversationPanel() {
  const {
    messages, agents, isThinking, isListening, isSpeaking, aiAvailable,
    sendMessage, startListening, stopListening,
  } = useHouseWork();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const activeAgents  = agents.filter(a => a.status !== 'idle');
  const workingAgents = agents.filter(a => a.status === 'working');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSend = () => {
    const t = input.trim();
    if (!t) return;
    sendMessage(t);
    setInput('');
    inputRef.current?.focus();
  };

  const renderMessage = (msg) => {
    if (msg.role === 'user')  return <UserBubble  key={msg.id} msg={msg} />;
    if (msg.role === 'agent') return <AgentBubble key={msg.id} msg={msg} />;
    return                           <AIBubble    key={msg.id} msg={msg} />;
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 bg-[#0a0f1e] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Zap size={14} className="text-white" />
          </div>
          <div>
            <div className="text-[13px] font-bold text-white">AI Coordinator</div>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${aiAvailable ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
              <span className={`text-[9px] font-mono ${aiAvailable ? 'text-emerald-400/70' : 'text-amber-400/70'}`}>
                {aiAvailable ? 'Gemini AI Connected' : 'Simulated Mode'}
              </span>
            </div>
          </div>
          <div className="ml-auto text-[10px] text-white/25 font-mono">6 AGENTS</div>
        </div>
      </div>

      {/* Active agents bar */}
      {activeAgents.length > 0 && (
        <div className="px-3 py-2 border-b border-white/5 bg-amber-500/4 shrink-0">
          <div className="text-[9px] font-mono text-white/25 uppercase tracking-widest mb-1">
            {workingAgents.length} Working · {activeAgents.filter(a => a.status === 'done').length} Done
          </div>
          <div className="flex flex-wrap gap-1.5">
            {activeAgents.map(a => (
              <div key={a.id}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                style={{ background: `${a.color}18`, color: a.color, border: `1px solid ${a.color}28` }}>
                <span>{a.emoji}</span>
                <span>{a.name}</span>
                <span className="opacity-60">{a.status === 'working' ? '⚡' : '✅'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-none">
        {messages.map(renderMessage)}
        {isThinking && <ThinkingBubble />}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      <div className="px-3 py-2 border-t border-white/5 bg-[#0a0f1e]/30 shrink-0">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
          {QUICK_PROMPTS.map(qp => (
            <button key={qp.label} onClick={() => sendMessage(qp.text)}
              className="shrink-0 text-[10px] px-2.5 py-1 rounded-full bg-white/5 text-white/45 hover:bg-white/10 hover:text-white/80 transition-all border border-white/5 hover:border-white/15 font-medium">
              {qp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Voice status */}
      {(isListening || isSpeaking) && (
        <div className={`mx-3 mb-2 py-1.5 rounded-xl text-center text-[11px] font-semibold shrink-0 ${
          isListening
            ? 'bg-pink-500/12 border border-pink-500/20 text-pink-400'
            : 'bg-emerald-500/12 border border-emerald-500/20 text-emerald-400'
        }`}>
          {isListening ? '🎙️ Listening… speak now' : '🔊 AI coordinator speaking…'}
        </div>
      )}

      {/* Input */}
      <div className="px-3 pb-3 shrink-0 space-y-2">
        <div className="flex gap-2 items-end">
          <button onClick={() => isListening ? stopListening() : startListening()}
            className={`p-2.5 rounded-xl transition-all shrink-0 ${
              isListening
                ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/40 animate-pulse'
                : 'bg-white/6 text-white/50 hover:bg-white/12 hover:text-white border border-white/8'
            }`}>
            {isListening ? <MicOff size={15} /> : <Mic size={15} />}
          </button>

          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Tell the team what to do…"
            rows={1}
            className="flex-1 resize-none bg-white/6 border border-white/10 rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder-white/25 focus:outline-none focus:border-blue-500/40 transition-all leading-snug"
            style={{ maxHeight: 100 }}
            onInput={e => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
            }}
          />

          <button onClick={handleSend} disabled={!input.trim()}
            className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-all disabled:opacity-35 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 shrink-0">
            <Send size={15} />
          </button>
        </div>
        <p className="text-[9px] text-white/18 text-center font-mono">
          Enter to send · 🎙️ for voice · Multiple agents work simultaneously
        </p>
      </div>
    </div>
  );
}
