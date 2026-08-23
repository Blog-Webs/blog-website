'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Focus, ShieldCheck, Award } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStudentOS } from '@/context/StudentOSContext';

export default function FocusModePage() {
  const { focusMinutesToday, addFocusMinutes } = useStudentOS();
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      if (mode === 'work') {
        addFocusMinutes(25);
        alert('🎉 Focus session complete! Take a 5-minute break.');
        setMode('break');
        setSecondsLeft(5 * 60);
      } else {
        alert('Break over! Ready for deep work?');
        setMode('work');
        setSecondsLeft(25 * 60);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsLeft, mode, addFocusMinutes]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6">
      <div className="text-center space-y-2">
        <Badge variant="apple" className="gap-1 px-3 py-1">
          <Focus size={13} /> Distraction-Free Focus
        </Badge>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Pomodoro Timer</h1>
        <p className="text-xs text-zinc-400">Eliminate tabs, write code, and build deep focus momentum.</p>
      </div>

      <Card className="max-w-lg mx-auto p-8 text-center space-y-8 bg-zinc-950 border-zinc-800">
        <div className="flex justify-center gap-3">
          <Button
            variant={mode === 'work' ? 'apple' : 'secondary'}
            size="sm"
            onClick={() => { setMode('work'); setSecondsLeft(25 * 60); setIsActive(false); }}
          >
            25 Min Work Session
          </Button>
          <Button
            variant={mode === 'break' ? 'apple' : 'secondary'}
            size="sm"
            onClick={() => { setMode('break'); setSecondsLeft(5 * 60); setIsActive(false); }}
          >
            5 Min Short Break
          </Button>
        </div>

        <div className="py-6">
          <span className="text-6xl font-mono font-extrabold tracking-tight text-white">
            {formatTime(secondsLeft)}
          </span>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button onClick={toggleTimer} variant="apple" size="lg" className="w-14 h-14 rounded-full p-0">
            {isActive ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
          </Button>
          <Button onClick={resetTimer} variant="outline" size="lg" className="w-12 h-12 rounded-full p-0">
            <RotateCcw size={18} />
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
        <Card className="p-4 flex items-center gap-3">
          <Award className="text-amber-400 shrink-0" size={24} />
          <div>
            <p className="text-xs text-zinc-400">Focus Today</p>
            <p className="text-lg font-bold text-white">{focusMinutesToday} Mins</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <ShieldCheck className="text-emerald-400 shrink-0" size={24} />
          <div>
            <p className="text-xs text-zinc-400">Distraction Shield</p>
            <p className="text-lg font-bold text-emerald-400">Active</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
