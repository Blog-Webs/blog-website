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
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight flex items-center gap-2">
            <Focus className="text-blue-600" size={20} /> Pomodoro Focus Engine
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Eliminate distractions, build deep focus momentum with customizable intervals.</p>
        </div>
      </div>

      <div className="p-8 text-center space-y-6 bg-white border border-gray-200 rounded-lg shadow-xs">
        {/* Mode Switch */}
        <div className="flex justify-center gap-2">
          <button
            onClick={() => switchMode('work')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
              mode === 'work'
                ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {workMins} Min Work
          </button>
          <button
            onClick={() => switchMode('break')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
              mode === 'break'
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {breakMins} Min Break
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)} 
            className="p-1.5 rounded-md text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <Settings size={14} />
          </button>
        </div>

        {/* Circular Progress Ring */}
        <div className="relative flex items-center justify-center mx-auto" style={{ width: 200, height: 200 }}>
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="84" fill="none" stroke="#f3f4f6" strokeWidth="8" />
            <circle
              cx="100" cy="100" r="84"
              fill="none"
              stroke={mode === 'work' ? '#2563eb' : '#16a34a'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 84}`}
              strokeDashoffset={`${2 * Math.PI * 84 * (1 - progressPct / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="text-center">
            <span className="text-4xl font-mono font-bold tracking-tight text-gray-900">
              {formatTime(secondsLeft)}
            </span>
            <p className="text-[10px] text-gray-500 font-semibold mt-1 uppercase tracking-wider">{mode === 'work' ? 'Work Session' : 'Break Time'}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setIsActive(!isActive)}
            className="w-12 h-12 rounded-md flex items-center justify-center shadow-xs bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            {isActive ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </button>
          <button
            onClick={resetTimer}
            className="w-10 h-10 rounded-md flex items-center justify-center bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 shadow-xs transition-colors"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-2 pt-4 border-t border-gray-200 space-y-3.5 text-left">
            <p className="text-[11px] font-semibold text-gray-900 text-center uppercase tracking-wider">Custom Timer Settings</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-600 font-medium mb-1 block">Work Duration (mins)</label>
                <input
                  type="range"
                  min={5} max={120} step={5}
                  value={customWork}
                  onChange={e => setCustomWork(parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <p className="text-xs font-mono font-semibold text-gray-900 text-center mt-1">{customWork} min</p>
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium mb-1 block">Break Duration (mins)</label>
                <input
                  type="range"
                  min={1} max={30} step={1}
                  value={customBreak}
                  onChange={e => setCustomBreak(parseInt(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <p className="text-xs font-mono font-semibold text-gray-900 text-center mt-1">{customBreak} min</p>
              </div>
            </div>
            <button 
              onClick={applySettings} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-md text-xs font-medium shadow-xs transition-colors"
            >
              Apply Settings
            </button>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 flex items-center gap-3 bg-white border border-gray-200 rounded-lg shadow-xs">
          <div className="w-8 h-8 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Award size={16} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Today</p>
            <p className="text-sm font-bold font-mono text-gray-900">{focusMinutesToday} min</p>
          </div>
        </div>
        <div className="p-3.5 flex items-center gap-3 bg-white border border-gray-200 rounded-lg shadow-xs">
          <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Focus size={16} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Sessions</p>
            <p className="text-sm font-bold font-mono text-gray-900">{sessions}</p>
          </div>
        </div>
        <div className="p-3.5 flex items-center gap-3 bg-white border border-gray-200 rounded-lg shadow-xs">
          <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <ShieldCheck size={16} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Shield</p>
            <p className="text-xs font-semibold text-emerald-600">Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}