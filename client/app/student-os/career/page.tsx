'use client';

import React from 'react';
import { TrendingUp, Briefcase, DollarSign, Award } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useRoadmap } from '@/context/RoadmapContext';

export default function CareerDashboard() {
  const { targetRole } = useRoadmap();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <TrendingUp className="text-blue-400" /> Career Market Hub
        </h1>
        <p className="text-xs text-zinc-400 mt-1">Real-time skill match metrics for <strong className="text-zinc-200">{targetRole}</strong>.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4 p-5">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
            <Award size={22} />
          </div>
          <div>
            <p className="text-xs text-zinc-400">Skill Match Score</p>
            <p className="text-2xl font-bold text-white">78%</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <Briefcase size={22} />
          </div>
          <div>
            <p className="text-xs text-zinc-400">Open Opportunities</p>
            <p className="text-2xl font-bold text-white">12,450+</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
            <DollarSign size={22} />
          </div>
          <div>
            <p className="text-xs text-zinc-400">Avg. Salary Baseline</p>
            <p className="text-2xl font-bold text-white">$125,000 / yr</p>
          </div>
        </Card>
      </div>

      <Card className="p-6 space-y-4">
        <CardTitle className="text-base">Industry Skill Demand Matrix</CardTitle>
        <div className="space-y-4 pt-2">
          {[
            { skill: 'React 19 & Next.js App Router Architecture', match: 95 },
            { skill: 'Node.js, Express & Distributed Systems', match: 85 },
            { skill: 'State Machine Replication & Caching (Redis/Kafka)', match: 60 },
            { skill: 'Docker Containerization & Kubernetes Pipelines', match: 45 },
          ].map((item) => (
            <div key={item.skill} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-zinc-200">{item.skill}</span>
                <span className="text-blue-400 font-bold">{item.match}% Match</span>
              </div>
              <Progress value={item.match} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
