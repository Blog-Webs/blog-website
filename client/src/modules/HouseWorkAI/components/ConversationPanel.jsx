import React, { useState, useRef, useEffect } from 'react';
import {
  Mic, MicOff, Send, User as UserIcon, Zap, AlertTriangle, Volume2,
  Copy, Check, Sparkles, MessageSquare, Bot, AudioLines
} from 'lucide-react';
import { useHouseWork } from '../context/HouseWorkContext';
import { AGENTS } from '../context/HouseWorkContext';

const AGENT_MAP = Object.fromEntries(AGENTS.map(a => [a.id, a]));

const QUICK_PROMPTS = [
  { label: '🐛 Debug backend',    text: 'Fix the login authentication and rate limiting error' },
  { label: '🎨 Design UI',        text: 'Design a sleek dark-mode glassmorphic dashboard UI' },
  { label: '📊 Analyze metrics',  text: 'Analyze user retention, conversion rates, and engagement' },
  { label: '🚀 Deploy pipeline',  text: 'Set up zero-downtime CI/CD deployment with Docker' },
  { label: '🔍 Test edge cases',  text: 'Write exhaustive unit and integration tests for payment flows' },
  { label: '📋 Plan roadmap',     text: 'Create a sprint plan for launching our new AI features' },
];

// ── Message Bubbles ────────────────────────────────────────────────────────

function UserBubble({ msg }) {
  return (
    <div className="flex justify-end items-end gap-2.5 group">
      <div className="max-w-[85%] flex flex-col items-end">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white px-4 py-3 text-[13px] leading-relaxed rounded-2xl rounded-br-xs shadow-lg shadow-blue-600/15 border border-blue-400/20">
          {msg.text}
        </div>
        <span className="text-[10px] text-white/30 mt-1 font-mono">
          {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <div className="w-7 h-7 rounded-xl bg-slate-700/80 border border-white/10 flex items-center justify-center shrink-0 mb-4 shadow-sm">
        <UserIcon size={13} className="text-white/80" />
      </div>
    </div>
  );
}

function AgentBubble({ msg, onSpeak }) {
  const agent = AGENT_MAP[msg.agentId];
  const [copied, setCopied] = useState(false);
  if (!agent) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-start gap-2.5 pl-1 group">
      {/* Agent avatar */}
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-base shadow-md mt-0.5"
        style={{ background: `${agent.color}22`, border: `1.5px solid ${agent.color}40` }}
        title={`${agent.name} (${agent.role})`}
      >
        {agent.emoji}
      </div>

      <div className="max-w-[88%] flex flex-col">
        {/* Header: Name, Badge, Actions */}
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[11px] font-bold tracking-tight" style={{ color: agent.color }}>
            {agent.name}
          </span>
          {msg.isPrimary && (
            <span
              className="text-[9px] px-2 py-0.5 rounded-full font-extrabold tracking-wider font-mono"
              style={{ background: `${agent.color}25`, color: agent.color, border: `1px solid ${agent.color}35` }}
            >
              PRIMARY
            </span>
          )}
          <span className="text-[10px] text-white/35 font-medium">{agent.role}</span>

          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <button
              onClick={handleCopy}
              title="Copy message"
              className="text-white/40 hover:text-white transition-colors p-1 rounded hover:bg-white/5"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            </button>
            {onSpeak && (
              <button
                onClick={() => onSpeak(msg.text)}
                title="Speak message"
                className="text-white/40 hover:text-white transition-colors p-1 rounded hover:bg-white/5"
              >
                <Volume2 size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Bubble Text */}
        <div
          className="px-4 py-3 text-[13px] text-slate-100 leading-relaxed rounded-2xl rounded-tl-xs shadow-md"
          style={{ background: `${agent.color}12`, border: `1px solid ${agent.color}28` }}
        >
          {msg.text}
        </div>

        <span className="text-[9px] text-white/25 mt-1 font-mono">
          {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

function AIBubble({ msg, onSpeak }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-end gap-2.5 group">
      <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-violet-600 flex items-center justify-center shrink-0 mb-4 shadow-lg shadow-blue-500/25 border border-blue-400/30">
        <Zap size={13} className="text-white" />
      </div>

      <div className="max-w-[88%] flex flex-col">
        {/* Agent team participants badges */}
        {msg.assignedAgents?.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <span className="text-[9px] font-mono text-white/30 uppercase tracking-wider">Agents:</span>
            {msg.assignedAgents.map(agId => {
              const ag = AGENT_MAP[agId];
              if (!ag) return null;
              return (
                <span
                  key={agId}
                  className="text-[9px] px-2 py-0.5 rounded-full font-bold font-mono flex items-center gap-1"
                  style={{ background: `${ag.color}18`, color: ag.color, border: `1px solid ${ag.color}30` }}
                >
                  <span>{ag.emoji}</span>
                  <span>{ag.name}</span>
                </span>
              );
            })}
          </div>
        )}

        <div className={`px-4 py-3 text-[13px] leading-relaxed rounded-2xl rounded-bl-xs shadow-lg border ${
          msg.isError
            ? 'bg-rose-950/40 border-rose-500/30 text-rose-200'
            : 'bg-[#151c2c] border-white/10 text-slate-100'
        }`}>
          {msg.isError && <AlertTriangle size={13} className="inline mr-1.5 text-rose-400" />}
          {msg.text}
        </div>

        <div className="flex items-center justify-between mt-1 px-0.5">
          <span className="text-[9px] text-white/25 font-mono">
            {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              title="Copy"
              className="text-white/40 hover:text-white transition-colors text-[10px] font-mono flex items-center gap-1"
            >
              {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            {onSpeak && (
              <button
                onClick={() => onSpeak(msg.text)}
                title="Speak coordinator audio"
                className="text-white/40 hover:text-white transition-colors text-[10px] font-mono flex items-center gap-1"
              >
                <Volume2 size={11} />
                <span>Listen</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div className="flex items-end gap-2.5">
      <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shrink-0 shadow-lg border border-amber-400/30 animate-pulse">
        <Sparkles size={13} className="text-white" />
      </div>
      <div className="bg-[#151c2c] rounded-2xl rounded-bl-xs border border-white/10 px-4 py-3 shadow-lg">
        <div className="flex gap-2 items-center">
          {[0, 150, 300].map(delay => (
            <div
              key={delay}
              className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
          <span className="text-[11px] text-amber-300/80 ml-2 font-mono font-medium">
            OpenAI ChatGPT orchestrating multi-agents…
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function ConversationPanel() {
  const {
    messages, agents, isThinking, isListening, isSpeaking, aiAvailable, aiProvider,
    interimTranscript, voiceError, audioLevel,
    sendMessage, speak, startListening, stopListening,
  } = useHouseWork();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const activeAgents  = agents.filter(a => a.status !== 'idle');
  const workingAgents = agents.filter(a => a.status === 'working');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Sync interim transcript in real time
  useEffect(() => {
    if (interimTranscript) {
      setInput(interimTranscript);
    }
  }, [interimTranscript]);

  const handleSend = () => {
    const t = input.trim();
    if (!t) return;
    sendMessage(t);
    setInput('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.focus();
    }
  };

  const renderMessage = (msg) => {
    if (msg.role === 'user')  return <UserBubble  key={msg.id} msg={msg} />;
    if (msg.role === 'agent') return <AgentBubble key={msg.id} msg={msg} onSpeak={speak} />;
    return                           <AIBubble    key={msg.id} msg={msg} onSpeak={speak} />;
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0e17] overflow-hidden border-l border-white/8 select-none">
      {/* ── Top Header ─────────────────────────────────────────────────── */}
      <div className="px-4 py-3.5 border-b border-white/8 bg-[#0d1322]/90 backdrop-blur-md shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-white/10">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <div className="text-[13px] font-bold text-white flex items-center gap-1.5">
              <span>AI Command Center</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 font-mono font-semibold border border-blue-500/30">
                GPT-4o
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${aiAvailable ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
              <span className={`text-[10px] font-mono font-medium ${aiAvailable ? 'text-emerald-400/90' : 'text-amber-400/90'}`}>
                {aiAvailable ? 'OpenAI ChatGPT Active' : 'Simulated Team Mode'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/50 font-mono font-bold">
            6 PERSONAS
          </span>
        </div>
      </div>

      {/* ── Active Agents Working Bar ──────────────────────────────────── */}
      {activeAgents.length > 0 && (
        <div className="px-3.5 py-2 border-b border-white/8 bg-blue-950/20 shrink-0">
          <div className="flex items-center justify-between text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1.5">
            <span>Team Dispatch State</span>
            <span>{workingAgents.length} Running · {activeAgents.filter(a => a.status === 'done').length} Completed</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {activeAgents.map(a => (
              <div
                key={a.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono transition-all animate-pulse"
                style={{ background: `${a.color}20`, color: a.color, border: `1px solid ${a.color}35` }}
              >
                <span>{a.emoji}</span>
                <span>{a.name}</span>
                <span>{a.status === 'working' ? '⚡' : '✅'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Messages Feed (Roomy Desktop View) ─────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {messages.map(renderMessage)}
        {isThinking && <ThinkingBubble />}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Quick Prompt Chips ─────────────────────────────────────────── */}
      <div className="px-3 py-2 border-t border-white/8 bg-[#0d1322]/50 shrink-0">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
          {QUICK_PROMPTS.map(qp => (
            <button
              key={qp.label}
              onClick={() => sendMessage(qp.text)}
              className="shrink-0 text-[10px] px-3 py-1.5 rounded-xl bg-white/[0.04] text-white/60 hover:bg-white/[0.09] hover:text-white transition-all border border-white/8 hover:border-white/20 font-medium font-mono"
            >
              {qp.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Live Audio Status Banner ───────────────────────────────────── */}
      {(isListening || isSpeaking) && (
        <div className={`mx-3 mb-2 py-2 px-3.5 rounded-xl flex items-center justify-between text-xs font-mono font-semibold shrink-0 shadow-md ${
          isListening
            ? 'bg-rose-950/60 border border-rose-500/40 text-rose-200 animate-pulse'
            : 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200'
        }`}>
          <div className="flex items-center gap-2 truncate">
            {isListening ? <Mic size={15} className="text-rose-400 shrink-0 animate-bounce" /> : <Volume2 size={15} className="text-emerald-400 shrink-0" />}
            <span className="truncate">
              {isListening ? (interimTranscript ? `"${interimTranscript}"` : 'Listening to microphone…') : 'AI Coordinator reading response…'}
            </span>
          </div>

          {isListening && (
            <button
              onClick={stopListening}
              className="ml-2 px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold"
            >
              Done
            </button>
          )}
        </div>
      )}

      {/* ── Voice Error Alert ──────────────────────────────────────────── */}
      {voiceError && (
        <div className="mx-3 mb-2 py-2 px-3.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-[11px] font-mono shrink-0 flex items-center gap-2">
          <AlertTriangle size={14} className="shrink-0 text-amber-400" />
          <span>{voiceError}</span>
        </div>
      )}

      {/* ── Input Dock ─────────────────────────────────────────────────── */}
      <div className="p-3.5 bg-[#0b101c] border-t border-white/8 shrink-0 space-y-2">
        <div className="flex gap-2 items-end">
          {/* Voice Microphone Trigger Button */}
          <button
            type="button"
            onClick={() => (isListening ? stopListening() : startListening())}
            title={isListening ? 'Stop listening' : 'Speak to Voice Assistant'}
            className={`p-3 rounded-2xl transition-all shrink-0 shadow-md ${
              isListening
                ? 'bg-rose-600 text-white shadow-rose-600/50 animate-pulse ring-2 ring-rose-400'
                : 'bg-white/[0.06] text-white/80 hover:bg-white/[0.12] hover:text-white border border-white/10'
            }`}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {/* Prompt Textarea */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Instruct your multi-agent team or ask anything…"
            rows={1}
            className="flex-1 resize-none bg-white/[0.05] border border-white/10 rounded-2xl px-4 py-3 text-[13px] text-white placeholder-white/30 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40 transition-all leading-snug"
            style={{ maxHeight: 120 }}
            onInput={e => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
          />

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-blue-600/25 shrink-0 border border-blue-400/30"
          >
            <Send size={17} />
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] text-white/30 font-mono px-1">
          <span>Enter ↵ to send · Shift+Enter for newline</span>
          <span className="flex items-center gap-1">
            <Mic size={11} className="text-rose-400" /> Perplexity Voice Support
          </span>
        </div>
      </div>
    </div>
  );
}
