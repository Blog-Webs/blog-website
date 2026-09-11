import React, { useState, useEffect, useRef } from 'react';
import { useHouseWork } from '../context/HouseWorkContext';
import {
  Play, Pause, FastForward, UserCheck, Armchair, Coffee, Send, Sparkles,
  MessageSquare, ChevronRight, X, Users, ArrowRight, ShieldCheck, CheckCircle2,
  RefreshCw, Mic
} from 'lucide-react';

// ── Multi-Agent Employee Personas ──────────────────────────────────────────
const EMPLOYEES = [
  { id: 'aria',  name: 'Alice', gender: 'female', role: 'Project Manager', hair: '#f97316', outfit: '#8b5cf6', skin: '#fed7aa', deskId: 'desk-0', seatX: 200, seatY: 170, homeX: 200, homeY: 170, emoji: '👩‍💼', statusColor: '#eab308', title: 'Project Coordinator' },
  { id: 'dev',   name: 'Bob',   gender: 'male',   role: 'Lead Dev',        hair: '#f59e0b', outfit: '#3b82f6', skin: '#fde68a', deskId: 'desk-1', seatX: 380, seatY: 170, homeX: 380, homeY: 170, emoji: '👨‍💻', statusColor: '#06b6d4', title: 'Backend & Algorithms' },
  { id: 'nova',  name: 'Nova',  gender: 'female', role: 'QA Engineer',     hair: '#ef4444', outfit: '#ec4899', skin: '#fecdd3', deskId: 'desk-2', seatX: 560, seatY: 170, homeX: 560, homeY: 170, emoji: '🔍', statusColor: '#ef4444', title: 'Quality & Edge Cases' },
  { id: 'pixel', name: 'Pixel', gender: 'female', role: 'UI Designer',     hair: '#a855f7', outfit: '#d946ef', skin: '#fed7aa', deskId: 'desk-3', seatX: 200, seatY: 330, homeX: 200, homeY: 330, emoji: '🎨', statusColor: '#a855f7', title: 'Visual & Figma Systems' },
  { id: 'sage',  name: 'Sage',  gender: 'male',   role: 'Data Analyst',    hair: '#10b981', outfit: '#059669', skin: '#fde68a', deskId: 'desk-4', seatX: 380, seatY: 330, homeX: 380, homeY: 330, emoji: '📊', statusColor: '#10b981', title: 'Telemetry & Insights' },
  { id: 'byte',  name: 'Brass', gender: 'male',   role: 'DevOps Lead',     hair: '#3b82f6', outfit: '#1d4ed8', skin: '#fef08a', deskId: 'desk-5', seatX: 660, seatY: 410, homeX: 660, homeY: 410, emoji: '⚙️', statusColor: '#f59e0b', title: 'Cloud Infrastructure' },
];

// ── Waypoints across the office for realistic walking ──────────────────────
const WAYPOINTS = {
  whiteboard:   { label: 'Whiteboard', x: 380, y: 75 },
  serverRoom:   { label: 'Server Rack', x: 670, y: 90 },
  waterCooler:  { label: 'Water Cooler', x: 480, y: 410 },
  lounge:       { label: 'Lounge Couch', x: 100, y: 410 },
  aliceDesk:    { label: "Alice's Desk", x: 200, y: 170 },
  bobDesk:      { label: "Bob's Desk", x: 380, y: 170 },
  novaDesk:     { label: "Nova's Desk", x: 560, y: 170 },
  pixelDesk:    { label: "Pixel's Desk", x: 200, y: 330 },
  sageDesk:     { label: "Sage's Desk", x: 380, y: 330 },
  brassDesk:    { label: "Brass's Office", x: 660, y: 410 },
};

// ── Conversational Work Delegation Sequences ────────────────────────────────
// Employees talk to each other, walk to each other's desks, and delegate tasks
const DELEGATION_CONVERSATIONS = [
  {
    fromId: 'aria',
    toId: 'dev',
    targetWaypoint: WAYPOINTS.bobDesk,
    fromSpeech: "Bob, new feature came in! Let's build the backend authentication & cache layer.",
    toSpeech: "On it Alice! Coding the JWT routes and controller logic now.",
    overheadIcon: '💡',
    log: "Alice (PM) delegated Backend API & Auth sprint to Bob (Dev)",
  },
  {
    fromId: 'dev',
    toId: 'nova',
    targetWaypoint: WAYPOINTS.novaDesk,
    fromSpeech: "Nova, the auth controllers are ready. Please test token renewal and edge cases.",
    toSpeech: "Writing regression test suites and verifying security boundaries!",
    overheadIcon: '🔍',
    log: "Bob (Dev) handed off Auth logic to Nova (QA) for stress testing",
  },
  {
    fromId: 'pixel',
    toId: 'sage',
    targetWaypoint: WAYPOINTS.sageDesk,
    fromSpeech: "Sage, check out the new dashboard analytics UI! Do the chart metrics align?",
    toSpeech: "Pulling telemetry numbers and query statistics for your graphs now!",
    overheadIcon: '📊',
    log: "Pixel (UI) consulted Sage (Data) on user retention metrics",
  },
  {
    fromId: 'nova',
    toId: 'byte',
    targetWaypoint: WAYPOINTS.brassDesk,
    fromSpeech: "Brass, all 140 QA test suites passed with 100% green status! Ready for release.",
    toSpeech: "Spinning up Docker containers and executing zero-downtime deployment!",
    overheadIcon: '🚀',
    log: "Nova (QA) authorized deployment to Brass (DevOps)",
  },
  {
    fromId: 'sage',
    toId: 'aria',
    targetWaypoint: WAYPOINTS.aliceDesk,
    fromSpeech: "Alice, our weekly analytics report is finalized. User conversion jumped by 34%!",
    toSpeech: "Fantastic work team! Scheduling our next sprint review roadmap.",
    overheadIcon: '📋',
    log: "Sage (Data) briefed Alice (PM) on sprint success metrics",
  },
  {
    fromId: 'aria',
    toId: 'pixel',
    targetWaypoint: WAYPOINTS.pixelDesk,
    fromSpeech: "Pixel, let's create a sleek dark glassmorphic design system for mobile & desktop.",
    toSpeech: "Crafting modern Figma component libraries and color tokens right now!",
    overheadIcon: '🎨',
    log: "Alice (PM) assigned UI design system sprint to Pixel (Designer)",
  },
];

export default function OfficeSimulation() {
  const { messages, sendMessage } = useHouseWork();

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
    overheadIcon: null,
  })));

  const [simSpeed, setSimSpeed] = useState(1);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [customTaskInput, setCustomTaskInput] = useState('');
  const [activeSpeech, setActiveSpeech] = useState({
    empId: 'aria',
    text: "Team, let's coordinate on our OpenAI multi-agent sprint!",
    targetId: 'dev',
  });
  const [activityLogs, setActivityLogs] = useState([
    "Alice (PM) initiated Multi-Agent Office Team Standup",
    "Bob (Dev) started code implementation",
    "Pixel (UI) established color design tokens",
  ]);

  const conversationIndexRef = useRef(0);

  // ── Continuous Delegation & Conversation Loop ─────────────────────────────
  useEffect(() => {
    const dialogTimer = setInterval(() => {
      const conv = DELEGATION_CONVERSATIONS[conversationIndexRef.current % DELEGATION_CONVERSATIONS.length];
      conversationIndexRef.current++;

      const fromEmp = EMPLOYEES.find(e => e.id === conv.fromId);
      const toEmp = EMPLOYEES.find(e => e.id === conv.toId);
      if (!fromEmp || !toEmp) return;

      // Step 1: 'From' employee stands up and walks to 'To' employee's desk
      setEmployees(prev => prev.map(emp => {
        if (emp.id === conv.fromId) {
          return {
            ...emp,
            isSeated: false,
            isWalking: true,
            isTyping: false,
            targetX: conv.targetWaypoint.x,
            targetY: conv.targetWaypoint.y + 25,
            overheadIcon: conv.overheadIcon,
            speechText: conv.fromSpeech,
          };
        }
        return emp;
      }));

      setActiveSpeech({
        empId: conv.fromId,
        text: conv.fromSpeech,
        targetId: conv.toId,
      });

      setActivityLogs(prev => [conv.log, ...prev.slice(0, 5)]);

      // Step 2: After arrival, 'To' employee responds with agreement/solution
      setTimeout(() => {
        setActiveSpeech({
          empId: conv.toId,
          text: conv.toSpeech,
          targetId: conv.fromId,
        });

        setEmployees(prev => prev.map(emp => {
          if (emp.id === conv.toId) {
            return {
              ...emp,
              overheadIcon: '💬',
              speechText: conv.toSpeech,
            };
          }
          return emp;
        }));

        // Step 3: 'From' employee walks back home to continue working
        setTimeout(() => {
          setEmployees(prev => prev.map(emp => {
            if (emp.id === conv.fromId) {
              return {
                ...emp,
                targetX: emp.homeX,
                targetY: emp.homeY,
                isWalking: true,
                speechText: null,
              };
            }
            if (emp.id === conv.toId) {
              return {
                ...emp,
                speechText: null,
                overheadIcon: null,
              };
            }
            return emp;
          }));
        }, 3500 / simSpeed);

      }, 3000 / simSpeed);

    }, 8500 / simSpeed);

    return () => clearInterval(dialogTimer);
  }, [simSpeed]);

  // ── Physics Walking Step Timer ───────────────────────────────────────────
  useEffect(() => {
    const moveTimer = setInterval(() => {
      setEmployees(prev => prev.map(emp => {
        if (!emp.isWalking) return emp;

        const dx = emp.targetX - emp.currentX;
        const dy = emp.targetY - emp.currentY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 10) {
          // Reached target
          const isAtHome = emp.targetX === emp.homeX && emp.targetY === emp.homeY;
          return {
            ...emp,
            currentX: emp.targetX,
            currentY: emp.targetY,
            isWalking: false,
            isSeated: isAtHome,
            isTyping: isAtHome,
            overheadIcon: isAtHome ? null : emp.overheadIcon,
          };
        } else {
          const stepSpeed = 10 * simSpeed;
          return {
            ...emp,
            currentX: emp.currentX + (dx / dist) * stepSpeed,
            currentY: emp.currentY + (dy / dist) * stepSpeed,
          };
        }
      }));
    }, 50);

    return () => clearInterval(moveTimer);
  }, [simSpeed]);

  // ── React to User Messages from Chat or Input ───────────────────────────
  const handleAssignTask = (taskText) => {
    if (!taskText || !taskText.trim()) return;
    const text = taskText.trim();
    const lower = text.toLowerCase();

    let targetAgentId = 'dev';
    if (lower.includes('design') || lower.includes('ui') || lower.includes('color')) targetAgentId = 'pixel';
    else if (lower.includes('data') || lower.includes('metric') || lower.includes('analytics')) targetAgentId = 'sage';
    else if (lower.includes('test') || lower.includes('qa') || lower.includes('bug')) targetAgentId = 'nova';
    else if (lower.includes('deploy') || lower.includes('server') || lower.includes('cloud')) targetAgentId = 'byte';

    const targetEmp = EMPLOYEES.find(e => e.id === targetAgentId) || EMPLOYEES[1];

    // Alice assigns task directly
    setActiveSpeech({
      empId: 'aria',
      text: `Alice assigned: "${text.length > 45 ? text.slice(0, 42) + '...' : text}" to ${targetEmp.name}!`,
      targetId: targetAgentId,
    });

    setActivityLogs(prev => [`Alice (PM) assigned "${text.slice(0, 35)}..." to ${targetEmp.name} (${targetEmp.role})`, ...prev.slice(0, 5)]);

    // Trigger Alice to walk to target employee
    setEmployees(prev => prev.map(emp => {
      if (emp.id === 'aria') {
        return {
          ...emp,
          isSeated: false,
          isWalking: true,
          targetX: targetEmp.homeX,
          targetY: targetEmp.homeY + 25,
          overheadIcon: '📝',
          speechText: `Task for ${targetEmp.name}: ${text.slice(0, 25)}...`,
        };
      }
      if (emp.id === targetAgentId) {
        return {
          ...emp,
          overheadIcon: '⚡',
          speechText: `Working on: ${text.slice(0, 25)}...`,
        };
      }
      return emp;
    }));

    if (sendMessage) sendMessage(text);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!customTaskInput.trim()) return;
    handleAssignTask(customTaskInput.trim());
    setCustomTaskInput('');
  };

  const seatedCount = employees.filter(e => e.isSeated).length;
  const busyCount = employees.filter(e => e.isWalking || e.isTyping).length;

  return (
    <div className="relative bg-[#1a202c] rounded-3xl border-4 border-[#2d3748] overflow-hidden shadow-2xl flex flex-col font-sans select-none">
      {/* ── Top Status Bar ──────────────────────────────────────────────── */}
      <div className="px-4 py-3 bg-[#242d3d] border-b-2 border-[#171e2b] flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md">
            <Sparkles size={14} />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-300 font-mono tracking-wider uppercase">
              HttpTechNex Multi-Agent Office
            </span>
            <div className="text-[10px] text-slate-300 font-mono">
              Autonomous Team Collaboration & Delegation
            </div>
          </div>
        </div>

        {/* Top Avatar Badges */}
        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          {employees.map(emp => {
            const isSpeaking = activeSpeech?.empId === emp.id;
            return (
              <div
                key={emp.id}
                onClick={() => setSelectedEmp(emp)}
                className={`px-3 py-1.5 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-2 shrink-0 ${
                  isSpeaking
                    ? 'border-amber-400 bg-amber-500/25 ring-2 ring-amber-400/40 animate-pulse'
                    : selectedEmp?.id === emp.id
                    ? 'border-blue-400 bg-blue-500/20'
                    : 'border-[#3a4759] bg-[#1a202c] hover:border-slate-300'
                }`}
              >
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shadow-xs relative"
                  style={{ backgroundColor: emp.outfit, color: '#fff' }}
                >
                  {emp.emoji}
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-white font-mono leading-none">{emp.name}</span>
                  <span className="text-[9px] text-slate-400 font-mono leading-none mt-0.5">{emp.role}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Main Top-Down Pixel Art Office Canvas ────────────────────────── */}
      <div className="relative w-full h-[520px] bg-[#333d4d] overflow-hidden">
        {/* Tiled Pixel Grid Floor */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(to right, #1f2733 2px, transparent 2px),
              linear-gradient(to bottom, #1f2733 2px, transparent 2px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Top Wall: Server Room, Roadmap Whiteboard, Plant, Metrics Graph */}
        <div className="absolute top-0 left-0 right-0 h-[64px] bg-[#212833] border-b-4 border-[#141920] flex items-center justify-around px-6">
          <div className="w-28 h-10 bg-[#161c24] border-2 border-[#3d4b5c] rounded flex items-center justify-center text-[10px] text-cyan-300 font-mono shadow-inner">
            🖥️ Server Rack
          </div>
          <div className="w-48 h-10 bg-[#f8fafc] border-2 border-[#94a3b8] rounded shadow-md flex items-center justify-center text-[10px] text-slate-900 font-mono font-bold">
            📋 SPRINT BOARD · ACTIVE
          </div>
          <div className="w-32 h-10 bg-[#161c24] border-2 border-[#3d4b5c] rounded flex flex-col items-center justify-center text-[9px] text-blue-300 font-mono">
            📊 Retention Graph
            <div className="w-20 h-1 bg-blue-400 rounded mt-1" />
          </div>
          <div className="w-24 h-10 bg-[#161c24] border-2 border-[#3d4b5c] rounded flex items-center justify-center text-[10px] text-emerald-300 font-mono">
            🪴 Plant Station
          </div>
        </div>

        {/* Row 1 Cubicles (Alice, Bob, Nova) */}
        <div className="absolute top-[135px] left-[100px] right-[100px] h-[95px] bg-[#27303d] border-2 border-[#19202a] rounded-xl grid grid-cols-3 gap-6 px-6 items-center shadow-lg">
          {[{ idx: 0, emp: 'Alice (PM)' }, { idx: 1, emp: 'Bob (Dev)' }, { idx: 2, emp: 'Nova (QA)' }].map(item => (
            <div key={item.idx} className="h-[74px] bg-[#3a4658] border-2 border-[#19202a] rounded-lg p-2 flex flex-col justify-between relative shadow-md">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-cyan-300 font-mono">💻 Laptop</span>
                <span className="w-3 h-2 bg-emerald-400 rounded-full animate-pulse" />
              </div>
              <div className="text-[9px] font-mono font-bold text-slate-200">{item.emp}</div>
              {/* Blue Office Chair */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-4 bg-[#2563eb] border border-[#1d4ed8] rounded-t-lg shadow" />
            </div>
          ))}
        </div>

        {/* Row 2 Cubicles (Pixel, Sage, Free Desk) */}
        <div className="absolute top-[295px] left-[100px] right-[100px] h-[95px] bg-[#27303d] border-2 border-[#19202a] rounded-xl grid grid-cols-3 gap-6 px-6 items-center shadow-lg">
          {[{ idx: 3, emp: 'Pixel (UI)' }, { idx: 4, emp: 'Sage (Data)' }, { idx: 5, emp: 'Shared Workstation' }].map(item => (
            <div key={item.idx} className="h-[74px] bg-[#3a4658] border-2 border-[#19202a] rounded-lg p-2 flex flex-col justify-between relative shadow-md">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-pink-300 font-mono">💻 Workstation</span>
                <span className="w-3 h-2 bg-pink-400 rounded-full animate-pulse" />
              </div>
              <div className="text-[9px] font-mono font-bold text-slate-200">{item.emp}</div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-4 bg-[#2563eb] border border-[#1d4ed8] rounded-t-lg shadow" />
            </div>
          ))}
        </div>

        {/* Office Furniture Extras: Yellow Door, Lounge Couch, Water Cooler, Brass Private Corner */}
        <div className="absolute top-[260px] left-[40px] w-28 h-12 bg-[#1e293b] border-2 border-[#475569] rounded-xl flex items-center justify-center text-xs text-slate-200 font-mono shadow-md">
          🛋️ Lounge Couch
        </div>
        <div className="absolute top-[400px] left-[450px] w-14 h-16 bg-[#0284c7] border-2 border-[#0369a1] rounded-lg flex flex-col items-center justify-center text-xs text-white shadow-md">
          🚰
          <span className="text-[8px] font-mono font-bold">Water</span>
        </div>

        {/* Brass DevOps Executive Corner */}
        <div className="absolute top-[380px] left-[590px] w-40 h-22 bg-[#2a3443] border-2 border-[#19202b] rounded-2xl p-2.5 flex flex-col justify-between shadow-xl">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-amber-400 font-mono">Brass DevOps Suite</span>
            <span className="text-xs">⚙️</span>
          </div>
          <div className="text-[9px] font-mono text-cyan-300">CI/CD Pipeline: ONLINE</div>
          <div className="w-8 h-4 bg-[#b91c1c] border border-red-900 rounded-t-lg self-center" />
        </div>

        {/* ── OVERHEAD SPEECH / DELEGATION BUBBLE ─────────────────────────── */}
        {activeSpeech && (
          <div
            className="absolute z-50 transition-all duration-700 pointer-events-none"
            style={{
              left: employees.find(e => e.id === activeSpeech.empId)?.currentX || 380,
              top: (employees.find(e => e.id === activeSpeech.empId)?.currentY || 200) - 80,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="bg-[#f8fafc] text-slate-900 px-4 py-2.5 rounded-2xl border-4 border-[#0f172a] shadow-2xl max-w-xs text-xs font-mono font-bold leading-tight relative">
              <div className="flex items-center gap-1.5 text-[10px] text-blue-700 mb-1">
                <span>💬 {EMPLOYEES.find(e => e.id === activeSpeech.empId)?.name} speaking</span>
                {activeSpeech.targetId && (
                  <span>→ {EMPLOYEES.find(e => e.id === activeSpeech.targetId)?.name}</span>
                )}
              </div>
              {activeSpeech.text}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-[12px] border-t-[#0f172a]" />
            </div>
          </div>
        )}

        {/* ── WORKERS ANIMATED IN GAME ROOM ───────────────────────────────── */}
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
              {/* Overhead Icon Popup */}
              {emp.overheadIcon && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-base bg-white/95 rounded-full px-2 py-0.5 shadow-lg border-2 border-black animate-bounce">
                  {emp.overheadIcon}
                </div>
              )}

              {/* Character Persona Avatar */}
              <div className="flex flex-col items-center">
                {/* Character Head */}
                <div
                  className="w-8 h-8 rounded-lg border-2 border-black relative flex items-center justify-center shadow-lg transition-transform group-hover:scale-115"
                  style={{ backgroundColor: emp.skin }}
                >
                  <div
                    className="absolute -top-1 left-0 right-0 h-3.5 rounded-t-md border-t border-black"
                    style={{ backgroundColor: emp.hair }}
                  />
                  <div className="flex gap-1.5 mt-1.5 z-10">
                    <div className="w-1 h-1.5 bg-black rounded-full" />
                    <div className="w-1 h-1.5 bg-black rounded-full" />
                  </div>
                </div>

                {/* Torso */}
                <div
                  className="w-7 h-4 rounded-b-md border-x-2 border-b-2 border-black mt-[-2px] flex items-center justify-center text-[9px] font-bold text-white shadow-xs"
                  style={{ backgroundColor: emp.outfit }}
                >
                  💻
                </div>

                {/* Name Label */}
                <div className="mt-1 px-1.5 py-0.5 rounded bg-black/85 text-[9px] font-mono font-bold text-white shadow">
                  {emp.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Real-Time Team Conversation Logs & Work Dispatcher ─────────── */}
      <div className="p-3.5 bg-[#202735] border-t-2 border-[#171e2b] flex flex-col md:flex-row items-center justify-between gap-3 z-20">
        {/* Quick Delegation Action Chips */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <span className="text-[10px] font-mono text-amber-400 font-bold uppercase mr-1">Quick Tasks:</span>
          <button
            onClick={() => handleAssignTask("Alice, coordinate a full sprint standup and task assignments")}
            className="px-2.5 py-1 rounded-lg bg-[#141a24] hover:bg-[#1a2230] border border-amber-500/30 text-amber-300 text-[10px] font-mono font-semibold"
          >
            📋 Sprint Standup
          </button>
          <button
            onClick={() => handleAssignTask("Bob, code the new API endpoints and database indexing")}
            className="px-2.5 py-1 rounded-lg bg-[#141a24] hover:bg-[#1a2230] border border-blue-500/30 text-blue-300 text-[10px] font-mono font-semibold"
          >
            👨‍💻 Backend Code
          </button>
          <button
            onClick={() => handleAssignTask("Pixel, design dark glassmorphic dashboard UI components")}
            className="px-2.5 py-1 rounded-lg bg-[#141a24] hover:bg-[#1a2230] border border-pink-500/30 text-pink-300 text-[10px] font-mono font-semibold"
          >
            🎨 UI Design
          </button>
          <button
            onClick={() => handleAssignTask("Nova, write automated regression tests for payment flows")}
            className="px-2.5 py-1 rounded-lg bg-[#141a24] hover:bg-[#1a2230] border border-rose-500/30 text-rose-300 text-[10px] font-mono font-semibold"
          >
            🔍 QA Test
          </button>
          <button
            onClick={() => handleAssignTask("Brass, deploy latest build to production with zero downtime")}
            className="px-2.5 py-1 rounded-lg bg-[#141a24] hover:bg-[#1a2230] border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-semibold"
          >
            🚀 Deploy Cloud
          </button>
        </div>

        {/* Custom Assignment Input Form */}
        <form onSubmit={handleFormSubmit} className="flex gap-2 w-full md:max-w-md">
          <input
            type="text"
            value={customTaskInput}
            onChange={e => setCustomTaskInput(e.target.value)}
            placeholder="Assign task to office employees..."
            className="flex-1 bg-[#141923] border border-[#374558] rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 font-mono"
          />
          <button
            type="submit"
            disabled={!customTaskInput.trim()}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-xl font-mono text-xs font-bold shadow-md disabled:opacity-40 flex items-center gap-1 shrink-0"
          >
            <Send size={12} /> Delegate
          </button>
        </form>
      </div>

      {/* ── Employee Detail Persona Modal Drawer ─────────────────────────── */}
      {selectedEmp && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-xs z-50 flex justify-end animate-mac-fade-in">
          <div className="w-80 bg-[#1e242d] border-l-4 border-[#0f172a] p-4 flex flex-col justify-between shadow-2xl h-full font-mono text-white">
            <div>
              <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center font-bold text-xl"
                    style={{ backgroundColor: selectedEmp.skin }}
                  >
                    {selectedEmp.emoji}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">{selectedEmp.name}</h3>
                    <p className="text-[11px] text-amber-400">{selectedEmp.role}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedEmp(null)} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="p-2.5 rounded-xl bg-[#15191e] border border-slate-700">
                  <span className="text-[10px] text-slate-400">Specialization:</span>
                  <div className="font-bold text-white mt-0.5">{selectedEmp.title}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#15191e] border border-slate-700">
                  <span className="text-[10px] text-slate-400">Current State:</span>
                  <div className="font-bold text-emerald-400 mt-0.5">
                    {selectedEmp.isWalking ? 'Walking to collaborate...' : 'At Desk Coding & Collaborating'}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#15191e] border border-slate-700">
                  <span className="text-[10px] text-slate-400">Team Interaction:</span>
                  <p className="text-[11px] text-cyan-300 mt-1 leading-snug">
                    {activeSpeech.text}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                handleAssignTask(`Alice assigns new task to ${selectedEmp.name}`);
                setSelectedEmp(null);
              }}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold font-mono shadow-lg"
            >
              Assign Sprint to {selectedEmp.name}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
