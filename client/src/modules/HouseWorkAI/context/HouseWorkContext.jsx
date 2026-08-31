import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';

// ── Agent Definitions (mirrors backend AGENTS) ─────────────────────────────
export const AGENTS = [
  { id: 'aria',  name: 'Aria',  role: 'Project Manager',  emoji: '👩‍💼', room: 'reception', color: '#8B5CF6' },
  { id: 'dev',   name: 'Dev',   role: 'Lead Engineer',    emoji: '👨‍💻', room: 'dev',       color: '#3B82F6' },
  { id: 'pixel', name: 'Pixel', role: 'UI Designer',      emoji: '🎨',  room: 'design',    color: '#EC4899' },
  { id: 'sage',  name: 'Sage',  role: 'Data Analyst',     emoji: '📊',  room: 'analytics', color: '#10B981' },
  { id: 'nova',  name: 'Nova',  role: 'QA Engineer',      emoji: '🔍',  room: 'dev',       color: '#F59E0B' },
  { id: 'byte',  name: 'Byte',  role: 'DevOps Engineer',  emoji: '⚙️',  room: 'server',    color: '#6366F1' },
];

// ── API base URL ──────────────────────────────────────────────────────────
const API_BASE = (() => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000/api';
  }
  return '/api';
})();

async function callBackend(message) {
  const res = await axios.post(`${API_BASE}/housework-ai/message`, { message }, {
    timeout: 30000,
  });
  return res.data;
}

async function callBackendDirectAgent(agentId, message) {
  const res = await axios.post(`${API_BASE}/housework-ai/agent-chat`, { agentId, message }, {
    timeout: 30000,
  });
  return res.data;
}

// ── Context ────────────────────────────────────────────────────────────────
const HouseWorkContext = createContext(null);

export function HouseWorkProvider({ children }) {
  const [messages, setMessages] = useState([
    {
      id: 1, role: 'ai', timestamp: new Date(), assignedAgents: [],
      text: "Hello! I'm your AI coordinator. Send me a task and I'll dispatch it to the right team members — multiple agents can work on it simultaneously!",
    },
  ]);

  // All 6 agents — each tracks own status independently
  const [agents, setAgents] = useState(
    AGENTS.map(a => ({ ...a, status: 'idle', currentTask: null }))
  );

  const [isThinking, setIsThinking]   = useState(false);
  const [isSpeaking, setIsSpeaking]   = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [orbMode, setOrbMode]         = useState('idle'); // idle|thinking|speaking|listening
  const [aiAvailable, setAiAvailable] = useState(true);

  const recognitionRef = useRef(null);

  // ── Voice Output ──────────────────────────────────────────────────────
  const speak = useCallback((text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate  = 1.05;
    utterance.pitch = 1.1;
    utterance.volume = 1;

    const trySetVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v =>
        v.name.includes('Samantha') ||
        v.name.includes('Karen') ||
        v.name.includes('Google UK English Female') ||
        v.name.includes('Zira') ||
        (v.lang === 'en-US' && !v.name.toLowerCase().includes('male'))
      );
      if (preferred) utterance.voice = preferred;
    };
    trySetVoice();
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.addEventListener('voiceschanged', trySetVoice, { once: true });
    }

    utterance.onstart = () => { setIsSpeaking(true); setOrbMode('speaking'); };
    utterance.onend   = () => { setIsSpeaking(false); setOrbMode('idle'); };
    utterance.onerror = () => { setIsSpeaking(false); setOrbMode('idle'); };

    window.speechSynthesis.speak(utterance);
  }, []);

  // ── Set an agent working ──────────────────────────────────────────────
  const setAgentWorking = useCallback((agentId, task, durationMs) => {
    setAgents(prev =>
      prev.map(a => a.id === agentId ? { ...a, status: 'working', currentTask: task } : a)
    );
    setTimeout(() => {
      setAgents(prev =>
        prev.map(a => a.id === agentId ? { ...a, status: 'done', currentTask: `✅ ${task}` } : a)
      );
      setTimeout(() => {
        setAgents(prev =>
          prev.map(a => a.id === agentId ? { ...a, status: 'idle', currentTask: null } : a)
        );
      }, 4000);
    }, durationMs);
  }, []);

  // ── Main: send message to backend, dispatch multiple agents ───────────
  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    const userMsg = { id: Date.now(), role: 'user', text: text.trim(), timestamp: new Date(), assignedAgents: [] };
    setMessages(prev => [...prev, userMsg]);

    setIsThinking(true);
    setOrbMode('thinking');

    try {
      // Call the real backend multi-agent endpoint
      const data = await callBackend(text.trim());
      setAiAvailable(data.aiAvailable ?? true);

      // data.assignments = [{ agentId, isPrimary, response }]
      const assignments = data.assignments || [];

      // Dispatch each assigned agent simultaneously (staggered start, parallel work)
      const taskShort = text.length > 60 ? text.slice(0, 57) + '…' : text;
      assignments.forEach(({ agentId }, idx) => {
        const startDelay = idx * 300; // stagger start by 300ms per agent
        const workDuration = 6000 + Math.random() * 7000;
        setTimeout(() => {
          setAgentWorking(agentId, taskShort, workDuration);
        }, startDelay);
      });

      // Build coordinator message (shows all agents' responses)
      const coordinatorText = data.coordinatorSummary ||
        `${assignments.length} agents are working simultaneously on your request.`;

      // Build per-agent sub-messages
      const agentMessages = assignments.map((a, i) => ({
        id: Date.now() + i + 100,
        role: 'agent',
        agentId: a.agentId,
        isPrimary: a.isPrimary,
        text: a.response,
        timestamp: new Date(Date.now() + i * 100),
        assignedAgents: [],
      }));

      const coordinatorMsg = {
        id: Date.now() + 200,
        role: 'ai',
        text: coordinatorText,
        timestamp: new Date(Date.now() + 300),
        assignedAgents: assignments.map(a => a.agentId),
      };

      setMessages(prev => [...prev, ...agentMessages, coordinatorMsg]);
      setIsThinking(false);

      // Speak the coordinator summary
      speak(coordinatorText);

    } catch (err) {
      console.warn('[HouseWorkAI] Running simulated multi-agent fallback:', err.message);
      setAiAvailable(false);

      // Fallback: Dispatch simulated multi-agent execution out-of-the-box
      const simAssignments = [
        { agentId: 'aria', isPrimary: true, response: 'Organizing sprint tasks and coordinating team assignments.' },
        { agentId: 'dev', isPrimary: false, response: 'Analyzing code requirements and implementing full-stack solution.' },
        { agentId: 'pixel', isPrimary: false, response: 'Crafting responsive UI layouts and modern color tokens.' },
        { agentId: 'sage', isPrimary: false, response: 'Querying data metrics and preparing performance analytics.' },
      ];

      const taskShort = text.length > 60 ? text.slice(0, 57) + '…' : text;
      simAssignments.forEach(({ agentId }, idx) => {
        const startDelay = idx * 300;
        const workDuration = 4000 + Math.random() * 5000;
        setTimeout(() => {
          setAgentWorking(agentId, taskShort, workDuration);
        }, startDelay);
      });

      const agentMessages = simAssignments.map((a, i) => ({
        id: Date.now() + i + 100,
        role: 'agent',
        agentId: a.agentId,
        isPrimary: a.isPrimary,
        text: a.response,
        timestamp: new Date(Date.now() + i * 100),
        assignedAgents: [],
      }));

      const coordinatorMsg = {
        id: Date.now() + 200,
        role: 'ai',
        text: `The Stonic multi-agent team is on it! ${simAssignments.length} agents are collaborating simultaneously on your request.`,
        timestamp: new Date(Date.now() + 300),
        assignedAgents: simAssignments.map(a => a.agentId),
      };

      setMessages(prev => [...prev, ...agentMessages, coordinatorMsg]);
      setIsThinking(false);
      setOrbMode('idle');
    }
  }, [setAgentWorking, speak]);

  // ── Voice input ───────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input requires Google Chrome or Microsoft Edge.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart  = () => { setIsListening(true); setOrbMode('listening'); };
    recognition.onend    = () => { setIsListening(false); setOrbMode('idle'); };
    recognition.onerror  = () => { setIsListening(false); setOrbMode('idle'); };
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      recognition.stop();
      setIsListening(false);
      setOrbMode('idle');
      sendMessage(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [sendMessage]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setOrbMode('idle');
  }, []);

  const sendDirectAgentMessage = useCallback(async (agentId, text) => {
    if (!text || !text.trim()) return;

    const userMsg = { id: Date.now(), role: 'user', text: text.trim(), timestamp: new Date(), assignedAgents: [agentId] };
    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const data = await callBackendDirectAgent(agentId, text.trim());
      setAiAvailable(data.aiAvailable ?? true);

      const agentMsg = {
        id: Date.now() + 100,
        role: 'agent',
        agentId: data.agentId || agentId,
        isPrimary: true,
        text: data.response,
        timestamp: new Date(),
        assignedAgents: [],
      };

      setMessages(prev => [...prev, agentMsg]);
      setIsThinking(false);
      if (data.response) speak(data.response);
      setAgentWorking(agentId, text.slice(0, 50), 4000);
    } catch (err) {
      console.warn('[HouseWorkAI] Direct agent chat error:', err.message);
      setIsThinking(false);
    }
  }, [setAgentWorking, speak]);

  return (
    <HouseWorkContext.Provider value={{
      messages, agents, isThinking, isSpeaking, isListening, orbMode, aiAvailable,
      sendMessage, sendDirectAgentMessage, speak, startListening, stopListening,
    }}>
      {children}
    </HouseWorkContext.Provider>
  );
}

export function useHouseWork() {
  const ctx = useContext(HouseWorkContext);
  if (!ctx) throw new Error('useHouseWork must be used within HouseWorkProvider');
  return ctx;
}
