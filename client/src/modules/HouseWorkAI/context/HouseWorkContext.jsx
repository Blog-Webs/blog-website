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

async function generateClientOpenAiFallback(userMessage) {
  const apiKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OPENAI_API_KEY)
    ? import.meta.env.VITE_OPENAI_API_KEY
    : null;

  if (!apiKey) return null;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI multi-agent office team coordinator. 
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
}`,
          },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    const rawText = data?.choices?.[0]?.message?.content;
    if (!rawText) return null;

    const parsed = JSON.parse(rawText.trim());
    if (parsed.assignments && parsed.coordinatorSummary) {
      return {
        assignments: parsed.assignments,
        coordinatorSummary: parsed.coordinatorSummary,
        aiAvailable: true,
        provider: 'OpenAI ChatGPT (Client Fallback)',
      };
    }
  } catch (err) {
    console.warn('[Client OpenAI Fallback] Error:', err.message);
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
      const res = await axios.post(`${url}/housework-ai/message`, { message }, { timeout: 12000 });
      if (res.data && res.data.assignments) {
        return res.data;
      }
    } catch (_) {}
  }

  // If backend endpoints failed, check direct client fallback
  const clientAi = await generateClientOpenAiFallback(message);
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
      text: "Hello! I'm your AI coordinator powered by OpenAI ChatGPT. Speak or send a task and I'll dispatch it to the right team members — multiple agents can work on it simultaneously!",
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
  const [aiProvider, setAiProvider]   = useState('OpenAI ChatGPT');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [voiceError, setVoiceError]   = useState(null);
  const [audioLevel, setAudioLevel]   = useState(0); // 0.0 to 1.0 real-time volume level

  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const micStreamRef = useRef(null);
  const lastTranscriptRef = useRef('');

  // ── Voice Output (SpeechSynthesis) ────────────────────────────────────
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
        .replace(/https?:\/\/\S+/g, '')    // remove URLs
        .replace(/\n+/g, ' ')              // replace newlines with space
        .trim();

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const trySetVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          const preferred = voices.find(v =>
            v.lang.startsWith('en') && (
              v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('Samantha') ||
              v.name.includes('Jenny') ||
              v.name.includes('Guy') ||
              v.name.includes('Aria') ||
              v.name.includes('Zira') ||
              v.name.includes('Karen')
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
        console.warn('[SpeechSynthesis] Event warning:', e);
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
    if (!text || !text.trim()) return;

    // Interrupt any ongoing speech
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    const userMsg = { id: Date.now(), role: 'user', text: text.trim(), timestamp: new Date(), assignedAgents: [] };
    setMessages(prev => [...prev, userMsg]);

    setIsThinking(true);
    setOrbMode('thinking');

    try {
      const data = await callBackend(text.trim());
      setAiAvailable(data.aiAvailable ?? true);
      if (data.provider) setAiProvider(data.provider);

      const assignments = data.assignments || [];

      // Dispatch each assigned agent simultaneously (staggered start, parallel work)
      const taskShort = text.length > 60 ? text.slice(0, 57) + '…' : text;
      assignments.forEach(({ agentId }, idx) => {
        const startDelay = idx * 300;
        const workDuration = 6000 + Math.random() * 7000;
        setTimeout(() => {
          setAgentWorking(agentId, taskShort, workDuration);
        }, startDelay);
      });

      const coordinatorText = data.coordinatorSummary ||
        `${assignments.length} agents are working simultaneously on your request.`;

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

      // Speak the coordinator summary aloud
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
          response: `Analyzing your prompt "${text}". Implementing solution and running validation.`,
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
      speak(coordinatorMsg.text);
    }
  }, [setAgentWorking, speak]);

  // ── Web Audio Analyser (Real-time acoustic visualizer for Perplexity Voice) ─
  const startAudioMeter = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(avg / 128, 1);
        setAudioLevel(normalized);
        animFrameRef.current = requestAnimationFrame(updateMeter);
      };

      updateMeter();
    } catch (err) {
      console.warn('[AudioMeter] Mic stream error:', err.message);
    }
  }, []);

  const stopAudioMeter = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try { audioContextRef.current.close(); } catch (_) {}
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
  }, []);

  // ── Voice Input (Speech-to-Text) ──────────────────────────────────────
  const startListening = useCallback(async () => {
    setVoiceError(null);
    setInterimTranscript('');
    lastTranscriptRef.current = '';

    // Stop TTS if currently speaking
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError('Voice recognition requires Google Chrome, Microsoft Edge, or Safari.');
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_) {}
        recognitionRef.current = null;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setOrbMode('listening');
        startAudioMeter();
      };

      recognition.onresult = (e) => {
        let finalText = '';
        let interimText = '';

        for (let i = e.resultIndex; i < e.results.length; ++i) {
          const item = e.results[i][0];
          if (e.results[i].isFinal) {
            finalText += item.transcript;
          } else {
            interimText += item.transcript;
          }
        }

        const currentText = (finalText || interimText).trim();
        if (currentText) {
          lastTranscriptRef.current = currentText;
          setInterimTranscript(currentText);
        }

        if (finalText.trim()) {
          lastTranscriptRef.current = finalText.trim();
          setIsListening(false);
          setOrbMode('idle');
          stopAudioMeter();
          sendMessage(finalText.trim());
          setTimeout(() => setInterimTranscript(''), 2000);
        }
      };

      recognition.onerror = (e) => {
        console.warn('[SpeechRecognition] Event:', e.error);
        setIsListening(false);
        setOrbMode('idle');
        stopAudioMeter();

        if (e.error === 'no-speech') {
          // If silence timeout occurred but user spoke earlier, dispatch stored transcript
          if (lastTranscriptRef.current) {
            sendMessage(lastTranscriptRef.current);
            setTimeout(() => setInterimTranscript(''), 2000);
            return;
          }
          return;
        }

        if (e.error === 'aborted') {
          return;
        }

        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          setVoiceError('Microphone permission needed. Click the lock icon in your browser address bar and choose "Allow Microphone".');
        } else if (e.error === 'audio-capture') {
          setVoiceError('No microphone detected. Please plug in a mic or select the default audio input.');
        } else if (e.error === 'network') {
          setVoiceError('Speech recognition service offline or network busy. Tap the mic button to retry.');
        } else {
          setVoiceError(`Voice input error: ${e.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setOrbMode('idle');
        stopAudioMeter();

        // If recognition closed with pending speech transcript, auto-send
        if (lastTranscriptRef.current && lastTranscriptRef.current.trim()) {
          const textToSend = lastTranscriptRef.current.trim();
          lastTranscriptRef.current = '';
          sendMessage(textToSend);
          setTimeout(() => setInterimTranscript(''), 2000);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('[SpeechRecognition] Exception:', err);
      setIsListening(false);
      setOrbMode('idle');
      stopAudioMeter();
      setVoiceError('Could not start speech recognition. Tap to try again.');
    }
  }, [sendMessage, startAudioMeter, stopAudioMeter]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }
    stopAudioMeter();
    setIsListening(false);
    setOrbMode('idle');

    if (lastTranscriptRef.current && lastTranscriptRef.current.trim()) {
      const textToSend = lastTranscriptRef.current.trim();
      lastTranscriptRef.current = '';
      sendMessage(textToSend);
      setTimeout(() => setInterimTranscript(''), 2000);
    }
  }, [sendMessage, stopAudioMeter]);

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

  // Clean up mic and audio resources on unmount
  useEffect(() => {
    return () => {
      stopAudioMeter();
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [stopAudioMeter]);

  return (
    <HouseWorkContext.Provider value={{
      messages, agents, isThinking, isSpeaking, isListening, orbMode, aiAvailable, aiProvider,
      interimTranscript, voiceError, audioLevel,
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
