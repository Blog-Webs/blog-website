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
    <div className="max-w-xl mx-auto py-10 space-y-6">
      <div className="text-center space-y-1.5">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center justify-center gap-2">
          <Sparkles size={20} className="text-blue-600" /> StudentOS Skill Profiler
        </h1>
        <p className="text-xs text-gray-500">Configure career targets and commitment hours for custom roadmap synthesis.</p>
      </div>

      <div className="p-6 space-y-5 bg-white border border-gray-200 rounded-lg shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">Target Career Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-9 px-3 rounded-md bg-white border border-gray-300 text-gray-900 text-xs focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="Full Stack Software Engineer">Full Stack Software Engineer</option>
              <option value="AI / Machine Learning Engineer">AI / Machine Learning Engineer</option>
              <option value="Backend Systems Engineer">Backend Systems Engineer</option>
              <option value="DevOps & Cloud Architect">DevOps & Cloud Architect</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">Technical Experience Level</label>
            <div className="grid grid-cols-3 gap-2">
              {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevel(lvl)}
                  className={`w-full py-2 rounded-md text-xs font-medium border transition-colors ${
                    level === lvl
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">Weekly Hours Commitment</label>
            <input
              type="range"
              min="5"
              max="40"
              value={goalHours}
              onChange={(e) => setGoalHours(e.target.value)}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1.5 font-mono">
              <span>5 hrs/wk</span>
              <span className="font-bold text-blue-600">{goalHours} Hours / Week</span>
              <span>40 hrs/wk</span>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-xs font-medium shadow-xs transition-colors"
          >
            <Brain size={15} />
            <span>Generate Custom AI Roadmap</span>
          </button>
        </form>
      </div>
    </div>
  );
}
