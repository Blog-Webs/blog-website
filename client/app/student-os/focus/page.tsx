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
        <Badge className="gap-1 px-3 py-1 bg-blue-50 text-blue-700 border-blue-200 text-xs font-semibold">
          <Focus size={13} className="text-blue-600" /> Distraction-Free Focus
        </Badge>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pomodoro Focus Timer</h1>
        <p className="text-xs text-slate-500">Eliminate distractions, build deep focus momentum with customizable intervals.</p>
      </div>

      <Card className="max-w-lg mx-auto p-8 text-center space-y-6 bg-white border-slate-200 rounded-3xl shadow-xs">
        {/* Mode Switch */}
        <div className="flex justify-center gap-3">
          <Button
            size="sm"
            onClick={() => switchMode('work')}
            className={`rounded-xl text-xs font-bold transition-all ${
              mode === 'work'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {workMins} Min Work
          </Button>
          <Button
            size="sm"
            onClick={() => switchMode('break')}
            className={`rounded-xl text-xs font-bold transition-all ${
              mode === 'break'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {breakMins} Min Break
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)} className="text-slate-500 hover:bg-slate-100 rounded-xl">
            <Settings size={16} />
          </Button>
        </div>

        {/* Circular Progress Ring */}
        <div className="relative flex items-center justify-center mx-auto" style={{ width: 220, height: 220 }}>
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="88" fill="none" stroke="#f1f5f9" strokeWidth="10" />
            <circle
              cx="100" cy="100" r="88"
              fill="none"
              stroke={mode === 'work' ? '#2563eb' : '#16a34a'}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 88}`}
              strokeDashoffset={`${2 * Math.PI * 88 * (1 - progressPct / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="text-center">
            <span className="text-5xl font-mono font-black tracking-tight text-slate-900">
              {formatTime(secondsLeft)}
            </span>
            <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">{mode === 'work' ? 'Work Session' : 'Break Time'}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={() => setIsActive(!isActive)}
            size="lg"
            className="w-16 h-16 rounded-full p-0 shadow-lg shadow-blue-500/25 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isActive ? <Pause size={26} /> : <Play size={26} className="ml-0.5" />}
          </Button>
          <Button
            onClick={resetTimer}
            variant="outline"
            size="lg"
            className="w-12 h-12 rounded-full p-0 bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw size={18} />
          </Button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-2 pt-4 border-t border-slate-100 space-y-4 text-left">
            <p className="text-xs font-bold text-slate-900 text-center uppercase tracking-wider">Custom Timer Settings</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-600 font-semibold mb-1 block">Work Duration (mins)</label>
                <input
                  type="range"
                  min={5} max={120} step={5}
                  value={customWork}
                  onChange={e => setCustomWork(parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <p className="text-sm font-bold text-slate-900 text-center mt-1">{customWork} min</p>
              </div>
              <div>
                <label className="text-xs text-slate-600 font-semibold mb-1 block">Break Duration (mins)</label>
                <input
                  type="range"
                  min={1} max={30} step={1}
                  value={customBreak}
                  onChange={e => setCustomBreak(parseInt(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <p className="text-sm font-bold text-slate-900 text-center mt-1">{customBreak} min</p>
              </div>
            </div>
            <Button onClick={applySettings} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs">
              Apply Settings
            </Button>
          </div>
        )}
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
        <Card className="p-4 flex items-center gap-3 bg-white border-slate-200 rounded-3xl shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Award size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Today</p>
            <p className="text-base font-bold text-slate-900">{focusMinutesToday} min</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3 bg-white border-slate-200 rounded-3xl shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Focus size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Sessions</p>
            <p className="text-base font-bold text-slate-900">{sessions}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3 bg-white border-slate-200 rounded-3xl shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Shield</p>
            <p className="text-sm font-bold text-emerald-600">Active</p>
          </div>
        </Card>
      </div>
    </div>
  );
}