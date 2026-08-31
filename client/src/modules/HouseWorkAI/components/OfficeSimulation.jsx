import React, { useState, useEffect } from 'react';
import { useHouseWork } from '../context/HouseWorkContext';
import { Sparkles, MessageSquare, Coffee, Cpu, Users, Activity, X, Send, Play } from 'lucide-react';

// Room Zones with coordinate boundaries & pixel aesthetics
const ROOM_ZONES = [
  { id: 'reception', label: 'Reception & Entrance', icon: '🏛️', color: '#8B5CF6', x: '5%', y: '10%', width: '28%', height: '38%', agentIds: ['aria'] },
  { id: 'dev', label: 'Engineering Hub', icon: '💻', color: '#3B82F6', x: '36%', y: '10%', width: '38%', height: '38%', agentIds: ['dev', 'nova'] },
  { id: 'design', label: 'Design Studio', icon: '🎨', color: '#EC4899', x: '77%', y: '10%', width: '18%', height: '38%', agentIds: ['pixel'] },
  { id: 'analytics', label: 'Analytics Lab', icon: '📊', color: '#10B981', x: '5%', y: '52%', width: '28%', height: '42%', agentIds: ['sage'] },
  { id: 'meeting', label: 'Conference Table', icon: '🧠', color: '#F59E0B', x: '36%', y: '52%', width: '38%', height: '42%', agentIds: [] },
  { id: 'server', label: 'Server & DevOps', icon: '⚙️', color: '#6366F1', x: '77%', y: '52%', width: '18%', height: '42%', agentIds: ['byte'] },
];

// Ambient employee dialog generator for live persona banter
const AMBIENT_BANTER = {
  aria: ["Checking sprint milestones...", "Team, let's align on Q3 goals!", "Timeline looks solid."],
  dev: ["Refactoring backend API routes...", "Writing clean unit test suite.", "Caching database query results!"],
  pixel: ["Polishing dark glassmorphism tokens!", "Designing responsive components.", "Figma mockup updated!"],
  sage: ["Analyzing user retention graphs...", "Querying dataset metrics.", "Generating statistical report."],
  nova: ["Executing 142 edge-case tests!", "Security audit clean.", "All integration tests green!"],
  byte: ["Scaling Kubernetes pod cluster...", "CI/CD deployment pipeline green.", "Monitoring 99.99% uptime."],
};

export default function OfficeSimulation() {
  const { agents, sendMessage } = useHouseWork();
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [directMsg, setDirectMsg] = useState('');
  const [directLogs, setDirectLogs] = useState({});
  const [activeSpeech, setActiveSpeech] = useState({ agentId: 'aria', text: 'Welcome to the live multi-agent office!' });
  const [roomMode, setRoomMode] = useState('working'); // working | coffee | meeting

  // Periodically cycle ambient speech bubbles for living Minecraft/Stonic office vibe
  useEffect(() => {
    const timer = setInterval(() => {
      const agentKeys = Object.keys(AMBIENT_BANTER);
      const randomAgent = agentKeys[Math.floor(Math.random() * agentKeys.length)];
      const banters = AMBIENT_BANTER[randomAgent];
      const randomText = banters[Math.floor(Math.random() * banters.length)];
      setActiveSpeech({ agentId: randomAgent, text: randomText });
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const agentMap = Object.fromEntries(agents.map(a => [a.id, a]));
  const workingCount = agents.filter(a => a.status === 'working').length;

  const handleSendDirectMessage = (e) => {
    e.preventDefault();
    if (!directMsg.trim() || !selectedAgent) return;

    const userText = directMsg.trim();
    const agentId = selectedAgent.id;

    // Add to direct logs for this agent
    const newLogs = [
      ...(directLogs[agentId] || []),
      { sender: 'user', text: userText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ];

    setDirectLogs({ ...directLogs, [agentId]: newLogs });
    setDirectMsg('');

    // Simulate agent direct response (works offline without GEMINI_API_KEY)
    setTimeout(() => {
      const responses = AMBIENT_BANTER[agentId] || ["On it! Working on your direct request."];
      const botText = `${responses[Math.floor(Math.random() * responses.length)]} I'm focusing on your task right away.`;

      setDirectLogs(prev => ({
        ...prev,
        [agentId]: [
          ...(prev[agentId] || []),
          { sender: 'agent', text: botText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]
      }));

      // Also trigger state working animation
      if (sendMessage) {
        sendMessage(`[Direct Task to ${selectedAgent.name}]: ${userText}`);
      }
    }, 800);
  };

  return (
    <div className="relative bg-[#060a14] rounded-3xl border border-blue-500/20 overflow-hidden shadow-2xl flex flex-col">
      {/* ── Top Header Control Bar ────────────────────────────────────────── */}
      <div className="px-5 py-3 border-b border-white/10 bg-[#090f1f]/90 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-xs shadow-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80 shadow-xs shadow-amber-500/50" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-xs shadow-emerald-500/50" />
          </div>
          <span className="text-xs font-mono font-bold text-blue-400 tracking-wider flex items-center gap-1.5">
            <Cpu size={14} className="animate-spin-slow" /> STONIC MULTI-AGENT OFFICE SIMULATION
          </span>
        </div>

        {/* Live Simulation Mode Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRoomMode('working')}
            className={`px-3 py-1 rounded-xl text-[11px] font-mono font-bold transition-all flex items-center gap-1.5 ${
              roomMode === 'working' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'bg-white/5 text-white/50 hover:bg-white/10'
            }`}
          >
            <Activity size={12} /> Work Mode
          </button>
          <button
            onClick={() => setRoomMode('coffee')}
            className={`px-3 py-1 rounded-xl text-[11px] font-mono font-bold transition-all flex items-center gap-1.5 ${
              roomMode === 'coffee' ? 'bg-amber-600 text-white shadow-md shadow-amber-500/30' : 'bg-white/5 text-white/50 hover:bg-white/10'
            }`}
          >
            <Coffee size={12} /> Coffee Lounge
          </button>
          <button
            onClick={() => setRoomMode('meeting')}
            className={`px-3 py-1 rounded-xl text-[11px] font-mono font-bold transition-all flex items-center gap-1.5 ${
              roomMode === 'meeting' ? 'bg-violet-600 text-white shadow-md shadow-violet-500/30' : 'bg-white/5 text-white/50 hover:bg-white/10'
            }`}
          >
            <Users size={12} /> All-Hands Meeting
          </button>
        </div>
      </div>

      {/* ── Main Isometric Minecraft/Habbo Room Canvas ─────────────────────── */}
      <div className="relative w-full h-[520px] bg-[#050811] overflow-hidden select-none">
        {/* Isometric Pixel Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: `
              linear-gradient(30deg, #3b82f6 1px, transparent 1px),
              linear-gradient(150deg, #3b82f6 1px, transparent 1px)
            `,
            backgroundSize: '40px 24px',
          }}
        />

        {/* Room Floor Zones */}
        {ROOM_ZONES.map((zone) => (
          <div
            key={zone.id}
            className="absolute rounded-2xl border transition-all duration-700 p-3 flex flex-col justify-between"
            style={{
              left: zone.x,
              top: zone.y,
              width: zone.width,
              height: zone.height,
              backgroundColor: `${zone.color}08`,
              borderColor: `${zone.color}25`,
              boxShadow: `inset 0 0 20px ${zone.color}08, 0 8px 32px rgba(0,0,0,0.4)`,
            }}
          >
            {/* Zone Label */}
            <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{zone.icon}</span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/80" style={{ color: zone.color }}>
                  {zone.label}
                </span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: zone.color }} />
            </div>

            {/* Pixel Furniture Details inside room */}
            {zone.id === 'reception' && (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-24 h-10 rounded-lg bg-violet-950/60 border border-violet-500/30 flex items-center justify-center text-[10px] text-violet-300 font-mono">
                  🏛️ Reception Desk
                </div>
              </div>
            )}
            {zone.id === 'dev' && (
              <div className="flex-1 grid grid-cols-2 gap-2 items-center justify-items-center">
                <div className="w-20 h-10 rounded-lg bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-[9px] text-blue-300 font-mono">
                  🖥️ Workstation 1
                </div>
                <div className="w-20 h-10 rounded-lg bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-[9px] text-blue-300 font-mono">
                  🖥️ Workstation 2
                </div>
              </div>
            )}
            {zone.id === 'design' && (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-16 h-12 rounded-lg bg-pink-950/60 border border-pink-500/30 flex items-center justify-center text-[9px] text-pink-300 font-mono text-center">
                  🎨 Canvas Table
                </div>
              </div>
            )}
            {zone.id === 'analytics' && (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-20 h-10 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-[9px] text-emerald-300 font-mono">
                  📊 Metrics Desk
                </div>
              </div>
            )}
            {zone.id === 'meeting' && (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-32 h-14 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-center text-[10px] text-amber-300 font-mono">
                  🧠 Conference Table
                </div>
              </div>
            )}
            {zone.id === 'server' && (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-16 h-12 rounded-lg bg-indigo-950/60 border border-indigo-500/30 flex flex-col items-center justify-center text-[9px] text-indigo-300 font-mono">
                  ⚙️ Rack 101
                  <div className="flex gap-1 mt-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
                    <span className="w-1 h-1 rounded-full bg-blue-400 animate-ping" />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Coffee Lounge Station */}
        <div className="absolute left-[5%] top-[86%] w-[28%] h-[12%] rounded-xl border border-amber-500/20 bg-amber-950/20 flex items-center justify-between px-3">
          <span className="text-[10px] font-mono text-amber-300 flex items-center gap-1.5">
            <Coffee size={12} /> Espresso Machine & Watercooler
          </span>
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        </div>

        {/* ── Live Pixel Personas (Minecraft/Habbo Personas) ───────────────── */}
        {agents.map((agent, index) => {
          const isWorking = agent.status === 'working';
          const isSelected = selectedAgent?.id === agent.id;
          const isSpeechActive = activeSpeech.agentId === agent.id;

          // Compute character positioning depending on roomMode
          let posStyle = {};
          if (roomMode === 'coffee') {
            // All walk over to Coffee Lounge
            posStyle = { left: `${10 + index * 4}%`, top: '80%' };
          } else if (roomMode === 'meeting') {
            // Gather around central conference table
            const meetingCoords = [
              { left: '40%', top: '55%' },
              { left: '48%', top: '55%' },
              { left: '56%', top: '55%' },
              { left: '40%', top: '75%' },
              { left: '48%', top: '75%' },
              { left: '56%', top: '75%' },
            ];
            posStyle = meetingCoords[index % meetingCoords.length];
          } else {
            // Default Work Mode coordinates per agent
            const defaultCoords = {
              aria: { left: '14%', top: '22%' },
              dev: { left: '42%', top: '22%' },
              nova: { left: '58%', top: '22%' },
              pixel: { left: '82%', top: '22%' },
              sage: { left: '14%', top: '65%' },
              byte: { left: '82%', top: '65%' },
            };
            posStyle = defaultCoords[agent.id] || { left: `${20 + index * 12}%`, top: '40%' };
          }

          return (
            <div
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className="absolute transition-all duration-1000 ease-in-out cursor-pointer group z-30"
              style={{ ...posStyle, transform: 'translate(-50%, -50%)' }}
            >
              {/* Floating Live Speech Bubble */}
              {(isSpeechActive || isWorking || agent.currentTask) && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 rounded-xl bg-zinc-900/90 border border-white/20 text-[10px] font-mono text-white shadow-xl animate-bounce z-40 flex items-center gap-1">
                  <span>{agent.emoji}</span>
                  <span>{agent.currentTask ? agent.currentTask : isSpeechActive ? activeSpeech.text : 'Working...'}</span>
                </div>
              )}

              {/* Minecraft Pixel Body Container */}
              <div className="relative flex flex-col items-center">
                {/* Status Dot Ring */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isSelected ? 'ring-2 ring-white scale-110' : ''
                  }`}
                  style={{
                    backgroundColor: `${agent.color}25`,
                    border: `2px solid ${agent.color}`,
                    boxShadow: isWorking ? `0 0 25px ${agent.color}` : `0 0 10px ${agent.color}40`,
                  }}
                >
                  {/* Persona Sprite Avatar */}
                  <span className="text-2xl animate-bounce" style={{ animationDuration: isWorking ? '0.6s' : '2s' }}>
                    {agent.emoji}
                  </span>
                </div>

                {/* Overhead Name & Role Tag */}
                <div className="mt-1 px-2 py-0.5 rounded-full bg-zinc-950/80 border border-white/10 flex items-center gap-1 shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isWorking ? '#fbbf24' : '#10b981' }} />
                  <span className="text-[10px] font-mono font-bold text-white">{agent.name}</span>
                  <span className="text-[8px] font-mono text-white/50">({agent.role})</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer Live Room Activity Ticker ─────────────────────────────── */}
      <div className="px-5 py-2.5 border-t border-white/10 bg-[#090f1f]/80 backdrop-blur-md flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest">Team Status:</span>
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {workingCount > 0 ? `${workingCount} Agents Collaborating` : '6 Agents Idle & Ready'}
          </span>
        </div>
        <span className="text-[10px] font-mono text-blue-400/70">
          💡 Click any employee persona to chat directly
        </span>
      </div>

      {/* ── Persona Direct Chat Drawer Modal ("Talk to Employee") ─────────── */}
      {selectedAgent && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end animate-mac-fade-in">
          <div className="w-full max-w-sm bg-[#0a101d] border-l border-white/10 p-5 flex flex-col justify-between shadow-2xl h-full">
            {/* Drawer Header */}
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-lg" style={{ backgroundColor: `${selectedAgent.color}30`, border: `1px solid ${selectedAgent.color}` }}>
                    {selectedAgent.emoji}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      {selectedAgent.name}
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">{selectedAgent.role}</span>
                    </h3>
                    <p className="text-[10px] text-white/40 font-mono">Status: {selectedAgent.status.toUpperCase()}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedAgent(null)} className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10">
                  <X size={16} />
                </button>
              </div>

              {/* Chat Message Logs with Persona */}
              <div className="h-[320px] overflow-y-auto space-y-2.5 pr-1 text-xs">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/80 leading-relaxed font-mono">
                  👋 Hi! I'm {selectedAgent.name}, your {selectedAgent.role}. Tell me what you'd like me to work on or ask me any question!
                </div>

                {(directLogs[selectedAgent.id] || []).map((log, i) => (
                  <div key={i} className={`flex flex-col ${log.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-3 rounded-2xl max-w-[85%] font-mono leading-relaxed ${
                      log.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-zinc-900 text-zinc-200 border border-white/10'
                    }`}>
                      {log.text}
                    </div>
                    <span className="text-[9px] text-white/30 font-mono mt-0.5 px-1">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Input Form */}
            <form onSubmit={handleSendDirectMessage} className="flex gap-2 pt-3 border-t border-white/10">
              <input
                type="text"
                value={directMsg}
                onChange={e => setDirectMsg(e.target.value)}
                placeholder={`Talk to ${selectedAgent.name}...`}
                className="flex-1 bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-500 font-mono"
              />
              <button
                type="submit"
                disabled={!directMsg.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl font-mono text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1"
              >
                <Send size={12} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
