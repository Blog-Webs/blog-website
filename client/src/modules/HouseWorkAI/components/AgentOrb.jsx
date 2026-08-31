import React, { useRef, useEffect, useCallback } from 'react';
import { useHouseWork } from '../context/HouseWorkContext';

// ── Perplexity-style particle orb ──────────────────────────────────────────
// 200 tiny particles orbiting a glowing core.
// On mouse hover: particles smoothly repel away and spring back.
// Mode colors: idle=blue, thinking=yellow, speaking=green, listening=pink.

const PARTICLE_COUNT = 200;

function lerp(a, b, t) { return a + (b - a) * t; }

function randomInRange(min, max) { return min + Math.random() * (max - min); }

function initParticle(i, total) {
  // Distribute particles in concentric "shells" for a sphere-like look
  const shellIndex = Math.floor(i / (total / 3));
  const baseRadius = 55 + shellIndex * 22 + randomInRange(-8, 8);
  const angle = randomInRange(0, Math.PI * 2);
  const yOffset = randomInRange(-20, 20);

  return {
    id: i,
    angle,
    baseRadius,
    radius: baseRadius,
    yOffset,
    yBase: yOffset,
    size: randomInRange(1.2, 2.8),
    baseOpacity: randomInRange(0.35, 0.9),
    opacity: randomInRange(0.35, 0.9),
    speed: randomInRange(0.004, 0.014) * (Math.random() > 0.5 ? 1 : -1),
    phaseOffset: randomInRange(0, Math.PI * 2),
    breatheSpeed: randomInRange(0.8, 2.0),
    x: 0,
    y: 0,
    // Spring state for hover repulsion
    vx: 0,
    vy: 0,
    ox: 0, // original computed x
    oy: 0, // original computed y
    hx: 0, // hover-displaced x
    hy: 0, // hover-displaced y
    displaced: false,
  };
}

const MODE_CONFIG = {
  idle:      { coreColor: '#60a5fa', particleHue: 210, speedMul: 1.0,  radiusMul: 1.0,  corePulse: 0.4, glowColor: '#3b82f6' },
  thinking:  { coreColor: '#fbbf24', particleHue: 45,  speedMul: 3.2,  radiusMul: 1.35, corePulse: 1.2, glowColor: '#f59e0b' },
  speaking:  { coreColor: '#34d399', particleHue: 160, speedMul: 2.2,  radiusMul: 1.2,  corePulse: 0.9, glowColor: '#10b981' },
  listening: { coreColor: '#f472b6', particleHue: 320, speedMul: 1.8,  radiusMul: 1.1,  corePulse: 0.7, glowColor: '#ec4899' },
};

const MODE_LABEL = {
  idle:      '● SYSTEM ACTIVE',
  thinking:  '◉ THINKING…',
  speaking:  '◎ SPEAKING',
  listening: '◉ LISTENING',
};

export default function AgentOrb() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: null, y: null, inside: false });
  const animFrameRef = useRef(null);
  const timeRef = useRef(0);
  const modeRef = useRef('idle');
  const { orbMode } = useHouseWork();

  // Keep modeRef in sync so the draw loop always has the latest mode
  useEffect(() => { modeRef.current = orbMode; }, [orbMode]);

  // ── Init particles once ────────────────────────────────────────────────
  useEffect(() => {
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, (_, i) =>
      initParticle(i, PARTICLE_COUNT)
    );
  }, []);

  // ── Draw loop ──────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 280, H = 280;
    const cx = W / 2, cy = H / 2;

    const mode = modeRef.current;
    const cfg = MODE_CONFIG[mode] || MODE_CONFIG.idle;
    const t = timeRef.current;

    ctx.clearRect(0, 0, W, H);

    // ── Glow aura behind core ──────────────────────────────────────────
    const auraSize = 60 + Math.sin(t * 2) * (cfg.corePulse * 8);
    const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, auraSize);
    aura.addColorStop(0, cfg.glowColor + '55');
    aura.addColorStop(0.4, cfg.glowColor + '22');
    aura.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(cx, cy, auraSize, 0, Math.PI * 2);
    ctx.fillStyle = aura;
    ctx.fill();

    // ── Core orb ──────────────────────────────────────────────────────
    const coreR = 10 + Math.sin(t * (3 + cfg.corePulse)) * (cfg.corePulse * 4);
    const coreGrd = ctx.createRadialGradient(cx, cy - 2, 0, cx, cy, coreR);
    coreGrd.addColorStop(0, '#ffffff');
    coreGrd.addColorStop(0.35, cfg.coreColor);
    coreGrd.addColorStop(1, cfg.glowColor + '00');
    ctx.beginPath();
    ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
    ctx.fillStyle = coreGrd;
    ctx.fill();

    const mouse = mouseRef.current;
    const hasMouse = mouse.inside && mouse.x !== null;

    // ── Particles ─────────────────────────────────────────────────────
    particlesRef.current.forEach(p => {
      // Rotate angle
      p.angle += p.speed * cfg.speedMul;

      // Breathing radius
      const breathe = Math.sin(t * p.breatheSpeed + p.phaseOffset) * 12;
      const targetRadius = p.baseRadius * cfg.radiusMul + breathe;
      p.radius = lerp(p.radius, targetRadius, 0.04);

      // Y drift
      const yDrift = Math.sin(t * 0.7 + p.phaseOffset) * 14;
      const targetY = p.yBase + yDrift;
      p.yOffset = lerp(p.yOffset, targetY, 0.03);

      // Base position on orbit
      const ox = cx + Math.cos(p.angle) * p.radius;
      const oy = cy + Math.sin(p.angle) * (p.radius * 0.42) + p.yOffset;
      p.ox = ox;
      p.oy = oy;

      // ── Mouse hover spring repulsion ──────────────────────────────
      let fx = ox, fy = oy;
      if (hasMouse) {
        const dx = ox - mouse.x;
        const dy = oy - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repelRadius = 75;
        if (dist < repelRadius && dist > 0.5) {
          const force = Math.pow(1 - dist / repelRadius, 2) * 38;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      }

      // Spring damping back to orbit position
      const springK = 0.12;
      const damping = 0.78;
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

      // ── Color per particle ────────────────────────────────────────
      const hue = cfg.particleHue + Math.sin(t * 1.5 + p.phaseOffset) * 18;
      const lightness = 55 + p.baseOpacity * 20;
      const alpha = p.baseOpacity * (mode === 'idle' ? 0.7 : 0.95);

      // Size pulse on active modes
      const drawSize = p.size * (mode !== 'idle' ? 1.25 : 1.0);

      ctx.beginPath();
      ctx.arc(fx, fy, drawSize, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, 80%, ${lightness}%, ${alpha})`;
      ctx.fill();

      // Glow dot for larger particles
      if (p.size > 2.2) {
        ctx.beginPath();
        ctx.arc(fx, fy, drawSize * 2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 90%, 70%, ${alpha * 0.2})`;
        ctx.fill();
      }
    });

    timeRef.current += 0.016;
    animFrameRef.current = requestAnimationFrame(draw);
  }, []);

  // ── Canvas setup ───────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = 280, H = 280;
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

  // ── Mouse handlers ─────────────────────────────────────────────────────
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
    <div className="flex flex-col items-center gap-4 select-none">
      {/* Canvas */}
      <div className="relative cursor-crosshair group">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="block transition-transform duration-300"
        />
      </div>

      {/* Status indicator */}
      <div
        className="flex items-center gap-2 text-[11px] font-mono font-bold tracking-[0.15em] transition-colors duration-500"
        style={{ color: cfg.coreColor }}
      >
        <span
          className={orbMode !== 'idle' ? 'animate-pulse' : ''}
          style={{ textShadow: `0 0 10px ${cfg.coreColor}88` }}
        >
          {MODE_LABEL[orbMode]}
        </span>
      </div>
    </div>
  );
}
