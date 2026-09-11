import React, { useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2, Sparkles, AlertCircle } from 'lucide-react';
import { useHouseWork } from '../context/HouseWorkContext';

// ── Perplexity-style acoustic particle orb ──────────────────────────────────
// 220 microscopic glowing particles orbiting an acoustic energetic core.
// Responds to real-time microphone volume / sound intensity when listening.
// Mode colors: idle=electric blue, thinking=solar amber, speaking=emerald green, listening=neon magenta.

const PARTICLE_COUNT = 220;

function lerp(a, b, t) { return a + (b - a) * t; }
function randomInRange(min, max) { return min + Math.random() * (max - min); }

function initParticle(i, total) {
  const shellIndex = Math.floor(i / (total / 3));
  const baseRadius = 55 + shellIndex * 24 + randomInRange(-8, 8);
  const angle = randomInRange(0, Math.PI * 2);
  const yOffset = randomInRange(-22, 22);

  return {
    id: i,
    angle,
    baseRadius,
    radius: baseRadius,
    yOffset,
    yBase: yOffset,
    size: randomInRange(1.3, 3.0),
    baseOpacity: randomInRange(0.4, 0.95),
    opacity: randomInRange(0.4, 0.95),
    speed: randomInRange(0.005, 0.015) * (Math.random() > 0.5 ? 1 : -1),
    phaseOffset: randomInRange(0, Math.PI * 2),
    breatheSpeed: randomInRange(0.8, 2.2),
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    ox: 0,
    oy: 0,
    hx: 0,
    hy: 0,
  };
}

const MODE_CONFIG = {
  idle:      { coreColor: '#38bdf8', particleHue: 200, speedMul: 1.0,  radiusMul: 1.0,  corePulse: 0.4, glowColor: '#0284c7' },
  thinking:  { coreColor: '#fbbf24', particleHue: 42,  speedMul: 3.4,  radiusMul: 1.35, corePulse: 1.2, glowColor: '#d97706' },
  speaking:  { coreColor: '#34d399', particleHue: 155, speedMul: 2.2,  radiusMul: 1.2,  corePulse: 0.9, glowColor: '#059669' },
  listening: { coreColor: '#f43f5e', particleHue: 335, speedMul: 2.0,  radiusMul: 1.2,  corePulse: 1.4, glowColor: '#e11d48' },
};

const MODE_LABEL = {
  idle:      'PERPLEXITY NEURAL ORB · READY',
  thinking:  'TEAM SYNTHESIS · THINKING…',
  speaking:  'AI COORDINATOR · SPEAKING',
  listening: 'LIVE VOICE ASSISTANT · LISTENING',
};

export default function AgentOrb() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: null, y: null, inside: false });
  const animFrameRef = useRef(null);
  const timeRef = useRef(0);
  const modeRef = useRef('idle');
  const audioLevelRef = useRef(0);

  const {
    orbMode,
    isListening,
    isSpeaking,
    isThinking,
    startListening,
    stopListening,
    interimTranscript,
    voiceError,
    audioLevel,
  } = useHouseWork();

  useEffect(() => { modeRef.current = orbMode; }, [orbMode]);
  useEffect(() => { audioLevelRef.current = audioLevel || 0; }, [audioLevel]);

  // Init particles once
  useEffect(() => {
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, (_, i) =>
      initParticle(i, PARTICLE_COUNT)
    );
  }, []);

  // Draw loop
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 320, H = 320;
    const cx = W / 2, cy = H / 2;

    const mode = modeRef.current;
    const cfg = MODE_CONFIG[mode] || MODE_CONFIG.idle;
    const t = timeRef.current;
    const vol = audioLevelRef.current; // 0.0 to 1.0

    ctx.clearRect(0, 0, W, H);

    // ── Acoustic Ripple Rings when speaking/listening ──────────────────
    if (mode === 'listening' || mode === 'speaking') {
      const ringIntensity = mode === 'listening' ? (vol * 1.5 + 0.3) : 0.6;
      for (let r = 1; r <= 3; r++) {
        const ringRadius = 40 + r * 30 + Math.sin(t * 4 + r) * 8 * ringIntensity;
        ctx.beginPath();
        ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `${cfg.glowColor}${Math.floor(Math.max(0.1, 0.4 - r * 0.1) * 255).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    // ── Outer Glow aura ────────────────────────────────────────────────
    const baseAura = 70 + (mode === 'listening' ? vol * 40 : 0);
    const auraSize = baseAura + Math.sin(t * 2.5) * (cfg.corePulse * 10);
    const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, auraSize);
    aura.addColorStop(0, cfg.glowColor + '66');
    aura.addColorStop(0.45, cfg.glowColor + '22');
    aura.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(cx, cy, auraSize, 0, Math.PI * 2);
    ctx.fillStyle = aura;
    ctx.fill();

    // ── Energetic Core Orb ─────────────────────────────────────────────
    const coreAdd = mode === 'listening' ? vol * 18 : 0;
    const coreR = 12 + coreAdd + Math.sin(t * (3 + cfg.corePulse)) * (cfg.corePulse * 5);
    const coreGrd = ctx.createRadialGradient(cx, cy - 2, 0, cx, cy, coreR);
    coreGrd.addColorStop(0, '#ffffff');
    coreGrd.addColorStop(0.4, cfg.coreColor);
    coreGrd.addColorStop(1, cfg.glowColor + '00');
    ctx.beginPath();
    ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
    ctx.fillStyle = coreGrd;
    ctx.fill();

    const mouse = mouseRef.current;
    const hasMouse = mouse.inside && mouse.x !== null;

    // ── Micro Particles ────────────────────────────────────────────────
    particlesRef.current.forEach(p => {
      const speedBoost = mode === 'listening' ? (1.0 + vol * 2.5) : 1.0;
      p.angle += p.speed * cfg.speedMul * speedBoost;

      const breathe = Math.sin(t * p.breatheSpeed + p.phaseOffset) * 14;
      const audioExpansion = mode === 'listening' ? vol * 35 : 0;
      const targetRadius = p.baseRadius * cfg.radiusMul + breathe + audioExpansion;
      p.radius = lerp(p.radius, targetRadius, 0.05);

      const yDrift = Math.sin(t * 0.8 + p.phaseOffset) * 16;
      const targetY = p.yBase + yDrift;
      p.yOffset = lerp(p.yOffset, targetY, 0.04);

      const ox = cx + Math.cos(p.angle) * p.radius;
      const oy = cy + Math.sin(p.angle) * (p.radius * 0.44) + p.yOffset;
      p.ox = ox;
      p.oy = oy;

      // Mouse hover physics
      let fx = ox, fy = oy;
      if (hasMouse) {
        const dx = ox - mouse.x;
        const dy = oy - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repelRadius = 85;
        if (dist < repelRadius && dist > 0.5) {
          const force = Math.pow(1 - dist / repelRadius, 2) * 42;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      }

      const springK = 0.14;
      const damping = 0.8;
      const springDX = p.hx - ox;
      const springDY = p.hy - oy;
      p.vx += -springK * springDX;
      p.vy += -springK * springDY;
      p.vx *= damping;
      p.vy *= damping;

      p.hx = ox + p.vx;
      p.hy = oy + p.vy;
      fx = p.hx;
      fy = p.hy;
      p.x = fx;
      p.y = fy;

      const hue = cfg.particleHue + Math.sin(t * 1.8 + p.phaseOffset) * 20;
      const lightness = 60 + p.baseOpacity * 22;
      const alpha = Math.min(1, p.baseOpacity * (mode === 'idle' ? 0.75 : 0.95) + (mode === 'listening' ? vol * 0.3 : 0));
      const drawSize = p.size * (mode !== 'idle' ? 1.3 : 1.0) * (mode === 'listening' ? (1 + vol * 0.6) : 1.0);

      ctx.beginPath();
      ctx.arc(fx, fy, drawSize, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, 85%, ${lightness}%, ${alpha})`;
      ctx.fill();

      if (p.size > 2.2) {
        ctx.beginPath();
        ctx.arc(fx, fy, drawSize * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 95%, 70%, ${alpha * 0.25})`;
        ctx.fill();
      }
    });

    timeRef.current += 0.016;
    animFrameRef.current = requestAnimationFrame(draw);
  }, []);

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = 320, H = 320;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    canvas.getContext('2d').scale(dpr, dpr);

    animFrameRef.current = requestAnimationFrame(draw);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [draw]);

  const handleMouseMove = useCallback((e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, inside: true };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: null, y: null, inside: false };
  }, []);

  const cfg = MODE_CONFIG[orbMode] || MODE_CONFIG.idle;

  return (
    <div className="flex flex-col items-center gap-3 select-none w-full max-w-md mx-auto">
      {/* ── Interactive Canvas Orb ────────────────────────────────────────── */}
      <div
        onClick={() => (isListening ? stopListening() : startListening())}
        className="relative cursor-pointer group hover:scale-[1.03] active:scale-95 transition-all duration-300"
        title={isListening ? 'Click to stop listening' : 'Click to speak to Perplexity Voice Assistant'}
      >
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="block drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
        />

        {/* Center Hover Action Pill */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/25 rounded-full backdrop-blur-[1.5px]">
          <span className={`text-[11px] font-mono font-bold text-white px-4 py-2 rounded-full shadow-xl border flex items-center gap-2 ${
            isListening
              ? 'bg-rose-600/90 border-rose-400/50 animate-pulse'
              : 'bg-blue-600/90 border-blue-400/50'
          }`}>
            {isListening ? <MicOff size={14} /> : <Mic size={14} />}
            {isListening ? 'Stop Listening' : 'Tap to Speak'}
          </span>
        </div>
      </div>

      {/* ── Status & Live Voice Feedback ──────────────────────────────────── */}
      <div className="flex flex-col items-center gap-2 text-center w-full px-4">
        {/* Status Mode Badge */}
        <div
          className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[10px] font-mono font-bold tracking-[0.18em] transition-all duration-300"
          style={{ color: cfg.coreColor }}
        >
          <span
            className={`w-2 h-2 rounded-full ${orbMode !== 'idle' ? 'animate-ping' : ''}`}
            style={{ backgroundColor: cfg.coreColor }}
          />
          {MODE_LABEL[orbMode]}
        </div>

        {/* Live Audio Equalizer Bars when listening */}
        {isListening && (
          <div className="flex items-center gap-1.5 py-1">
            {[40, 70, 100, 85, 60, 95, 50, 80].map((h, i) => {
              const dynHeight = Math.max(6, Math.round((h / 100) * (audioLevel * 28 + 8)));
              return (
                <div
                  key={i}
                  className="w-1 bg-rose-400 rounded-full transition-all duration-75"
                  style={{ height: `${dynHeight}px` }}
                />
              );
            })}
          </div>
        )}

        {/* Live Speech-to-Text Transcript Preview */}
        {interimTranscript && (
          <div className="max-w-md text-xs text-rose-200 font-mono italic px-4 py-2 rounded-2xl bg-rose-950/50 border border-rose-500/40 shadow-lg animate-pulse">
            "{interimTranscript}"
          </div>
        )}

        {/* Voice Error Notification */}
        {voiceError && (
          <div className="max-w-md flex items-center gap-2 text-left text-[11px] text-amber-300 font-mono px-3.5 py-2 rounded-xl bg-amber-950/50 border border-amber-500/40 shadow-md">
            <AlertCircle size={15} className="shrink-0 text-amber-400" />
            <span>{voiceError}</span>
          </div>
        )}

        {/* Action Button Strip */}
        <div className="flex items-center gap-2 mt-1">
          <button
            type="button"
            onClick={() => (isListening ? stopListening() : startListening())}
            className={`px-4 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-md ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 ring-2 ring-rose-400/40 animate-pulse'
                : 'bg-white/10 hover:bg-white/15 text-white/90 border border-white/10 hover:border-white/20'
            }`}
          >
            {isListening ? <MicOff size={13} /> : <Mic size={13} />}
            {isListening ? 'Listening… Tap to Finish' : '🎙️ Speak Voice Query'}
          </button>
        </div>
      </div>
    </div>
  );
}
