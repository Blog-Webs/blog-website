import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Cpu, Sparkles, Gamepad2, Layers, Volume2, Users,
  CheckCircle2, Clock, Zap, Bot
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-200">
            Active Multi-Agent Roster (6 Personas)
          </h3>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Parallel Execution Ready
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {agents.map((ag) => {
          const isBusy = ag.status === 'working';
          const isDone = ag.status === 'done';

          return (
            <div
              key={ag.id}
              onClick={() => setSelectedAgent(ag)}
              className="p-3.5 rounded-2xl bg-[#0c121e]/80 border border-white/8 hover:border-white/20 transition-all cursor-pointer group shadow-md hover:shadow-xl hover:-translate-y-0.5 flex flex-col justify-between"
              style={{
                boxShadow: isBusy ? `0 0 15px ${ag.color}25` : undefined,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-md shrink-0"
                    style={{ background: `${ag.color}25`, border: `1.5px solid ${ag.color}45` }}
                  >
                    {ag.emoji}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                      {ag.name}
                    </div>
                    <div className="text-[10px] text-white/40 font-mono">{ag.role}</div>
                  </div>
                </div>

                <span
                  className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1 ${
                    isBusy
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                      : isDone
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-white/5 text-white/40 border border-white/10'
                  }`}
                >
                  {isBusy && <Clock size={10} />}
                  {isDone && <CheckCircle2 size={10} />}
                  {isBusy ? 'WORKING' : isDone ? 'DONE' : 'IDLE'}
                </span>
              </div>

              {ag.currentTask ? (
                <div
                  className="mt-2.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono truncate"
                  style={{ background: `${ag.color}15`, color: ag.color, border: `1px solid ${ag.color}25` }}
                >
                  {ag.currentTask}
                </div>
              ) : (
                <div className="mt-2.5 text-[10px] text-white/30 font-mono truncate">
                  Ready to assist in {ag.room} room
                </div>
              )}
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
  const [activeTab, setActiveTab] = useState('orb'); // 'orb' | 'office' | 'split'

  return (
    <div
      className="h-screen w-screen flex flex-col overflow-hidden text-slate-100 select-none"
      style={{
        background: 'radial-gradient(ellipse 90% 70% at 50% -10%, rgba(30,58,138,0.15), transparent), #050811',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* ── Top App Bar ─────────────────────────────────────────────────── */}
      <header className="shrink-0 h-14 border-b border-white/8 bg-[#070b16]/90 backdrop-blur-md px-5 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/8 transition-all flex items-center gap-1.5 text-xs font-mono"
            title="Return to Main Portal"
          >
            <ArrowLeft size={15} />
            <span className="hidden sm:inline">Home</span>
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
                  OpenAI ChatGPT
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center View Selector (Desktop Switcher) */}
        <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/8 shadow-inner">
          <button
            onClick={() => setActiveTab('orb')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'orb'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles size={13} />
            <span>Voice & Agents</span>
          </button>

          <button
            onClick={() => setActiveTab('office')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'office'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Gamepad2 size={13} />
            <span>2D Office Game</span>
          </button>

          <button
            onClick={() => setActiveTab('split')}
            className={`hidden xl:flex px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold items-center gap-1.5 transition-all ${
              activeTab === 'split'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers size={13} />
            <span>Studio View</span>
          </button>
        </div>

        {/* Right Info Pill */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-white/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>6 PARALLEL AGENTS</span>
          </div>

          <Link
            to="/housework-ai/setup"
            className="text-[11px] px-3 py-1.5 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all border border-white/10 font-mono font-medium"
          >
            ⚙️ Setup
          </Link>
        </div>
      </header>

      {/* ── Main Responsive Desktop Layout ─────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT / CENTER: Interactive Workspace Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {/* Tab 1: Perplexity Voice & Multi-Agent Studio */}
          {activeTab === 'orb' && (
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Neural Orb Hero Card */}
              <div
                className="relative rounded-3xl border border-white/10 p-6 md:p-8 overflow-hidden shadow-2xl"
                style={{
                  background: 'radial-gradient(ellipse 70% 80% at 50% 50%, rgba(59,130,246,0.1), rgba(8,12,24,0.95))',
                }}
              >
                {/* Decorative Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold">
                    <Sparkles size={13} />
                    <span>Neural Voice Coordinator</span>
                  </div>
                  <div className="text-[10px] font-mono text-white/30 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                    PERPLEXITY AUDIO ENGINE
                  </div>
                </div>

                {/* Orb Component */}
                <AgentOrb />

                {/* Subtitle description */}
                <p className="text-center text-xs text-white/35 font-mono mt-4">
                  Speak naturally to the AI coordinator · Real-time multi-agent parallel dispatch
                </p>
              </div>

              {/* Multi-Agent Roster Grid */}
              <AgentRosterGrid />
            </div>
          )}

          {/* Tab 2: 2D Pixel Office Game Simulation */}
          {activeTab === 'office' && (
            <div className="max-w-5xl mx-auto space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Gamepad2 size={16} className="text-amber-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-200">
                    Live Office Simulation Game
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-white/40">
                  Workers interact, walk between desks, and execute assignments
                </span>
              </div>

              <OfficeSimulation />
            </div>
          )}

          {/* Tab 3: Studio Split View (Wide screens) */}
          {activeTab === 'split' && (
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Orb */}
                <div
                  className="rounded-3xl border border-white/10 p-6 shadow-2xl flex flex-col justify-between"
                  style={{
                    background: 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(59,130,246,0.08), rgba(8,12,24,0.95))',
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold">
                      Neural Coordinator
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400">ONLINE</span>
                  </div>
                  <AgentOrb />
                </div>

                {/* Right: Office */}
                <div>
                  <OfficeSimulation />
                </div>
              </div>

              <AgentRosterGrid />
            </div>
          )}
        </main>

        {/* RIGHT: Spacious Desktop Chat & Voice Command Center */}
        <aside
          className="shrink-0 flex flex-col h-full z-20 transition-all"
          style={{
            width: 'min(480px, 38vw)',
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
