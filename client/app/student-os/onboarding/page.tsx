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
        <Badge className="gap-1 px-3 py-1 bg-blue-50 text-blue-700 border-blue-200 text-xs font-semibold">
          <Sparkles size={13} className="text-blue-600" /> AI Career Profiler
        </Badge>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">StudentOS Skill Profiler</h1>
        <p className="text-xs text-slate-500">Configure career targets and commitment hours for custom roadmap synthesis.</p>
      </div>

      <Card className="p-8 space-y-6 bg-white border-slate-200 rounded-3xl shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Target Career Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="Full Stack Software Engineer">Full Stack Software Engineer</option>
              <option value="AI / Machine Learning Engineer">AI / Machine Learning Engineer</option>
              <option value="Backend Systems Engineer">Backend Systems Engineer</option>
              <option value="DevOps & Cloud Architect">DevOps & Cloud Architect</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Technical Experience Level</label>
            <div className="grid grid-cols-3 gap-3">
              {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevel(lvl)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    level === lvl
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Weekly Hours Commitment</label>
            <input
              type="range"
              min="5"
              max="40"
              value={goalHours}
              onChange={(e) => setGoalHours(e.target.value)}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
              <span>5 hrs/wk</span>
              <span className="font-bold text-blue-600">{goalHours} Hours / Week</span>
              <span>40 hrs/wk</span>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs">
            <Brain size={18} /> Generate Custom AI Roadmap
          </Button>
        </form>
      </Card>
    </div>
  );
}
