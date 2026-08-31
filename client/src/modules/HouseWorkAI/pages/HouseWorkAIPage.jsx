import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Cpu } from 'lucide-react';
import { HouseWorkProvider } from '../context/HouseWorkContext';
import AgentOrb from '../components/AgentOrb';
import OfficeSimulation from '../components/OfficeSimulation';
import ConversationPanel from '../components/ConversationPanel';

export default function HouseWorkAIPage() {
  return (
    <HouseWorkProvider>
      <div
        className="min-h-screen flex flex-col overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(59,130,246,0.08), transparent), #060912',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        {/* ── Top bar ─────────────────────────────────────────────────── */}
        <header className="shrink-0 border-b border-white/5 bg-[#080d1a]/80 backdrop-blur-md px-6 py-3 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-all"
              title="Back to httptechnex"
            >
              <ArrowLeft size={15} />
            </Link>
            <div className="w-px h-5 bg-white/8" />
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 via-violet-500 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Cpu size={14} className="text-white" />
              </div>
              <div>
                <span className="text-[14px] font-extrabold text-white tracking-tight">
                  HouseWork<span className="text-blue-400">AI</span>
                </span>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono font-bold tracking-wider">
                MULTI-AGENT
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-white/25">
              <span>6 AGENTS READY</span>
              <span className="w-1 h-1 rounded-full bg-emerald-400" />
            </div>
            <Link
              to="/housework-ai/setup"
              className="text-[10px] px-3 py-1.5 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70 transition-all border border-white/8 font-medium"
            >
              ⚙️ Setup Guide
            </Link>
          </div>
        </header>

        {/* ── Main layout ──────────────────────────────────────────────── */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT: Orb + Office (scrollable) */}
          <div className="flex-1 flex flex-col gap-5 p-5 overflow-y-auto min-w-0">
            {/* Orb section */}
            <div
              className="flex flex-col items-center py-8 rounded-2xl border border-white/5 relative overflow-hidden"
              style={{
                background: 'radial-gradient(ellipse 70% 90% at 50% 50%, rgba(59,130,246,0.06), rgba(6,9,18,0.95))',
              }}
            >
              {/* Corner decorations */}
              <div className="absolute top-3 left-4 text-[9px] font-mono text-white/15 uppercase tracking-widest">
                Neural Coordinator
              </div>
              <div className="absolute top-3 right-4 flex items-center gap-1.5 text-[9px] font-mono text-white/15">
                <span className="w-1 h-1 rounded-full bg-blue-500/50 animate-pulse" />
                v1.0 ACTIVE
              </div>

              <AgentOrb />

              {/* Hover hint */}
              <p className="mt-2 text-[9px] text-white/18 font-mono tracking-wider">
                Hover over the orb to interact with particles
              </p>
            </div>

            {/* Office simulation */}
            <OfficeSimulation />

            {/* Footer note */}
            <p className="text-center text-[10px] text-white/18 font-mono pb-2">
              Agents respond to natural language — voice or text input
            </p>
          </div>

          {/* RIGHT: Conversation panel — fixed width */}
          <div
            className="shrink-0 flex flex-col border-l border-white/5"
            style={{ width: 380 }}
          >
            <ConversationPanel />
          </div>
        </div>
      </div>
    </HouseWorkProvider>
  );
}
