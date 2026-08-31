import React, { useState, useEffect, useRef } from 'react';
import { useHouseWork } from '../context/HouseWorkContext';
import { Play, Pause, FastForward, UserCheck, Armchair, Coffee, Send, Sparkles, MessageSquare, ChevronRight, X } from 'lucide-react';

// Male & Female Pixel Avatars Definition with distinct hair, outfit colors, and initial seat positions
const EMPLOYEES = [
  { id: 'aria', name: 'Alice', gender: 'female', role: 'Project Manager', hair: '#f97316', outfit: '#8b5cf6', skin: '#fed7aa', deskId: 'desk-0', seatX: 220, seatY: 180, homeX: 220, homeY: 180, emoji: '👩‍💼', statusColor: '#eab308' },
  { id: 'dev', name: 'Bob', gender: 'male', role: 'Lead Dev', hair: '#f59e0b', outfit: '#3b82f6', skin: '#fde68a', deskId: 'desk-1', seatX: 380, seatY: 180, homeX: 380, homeY: 180, emoji: '👨‍💻', statusColor: '#06b6d4' },
  { id: 'nova', name: 'Nova', gender: 'female', role: 'QA Engineer', hair: '#ef4444', outfit: '#ec4899', skin: '#fecdd3', deskId: 'desk-2', seatX: 540, seatY: 180, homeX: 540, homeY: 180, emoji: '🔍', statusColor: '#ef4444' },
  { id: 'pixel', name: 'Pixel', gender: 'female', role: 'UI Designer', hair: '#a855f7', outfit: '#d946ef', skin: '#fed7aa', deskId: 'desk-3', seatX: 220, seatY: 340, homeX: 220, homeY: 340, emoji: '🎨', statusColor: '#a855f7' },
  { id: 'sage', name: 'Sage', gender: 'male', role: 'Data Analyst', hair: '#10b981', outfit: '#059669', skin: '#fde68a', deskId: 'desk-4', seatX: 380, seatY: 340, homeX: 380, homeY: 340, emoji: '📊', statusColor: '#10b981' },
  { id: 'byte', name: 'Brass', gender: 'male', role: 'DevOps', hair: '#3b82f6', outfit: '#1d4ed8', skin: '#fef08a', deskId: 'desk-5', seatX: 660, seatY: 420, homeX: 660, homeY: 420, emoji: '⚙️', statusColor: '#f59e0b' },
];

// Target waypoints in office for continuous walking simulation
const WAYPOINTS = [
  { label: 'Water Cooler', x: 480, y: 430 },
  { label: 'Whiteboard', x: 380, y: 80 },
  { label: 'Bob\'s Desk', x: 380, y: 230 },
  { label: 'Lounge Couch', x: 120, y: 420 },
  { label: 'Carol\'s Desk', x: 540, y: 230 },
  { label: 'Alice\'s Office', x: 220, y: 230 },
];

// Work research prompts floating overhead
const WORK_PROMPTS = [
  "Provide a detailed research report on the latest advancements in AI perception...",
  "Refactoring distributed state store and optimizing cache TTL...",
  "Designing 2D isometric pixel components with custom color palettes...",
  "Analyzing user retention metrics and generating diagnostic charts...",
  "Running 140 regression tests for API authentication pipeline...",
];

export default function OfficeSimulation() {
  const { agents, sendMessage } = useHouseWork();
  const [employees, setEmployees] = useState(EMPLOYEES.map(emp => ({
    ...emp,
    currentX: emp.homeX,
    currentY: emp.homeY,
    targetX: emp.homeX,
    targetY: emp.homeY,
    isSeated: true,
    isWalking: false,
    isTyping: true,
    speechText: null,
    overheadIcon: null, // '❓' | '💡' | '⚙️' | '☕'
  })));

  const [simSpeed, setSimSpeed] = useState(1); // 1x or 2x
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [customTaskInput, setCustomTaskInput] = useState('');
  const [taskSpeechBubble, setTaskSpeechBubble] = useState({
    empId: 'carol',
    text: "Provide a detailed research report on the latest advancements in current public perception of AI...",
  });

  // Continuous Game Movement Engine (Workers walking between desks)
  useEffect(() => {
    const intervalTime = 2000 / simSpeed;
    const moveTimer = setInterval(() => {
      setEmployees(prev => {
        return prev.map(emp => {
          // 35% chance a worker stands up and walks to another desk/waypoint
          if (emp.isSeated && Math.random() < 0.35) {
            const wp = WAYPOINTS[Math.floor(Math.random() * WAYPOINTS.length)];
            const iconOptions = ['❓', '💡', '⚙️', '☕', '📝'];
            const randomIcon = iconOptions[Math.floor(Math.random() * iconOptions.length)];
            return {
              ...emp,
              isSeated: false,
              isWalking: true,
              isTyping: false,
              targetX: wp.x,
              targetY: wp.y,
              overheadIcon: randomIcon,
              speechText: Math.random() < 0.5 ? `Heading to ${wp.label}...` : null,
            };
          }

          // If walking towards target, update coordinates step-by-step
          if (emp.isWalking) {
            const dx = emp.targetX - emp.currentX;
            const dy = emp.targetY - emp.currentY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 15) {
              // Reached target waypoint -> stay briefly then return home
              if (emp.targetX === emp.homeX && emp.targetY === emp.homeY) {
                return {
                  ...emp,
                  currentX: emp.homeX,
                  currentY: emp.homeY,
                  isWalking: false,
                  isSeated: true,
                  isTyping: true,
                  overheadIcon: null,
                  speechText: null,
                };
              } else {
                // At destination, sit/interact briefly then walk back home
                return {
                  ...emp,
                  currentX: emp.targetX,
                  currentY: emp.targetY,
                  targetX: emp.homeX,
                  targetY: emp.homeY,
                  speechText: `Discussing with team at ${WAYPOINTS.find(w => w.x === emp.targetX)?.label || 'desk'}!`,
                };
              }
            } else {
              const speed = 8 * simSpeed;
              return {
                ...emp,
                currentX: emp.currentX + (dx / dist) * speed,
                currentY: emp.currentY + (dy / dist) * speed,
              };
            }
          }

          return emp;
        });
      });
    }, intervalTime);

    return () => clearInterval(moveTimer);
  }, [simSpeed]);

  // Periodic speech bubble updates
  useEffect(() => {
    const speechTimer = setInterval(() => {
      const activePrompts = WORK_PROMPTS;
      const prompt = activePrompts[Math.floor(Math.random() * activePrompts.length)];
      const empIds = ['aria', 'dev', 'carol', 'pixel', 'sage', 'byte'];
      const randomEmp = empIds[Math.floor(Math.random() * empIds.length)];

      setTaskSpeechBubble({
        empId: randomEmp,
        text: prompt,
      });
    }, 6000);

    return () => clearInterval(speechTimer);
  }, []);

  const seatedCount = employees.filter(e => e.isSeated).length;
  const busyCount = employees.filter(e => e.isTyping || e.isWalking).length;

  const handleSendPrompt = (e) => {
    e.preventDefault();
    if (!customTaskInput.trim()) return;

    const text = customTaskInput.trim();
    setTaskSpeechBubble({ empId: 'carol', text });
    setCustomTaskInput('');

    // Trigger workers to move & collaborate
    setEmployees(prev => prev.map((emp, i) => ({
      ...emp,
      isSeated: false,
      isWalking: true,
      targetX: WAYPOINTS[i % WAYPOINTS.length].x,
      targetY: WAYPOINTS[i % WAYPOINTS.length].y,
      speechText: `Working on: ${text.slice(0, 30)}...`,
    })));

    if (sendMessage) sendMessage(text);
  };

  return (
    <div className="relative bg-[#1e232a] rounded-3xl border-4 border-[#2d3440] overflow-hidden shadow-2xl flex flex-col font-sans select-none">
      {/* ── Top Employee Status Bar (Matching Stonicai.com Top Bar) ───────── */}
      <div className="px-4 py-2.5 bg-[#252b35] border-b-2 border-[#15191e] flex items-center justify-between overflow-x-auto gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono flex items-center gap-1">
            <Sparkles size={14} /> StonicAI.com Game Simulation
          </span>
        </div>

        {/* Top Avatar Chips (Alice 🟡, Bob 🔵, Carol 🔴) */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {employees.map(emp => (
            <div
              key={emp.id}
              onClick={() => setSelectedEmp(emp)}
              className={`px-3 py-1 rounded-xl bg-[#1a1f26] border-2 cursor-pointer transition-all flex items-center gap-2 shrink-0 ${
                selectedEmp?.id === emp.id ? 'border-amber-400 bg-amber-500/20' : 'border-[#333c4a] hover:border-blue-400'
              }`}
            >
              {/* Pixel Head Avatar */}
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shadow-xs relative"
                style={{ backgroundColor: emp.outfit, color: '#fff' }}
              >
                {emp.name[0]}
                <span
                  className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-black"
                  style={{ backgroundColor: emp.statusColor }}
                />
              </div>
              <span className="text-xs font-bold text-slate-200 font-mono">{emp.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Top-Down Pixel Art Game Canvas Room ───────────────────────── */}
      <div className="relative w-full h-[580px] bg-[#3a4454] overflow-hidden">
        {/* Tiled Pixel Floor (Grey Tiles matching screenshot) */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `
              linear-gradient(to right, #2c3440 2px, transparent 2px),
              linear-gradient(to bottom, #2c3440 2px, transparent 2px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Top Wall Shelves & Dashboards (matching screenshot) */}
        <div className="absolute top-0 left-0 right-0 h-[64px] bg-[#272e38] border-b-4 border-[#181d24] flex items-center justify-around px-8">
          <div className="w-24 h-10 bg-[#1a2027] border-2 border-[#3f4b5c] rounded flex items-center justify-center text-[10px] text-slate-300 font-mono">
            🖥️ Server Monitor
          </div>
          <div className="w-32 h-10 bg-[#1a2027] border-2 border-[#3f4b5c] rounded flex flex-col items-center justify-center text-[9px] text-blue-300 font-mono">
            📊 Sales Metrics Graph
            <div className="w-20 h-1 bg-blue-500 rounded mt-1" />
          </div>
          <div className="w-24 h-10 bg-[#1a2027] border-2 border-[#3f4b5c] rounded flex items-center justify-center text-[10px] text-emerald-300 font-mono">
            🌱 Plant Shelf
          </div>
          <div className="w-28 h-10 bg-[#1a2027] border-2 border-[#3f4b5c] rounded flex items-center justify-center text-[9px] text-amber-300 font-mono">
            📋 Project Roadmap
          </div>
        </div>

        {/* Wall Whiteboard (Top Middle) */}
        <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-48 h-10 bg-[#f8fafc] border-2 border-[#94a3b8] rounded shadow-md flex items-center justify-center text-[9px] text-slate-800 font-mono font-bold">
          📌 STONIC AI OFFICE PLAN
        </div>

        {/* ── CUBICLE DESK ROWS (Matching Screenshot Layout) ───────────────── */}
        {/* Row 1 Cubicles (3 Desks Facing Forward) */}
        <div className="absolute top-[140px] left-[140px] right-[140px] h-[100px] bg-[#2d3542] border-2 border-[#1e242d] rounded-lg grid grid-cols-3 gap-4 px-6 items-center">
          {[0, 1, 2].map(idx => (
            <div key={idx} className="h-[76px] bg-[#434e60] border-2 border-[#1e242d] rounded p-2 flex flex-col justify-between relative shadow-md">
              <div className="flex justify-between items-center">
                <div className="w-7 h-5 bg-[#0f172a] border border-[#38bdf8] rounded flex items-center justify-center text-[8px] text-cyan-300">
                  💻
                </div>
                <div className="w-4 h-3 bg-[#64748b] rounded" />
              </div>
              <div className="text-[8px] font-mono text-slate-300">Desk #{idx + 1}</div>
              {/* Blue Office Chair */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-4 bg-[#2563eb] border border-[#1d4ed8] rounded-t-lg" />
            </div>
          ))}
        </div>

        {/* Row 2 Cubicles (3 Desks Facing Row 1) */}
        <div className="absolute top-[300px] left-[140px] right-[140px] h-[100px] bg-[#2d3542] border-2 border-[#1e242d] rounded-lg grid grid-cols-3 gap-4 px-6 items-center">
          {[3, 4, 5].map(idx => (
            <div key={idx} className="h-[76px] bg-[#434e60] border-2 border-[#1e242d] rounded p-2 flex flex-col justify-between relative shadow-md">
              <div className="flex justify-between items-center">
                <div className="w-7 h-5 bg-[#0f172a] border border-[#38bdf8] rounded flex items-center justify-center text-[8px] text-cyan-300">
                  💻
                </div>
                <div className="w-4 h-3 bg-[#64748b] rounded" />
              </div>
              <div className="text-[8px] font-mono text-slate-300">Desk #{idx + 1}</div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-4 bg-[#2563eb] border border-[#1d4ed8] rounded-t-lg" />
            </div>
          ))}
        </div>

        {/* Office Furniture Extras: Yellow Door, Lounge Couch, Water Cooler, Plants */}
        <div className="absolute top-[280px] left-[450px] w-10 h-16 bg-[#eab308] border-2 border-[#854d0e] rounded-sm flex items-center justify-center font-bold text-amber-950 text-xs shadow-md">
          🚪
        </div>
        <div className="absolute top-[420px] left-[40px] w-32 h-14 bg-[#1e293b] border-2 border-[#475569] rounded-xl flex items-center justify-center text-xs text-slate-300 font-mono shadow-lg">
          🛋️ Lounge Couch
        </div>
        <div className="absolute top-[410px] left-[460px] w-12 h-16 bg-[#0284c7] border-2 border-[#0369a1] rounded flex flex-col items-center justify-center text-xs text-white shadow-md">
          🚰
          <span className="text-[8px]">Water</span>
        </div>
        <div className="absolute top-[440px] left-[20px] text-lg">🪴</div>
        <div className="absolute top-[440px] left-[720px] text-lg">🪴</div>

        {/* Boss Private Desk (Bottom Right Room) */}
        <div className="absolute top-[400px] left-[600px] w-36 h-20 bg-[#334155] border-2 border-[#1e293b] rounded-xl p-2 flex flex-col justify-between shadow-xl">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-bold text-amber-400 font-mono">Brass Executive</span>
            <div className="w-6 h-4 bg-[#0284c7] rounded border border-white/20" />
          </div>
          <div className="w-8 h-4 bg-[#b91c1c] border border-red-900 rounded-t-lg self-center" />
        </div>

        {/* ── OVERHEAD PIXEL SPEECH BUBBLE (Matching Stonicai.com Image Popup) ── */}
        {taskSpeechBubble && (
          <div
            className="absolute z-50 transition-all duration-700 pointer-events-none"
            style={{
              left: employees.find(e => e.id === taskSpeechBubble.empId)?.currentX || 380,
              top: (employees.find(e => e.id === taskSpeechBubble.empId)?.currentY || 200) - 75,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="bg-[#f8fafc] text-slate-900 px-4 py-2.5 rounded-2xl border-4 border-[#0f172a] shadow-2xl max-w-xs text-xs font-mono font-medium leading-tight relative">
              {taskSpeechBubble.text}
              {/* Speech bubble arrow pointer */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-[12px] border-t-[#0f172a]" />
            </div>
          </div>
        )}

        {/* ── WORKERS ANIMATED IN GAME ROOM ─────────────────────────────────── */}
        {employees.map(emp => {
          const isSelected = selectedEmp?.id === emp.id;

          return (
            <div
              key={emp.id}
              onClick={() => setSelectedEmp(emp)}
              className="absolute z-40 transition-all duration-700 ease-linear cursor-pointer group"
              style={{
                left: `${emp.currentX}px`,
                top: `${emp.currentY}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Overhead Icon Popup (❓ 💡 ⚙️ ☕) */}
              {emp.overheadIcon && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-sm bg-white/90 rounded-full px-1 py-0.5 shadow border border-black animate-bounce">
                  {emp.overheadIcon}
                </div>
              )}

              {/* Pixel Character Persona (Male & Female with distinct hair & outfit) */}
              <div className="flex flex-col items-center">
                {/* Character Head & Hair */}
                <div
                  className="w-7 h-7 rounded-lg border-2 border-black relative flex items-center justify-center shadow-md transition-transform group-hover:scale-110"
                  style={{ backgroundColor: emp.skin }}
                >
                  {/* Hair Style */}
                  <div
                    className="absolute -top-1 left-0 right-0 h-3 rounded-t-md border-t border-black"
                    style={{ backgroundColor: emp.hair }}
                  />
                  {/* Eyes */}
                  <div className="flex gap-1.5 mt-1 z-10">
                    <div className="w-1 h-1.5 bg-black rounded-full" />
                    <div className="w-1 h-1.5 bg-black rounded-full" />
                  </div>
                </div>

                {/* Character Torso Outfit */}
                <div
                  className="w-6 h-4 rounded-b-md border-x-2 border-b-2 border-black mt-[-2px] flex items-center justify-center text-[8px] font-bold text-white shadow-xs"
                  style={{ backgroundColor: emp.outfit }}
                >
                  💻
                </div>

                {/* Overhead Name Label below feet */}
                <div className="mt-1 px-1.5 py-0.5 rounded bg-black/80 text-[8px] font-mono font-bold text-white shadow">
                  {emp.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Bottom Control & Seat Status Bar (Matching Stonicai.com Bottom Bar) ── */}
      <div className="px-4 py-3 bg-[#252b35] border-t-2 border-[#15191e] flex flex-wrap items-center justify-between gap-3 z-20">
        {/* Seat Counters */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-xl bg-[#1a1f26] border border-[#333c4a] text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
            <Armchair size={13} className="text-blue-400" /> {seatedCount}/6 seat
          </div>
          <div className="px-3 py-1 rounded-xl bg-[#1a1f26] border border-[#333c4a] text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
            <UserCheck size={13} /> {busyCount}/6 busy
          </div>
          {/* Speed Toggle */}
          <button
            onClick={() => setSimSpeed(prev => prev === 1 ? 2 : 1)}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1 border ${
              simSpeed === 2 ? 'bg-amber-500 text-black border-amber-400' : 'bg-[#1a1f26] text-slate-300 border-[#333c4a]'
            }`}
          >
            <FastForward size={13} /> {simSpeed}x Speed
          </button>
        </div>

        {/* Bottom Research Prompt Form */}
        <form onSubmit={handleSendPrompt} className="flex-1 max-w-md flex gap-2">
          <input
            type="text"
            value={customTaskInput}
            onChange={e => setCustomTaskInput(e.target.value)}
            placeholder="Assign research task to pixel team..."
            className="flex-1 bg-[#15191e] border border-[#333c4a] rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 font-mono"
          />
          <button
            type="submit"
            disabled={!customTaskInput.trim()}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl font-mono text-xs font-bold shadow-md flex items-center gap-1"
          >
            <Send size={12} /> Assign
          </button>
        </form>
      </div>

      {/* ── Employee Detail Persona Modal Drawer ───────────────────────────── */}
      {selectedEmp && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-xs z-50 flex justify-end animate-mac-fade-in">
          <div className="w-80 bg-[#1e242d] border-l-4 border-[#0f172a] p-4 flex flex-col justify-between shadow-2xl h-full font-mono text-white">
            <div>
              <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-9 h-9 rounded-lg border-2 border-black flex items-center justify-center font-bold text-lg"
                    style={{ backgroundColor: selectedEmp.skin }}
                  >
                    {selectedEmp.emoji}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">{selectedEmp.name}</h3>
                    <p className="text-[10px] text-amber-400">{selectedEmp.role}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedEmp(null)} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="p-2 rounded bg-[#15191e] border border-slate-700">
                  <span className="text-[10px] text-slate-400">Gender:</span> {selectedEmp.gender}
                </div>
                <div className="p-2 rounded bg-[#15191e] border border-slate-700">
                  <span className="text-[10px] text-slate-400">Status:</span> {selectedEmp.isWalking ? 'Walking to target...' : 'Seated & Typing on Laptop'}
                </div>
                <div className="p-2 rounded bg-[#15191e] border border-slate-700">
                  <span className="text-[10px] text-slate-400">Current Task:</span>
                  <p className="text-[11px] text-cyan-300 mt-1 leading-snug">
                    {taskSpeechBubble.text}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedEmp(null)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold font-mono"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
