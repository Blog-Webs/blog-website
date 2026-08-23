'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Focus, ShieldCheck, Award, Settings } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStudentOS } from '@/context/StudentOSContext';

export default function FocusModePage() {
  const { focusMinutesToday, addFocusMinutes } = useStudentOS();

  // Custom durations
  const [workMins, setWorkMins] = useState(25);
  const [breakMins, setBreakMins] = useState(5);

  const [secondsLeft, setSecondsLeft] = useState(workMins * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [sessions, setSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [customWork, setCustomWork] = useState(workMins);
  const [customBreak, setCustomBreak] = useState(breakMins);

  const alertShown = useRef(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => setSecondsLeft(s => s - 1), 1000);
    } else if (secondsLeft === 0 && isActive && !alertShown.current) {
      alertShown.current = true;
      setIsActive(false);
      if (mode === 'work') {
        addFocusMinutes(workMins);
        setSessions(s => s + 1);
        setMode('break');
        setSecondsLeft(breakMins * 60);
      } else {
        setMode('work');
        setSecondsLeft(workMins * 60);
      }
      setTimeout(() => { alertShown.current = false; }, 500);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive, secondsLeft, mode, workMins, breakMins, addFocusMinutes]);

  const switchMode = (newMode: 'work' | 'break') => {
    setIsActive(false);
    setMode(newMode);
    setSecondsLeft(newMode === 'work' ? workMins * 60 : breakMins * 60);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(mode === 'work' ? workMins * 60 : breakMins * 60);
  };

  const applySettings = () => {
    setIsActive(false);
    setWorkMins(customWork);
    setBreakMins(customBreak);
    setMode('work');
    setSecondsLeft(customWork * 60);
    setShowSettings(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalSecs = mode === 'work' ? workMins * 60 : breakMins * 60;
  const progressPct = ((totalSecs - secondsLeft) / totalSecs) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6">
      <div className="text-center space-y-2">
        <Badge variant="apple" className="gap-1 px-3 py-1">
          <Focus size={13} /> Distraction-Free Focus
        </Badge>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Pomodoro Focus Timer</h1>
        <p className="text-xs text-zinc-400">Eliminate distractions, build deep focus momentum with customizable intervals.</p>
      </div>

      <Card className="max-w-lg mx-auto p-8 text-center space-y-6 bg-zinc-950 border-zinc-800">
        {/* Mode Switch */}
        <div className="flex justify-center gap-3">
          <Button
            variant={mode === 'work' ? 'apple' : 'secondary'}
            size="sm"
            onClick={() => switchMode('work')}
          >
            {workMins} Min Work
          </Button>
          <Button
            variant={mode === 'break' ? 'apple' : 'secondary'}
            size="sm"
            onClick={() => switchMode('break')}
          >
            {breakMins} Min Break
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
            <Settings size={16} />
          </Button>
        </div>

        {/* Circular Progress Ring */}
        <div className="relative flex items-center justify-center mx-auto" style={{ width: 200, height: 200 }}>
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="none" stroke="#27272a" strokeWidth="10" />
            <circle
              cx="100" cy="100" r="90"
              fill="none"
              stroke={mode === 'work' ? '#3b82f6' : '#22c55e'}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 90}`}
              strokeDashoffset={`${2 * Math.PI * 90 * (1 - progressPct / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="text-center">
            <span className="text-5xl font-mono font-extrabold tracking-tight text-white">
              {formatTime(secondsLeft)}
            </span>
            <p className="text-xs text-zinc-400 mt-1 capitalize">{mode === 'work' ? 'Work Session' : 'Break Time'}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button onClick={() => setIsActive(!isActive)} variant="apple" size="lg" className="w-16 h-16 rounded-full p-0 shadow-lg">
            {isActive ? <Pause size={26} /> : <Play size={26} className="ml-0.5" />}
          </Button>
          <Button onClick={resetTimer} variant="outline" size="lg" className="w-12 h-12 rounded-full p-0">
            <RotateCcw size={18} />
          </Button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-2 pt-4 border-t border-zinc-800 space-y-4 text-left">
            <p className="text-xs font-bold text-zinc-300 text-center">Custom Timer Settings</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Work Duration (mins)</label>
                <input
                  type="range"
                  min={5} max={120} step={5}
                  value={customWork}
                  onChange={e => setCustomWork(parseInt(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <p className="text-sm font-bold text-white text-center mt-1">{customWork} min</p>
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Break Duration (mins)</label>
                <input
                  type="range"
                  min={1} max={30} step={1}
                  value={customBreak}
                  onChange={e => setCustomBreak(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <p className="text-sm font-bold text-white text-center mt-1">{customBreak} min</p>
              </div>
            </div>
            <Button onClick={applySettings} variant="apple" className="w-full">Apply Settings</Button>
          </div>
        )}
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
        <Card className="p-4 flex items-center gap-3">
          <Award className="text-amber-400 shrink-0" size={22} />
          <div>
            <p className="text-[10px] text-zinc-400">Today</p>
            <p className="text-base font-bold text-white">{focusMinutesToday} min</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <Focus className="text-blue-400 shrink-0" size={22} />
          <div>
            <p className="text-[10px] text-zinc-400">Sessions</p>
            <p className="text-base font-bold text-white">{sessions}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <ShieldCheck className="text-emerald-400 shrink-0" size={22} />
          <div>
            <p className="text-[10px] text-zinc-400">Shield</p>
            <p className="text-sm font-bold text-emerald-400">Active</p>
          </div>
        </Card>
      </div>
    </div>
  );
}