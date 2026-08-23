'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Brain } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRoadmap } from '@/context/RoadmapContext';

export default function OnboardingPage() {
  const router = useRouter();
  const { setTargetRole } = useRoadmap();
  const [role, setRole] = useState('Full Stack Software Engineer');
  const [level, setLevel] = useState('Intermediate');
  const [goalHours, setGoalHours] = useState('15');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTargetRole(role);
    router.push('/student-os/roadmap');
  };

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-6">
      <div className="text-center space-y-2">
        <Badge variant="apple" className="gap-1 px-3 py-1">
          <Sparkles size={13} /> AI Career Profiler
        </Badge>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">StudentOS Skill Profiler</h1>
        <p className="text-xs text-zinc-400">Configure career targets and commitment hours for custom roadmap synthesis.</p>
      </div>

      <Card className="p-8 space-y-6 bg-zinc-950 border-zinc-800">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-2">Target Career Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="Full Stack Software Engineer">Full Stack Software Engineer</option>
              <option value="AI / Machine Learning Engineer">AI / Machine Learning Engineer</option>
              <option value="Backend Systems Engineer">Backend Systems Engineer</option>
              <option value="DevOps & Cloud Architect">DevOps & Cloud Architect</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-2">Technical Experience Level</label>
            <div className="grid grid-cols-3 gap-3">
              {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                <Button
                  key={lvl}
                  type="button"
                  variant={level === lvl ? 'apple' : 'secondary'}
                  onClick={() => setLevel(lvl)}
                  className="w-full text-xs"
                >
                  {lvl}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-2">Weekly Hours Commitment</label>
            <input
              type="range"
              min="5"
              max="40"
              value={goalHours}
              onChange={(e) => setGoalHours(e.target.value)}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-zinc-400 mt-2">
              <span>5 hrs/wk</span>
              <span className="font-bold text-blue-400">{goalHours} Hours / Week</span>
              <span>40 hrs/wk</span>
            </div>
          </div>

          <Button type="submit" variant="apple" size="lg" className="w-full gap-2">
            <Brain size={18} /> Generate Custom AI Roadmap
          </Button>
        </form>
      </Card>
    </div>
  );
}
