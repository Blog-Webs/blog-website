import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Cpu, Sparkles, Users, Clock, CheckCircle2, MessageSquare, Send
} from 'lucide-react';
import { HouseWorkProvider, useHouseWork } from '../context/HouseWorkContext';
import AgentOrb from '../components/AgentOrb';
import OfficeSimulation from '../components/OfficeSimulation';
import ConversationPanel from '../components/ConversationPanel';

function AgentRosterGrid() {
  const { agents, sendDirectAgentMessage, isThinking } = useHouseWork();
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [directPrompt, setDirectPrompt] = useState('');

  const handleDirectSend = (e) => {
    e.preventDefault();
    if (!directPrompt.trim() || !selectedAgent) return;
    sendDirectAgentMessage(selectedAgent.id, directPrompt.trim());
    setDirectPrompt('');
    setSelectedAgent(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={15} className="text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-200">
            Multi-Agent Team Personas (6 Personas)
          </h3>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          OpenAI ChatGPT Active
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {agents.map((ag) => {
          const isBusy = ag.status === 'working';
          const isDone = ag.status === 'done';

          return (
            <div
              key={ag.id}
              onClick={() => setSelectedAgent(ag)}
              className="p-3 rounded-2xl bg-[#0c121e]/90 border border-white/8 hover:border-white/20 transition-all cursor-pointer group shadow-md hover:-translate-y-0.5 flex flex-col justify-between"
              style={{
                boxShadow: isBusy ? `0 0 15px ${ag.color}25` : undefined,
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-base shadow-md shrink-0"
                  style={{ background: `${ag.color}25`, border: `1.5px solid ${ag.color}45` }}
                >
                  {ag.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                    {ag.name}
                  </div>
                  <div className="text-[9px] text-white/40 font-mono truncate">{ag.role}</div>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span
                  className={`text-[8px] px-1.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1 ${
                    isBusy
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                      : isDone
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-white/5 text-white/40 border border-white/10'
                  }`}
                >
                  {isBusy ? 'WORKING' : isDone ? 'DONE' : 'READY'}
                </span>
                <span className="text-[9px] text-white/30 font-mono">Chat 💬</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Direct Agent Modal / Dialog */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#101726] border-2 border-white/15 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 font-sans text-white animate-mac-fade-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
                  style={{ background: `${selectedAgent.color}25`, border: `2px solid ${selectedAgent.color}50` }}
                >
                  {selectedAgent.emoji}
                </div>
                <div>
                  <h3 className="text-base font-bold">{selectedAgent.name}</h3>
                  <p className="text-xs font-mono" style={{ color: selectedAgent.color }}>{selectedAgent.role}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAgent(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              Send a direct persona prompt to {selectedAgent.name}. OpenAI ChatGPT will generate response directly in character.
            </p>

            <form onSubmit={handleDirectSend} className="space-y-3">
              <textarea
                value={directPrompt}
                onChange={e => setDirectPrompt(e.target.value)}
                placeholder={`Ask ${selectedAgent.name} anything related to ${selectedAgent.role}...`}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-400 font-sans"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAgent(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!directPrompt.trim() || isThinking}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold shadow-lg disabled:opacity-40"
                >
                  Dispatch to {selectedAgent.name}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function HouseWorkContent() {
  return (
    <div
      className="min-h-screen flex flex-col overflow-hidden text-slate-100 select-none"
      style={{
        background: 'radial-gradient(ellipse 90% 70% at 50% -10%, rgba(30,58,138,0.12), transparent), #050811',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <header className="shrink-0 h-14 border-b border-white/8 bg-[#070b16]/90 backdrop-blur-md px-5 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/8 transition-all flex items-center gap-1.5 text-xs font-mono"
            title="Return to Main Portal"
          >
            <ArrowLeft size={15} />
            <span>Home</span>
          </Link>

          <div className="w-px h-5 bg-white/10" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/30 border border-white/15">
              <Cpu size={16} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white tracking-tight">
                  HouseWork<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">AI</span>
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono font-bold">
                  OpenAI ChatGPT Active
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-white/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>6 DEMO OFFICE AGENTS</span>
          </div>

          <Link
            to="/housework-ai/setup"
            className="text-[11px] px-3 py-1.5 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all border border-white/10 font-mono font-medium"
          >
            ⚙️ Setup Guide
          </Link>
        </div>
      </header>

      {/* ── Main Layout: Interactive Office + Orb (Left/Center) & Chat (Right) ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT / CENTER: Demo Office Simulation & Neural Orb */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {/* Perplexity Acoustic Orb Hero */}
          <div
            className="relative rounded-3xl border border-white/10 p-6 overflow-hidden shadow-2xl"
            style={{
              background: 'radial-gradient(ellipse 70% 80% at 50% 50%, rgba(59,130,246,0.08), rgba(8,12,24,0.95))',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold">
                <Sparkles size={13} />
                <span>Perplexity Voice & Neural Coordinator</span>
              </div>
              <div className="text-[10px] font-mono text-white/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                ACOUSTIC MICROPHONE SENSING
              </div>
            </div>

            <AgentOrb />
          </div>

          {/* 🏢 DEMO OFFICE SIMULATION (Employees working, talking & assigning work together) */}
          <div className="space-y-2">
            <OfficeSimulation />
          </div>

          {/* Multi-Agent Roster Grid */}
          <AgentRosterGrid />
        </main>

        {/* RIGHT: Chat & Voice Command Center */}
        <aside
          className="shrink-0 flex flex-col h-full z-20 transition-all border-l border-white/8"
          style={{
            width: 'min(480px, 40vw)',
            minWidth: '380px',
          }}
        >
          <ConversationPanel />
        </aside>
      </div>
    </div>
  );
}

export default function HouseWorkAIPage() {
  return (
    <HouseWorkProvider>
      <HouseWorkContent />
    </HouseWorkProvider>
  );
}
