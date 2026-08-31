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

async function generateClientAiFallback(userMessage) {
  const apiKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY)
    ? import.meta.env.VITE_GEMINI_API_KEY
    : null;

  if (!apiKey) return null;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an AI multi-agent office team coordinator. 
The user submitted this prompt: "${userMessage}"

Analyze the request and delegate work to appropriate team members from:
- Aria (Project Manager)
- Dev (Lead Engineer)
- Pixel (UI Designer)
- Sage (Data Analyst)
- Nova (QA Engineer)
- Byte (DevOps Engineer)

Return ONLY a raw JSON object (no markdown, no backticks) with this structure:
{
  "assignments": [
    { "agentId": "dev", "isPrimary": true, "response": "Specific 2-3 sentence response addressing '${userMessage}' as Dev" },
    { "agentId": "pixel", "isPrimary": false, "response": "Specific 1-2 sentence supporting response addressing '${userMessage}' as Pixel" }
  ],
  "coordinatorSummary": "The team is working together on ${userMessage}..."
}`
            }]
          }]
        })
      }
    );

    if (!response.ok) return null;
    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    const cleanedJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedJson);
    if (parsed.assignments && parsed.coordinatorSummary) {
      return {
        assignments: parsed.assignments,
        coordinatorSummary: parsed.coordinatorSummary,
        aiAvailable: true,
      };
    }
  } catch (err) {
    console.warn('[Client Gemini Fallback] Error:', err.message);
  }
  return null;
}

async function callBackend(message) {
  const targets = [
    API_BASE,
    'http://localhost:5000/api',
    '/api',
  ];
  const uniqueTargets = Array.from(new Set(targets.filter(Boolean)));

  for (const base of uniqueTargets) {
    try {
      const url = base.endsWith('/') ? base.slice(0, -1) : base;
      const res = await axios.post(`${url}/housework-ai/message`, { message }, { timeout: 10000 });
      if (res.data && res.data.assignments) {
        return res.data;
      }
    } catch (_) {}
  }

  // If backend endpoints failed, use direct Gemini client fallback
  const clientAi = await generateClientAiFallback(message);
  if (clientAi) {
    return clientAi;
  }

  throw new Error('Backend server and client AI fallback both unavailable.');
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
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      // Clean up markdown formatting symbols so voice reads naturally
      const cleanText = (text || '')
        .replace(/\*\*([^*]+)\*\*/g, '$1') // remove bold
        .replace(/\*([^*]+)\*/g, '$1')     // remove italic
        .replace(/`([^`]+)`/g, '$1')       // remove inline code
        .replace(/#+\s+/g, '')             // remove headers
        .replace(/\n+/g, ' ')              // replace newlines with space
        .trim();

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const trySetVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          const preferred = voices.find(v =>
            v.lang.startsWith('en') && (
              v.name.includes('Google') ||
              v.name.includes('Natural') ||
              v.name.includes('Samantha') ||
              v.name.includes('Zira') ||
              v.name.includes('Karen') ||
              (v.name.toLowerCase().includes('female') && !v.name.toLowerCase().includes('male'))
            )
          ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

          if (preferred) utterance.voice = preferred;
        }
      };

      trySetVoice();
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.addEventListener('voiceschanged', trySetVoice, { once: true });
      }

      utterance.onstart = () => { setIsSpeaking(true); setOrbMode('speaking'); };
      utterance.onend   = () => { setIsSpeaking(false); setOrbMode('idle'); };
      utterance.onerror = (e) => {
        console.warn('[SpeechSynthesis] Error:', e);
        setIsSpeaking(false);
        setOrbMode('idle');
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[SpeechSynthesis] Exception:', err);
      setIsSpeaking(false);
      setOrbMode('idle');
    }
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
      console.warn('[HouseWorkAI] Running dynamic multi-agent fallback for prompt:', text);
      setAiAvailable(false);

      const lower = text.toLowerCase();
      let mainAgent = 'dev';
      if (lower.includes('design') || lower.includes('ui') || lower.includes('color')) mainAgent = 'pixel';
      else if (lower.includes('data') || lower.includes('report') || lower.includes('metric')) mainAgent = 'sage';
      else if (lower.includes('test') || lower.includes('qa')) mainAgent = 'nova';
      else if (lower.includes('deploy') || lower.includes('cloud')) mainAgent = 'byte';
      else if (lower.includes('plan') || lower.includes('sprint')) mainAgent = 'aria';

      const simAssignments = [
        {
          agentId: mainAgent,
          isPrimary: true,
          response: `I'm analyzing your request: "${text}". Working on the implementation and solution right now.`,
        },
        {
          agentId: 'aria',
          isPrimary: false,
          response: `Coordinating sprint roadmap for "${text.length > 35 ? text.slice(0, 32) + '...' : text}".`,
        },
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
        text: `The team is working together on: "${text.length > 50 ? text.slice(0, 47) + '...' : text}". ${simAssignments.length} agents assigned.`,
        timestamp: new Date(Date.now() + 300),
        assignedAgents: simAssignments.map(a => a.agentId),
      };

      setMessages(prev => [...prev, ...agentMessages, coordinatorMsg]);
      setIsThinking(false);
      setOrbMode('idle');
    }
  }, [setAgentWorking, speak]);

  const [interimTranscript, setInterimTranscript] = useState('');
  const [voiceError, setVoiceError]               = useState(null);

  // ── Voice input (Speech-to-Text) ──────────────────────────────────────
  const startListening = useCallback(async () => {
    setVoiceError(null);
    setInterimTranscript('');

    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError('Voice input requires Google Chrome, Microsoft Edge, or Safari.');
      return;
    }

    // Step 1: Explicitly check hardware mic permission via getUserMedia to unlock Chrome speech engine
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Release hardware mic track so SpeechRecognition can access it
        stream.getTracks().forEach(t => t.stop());
      } catch (micErr) {
        console.warn('[Microphone] getUserMedia check failed:', micErr);
        if (micErr.name === 'NotAllowedError' || micErr.name === 'PermissionDeniedError') {
          setVoiceError('Microphone access denied. Please click the lock icon in browser address bar and set Microphone to Allow.');
          return;
        }
      }
    }

    // Step 2: Now start SpeechRecognition safely
    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setOrbMode('listening');
      };

      recognition.onresult = (e) => {
        let finalText = '';
        let interimText = '';

        for (let i = e.resultIndex; i < e.results.length; ++i) {
          if (e.results[i].isFinal) {
            finalText += e.results[i][0].transcript;
          } else {
            interimText += e.results[i][0].transcript;
          }
        }

        if (interimText) {
          setInterimTranscript(interimText);
        }

        if (finalText.trim()) {
          setInterimTranscript(finalText.trim());
          setIsListening(false);
          setOrbMode('idle');
          sendMessage(finalText.trim());
          setTimeout(() => setInterimTranscript(''), 2000);
        }
      };

      recognition.onerror = (e) => {
        console.warn('[SpeechRecognition] Error:', e.error);
        setIsListening(false);
        setOrbMode('idle');

        // Do not block on 'no-speech' or transient 'aborted'
        if (e.error === 'no-speech' || e.error === 'aborted') {
          return;
        }

        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          setVoiceError('Speech recognition service busy or interrupted. Tap the mic button again to speak.');
        } else if (e.error === 'audio-capture') {
          setVoiceError('No microphone detected on your device.');
        } else if (e.error === 'network') {
          setVoiceError('Speech recognition network error. Please check your connection.');
        } else {
          setVoiceError(`Voice input error: ${e.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setOrbMode('idle');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('[SpeechRecognition] Exception:', err);
      setIsListening(false);
      setOrbMode('idle');
      setVoiceError('Could not start speech recognition.');
    }
  }, [sendMessage]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }
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
      interimTranscript, voiceError,
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
