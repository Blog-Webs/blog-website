'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, CheckCircle2, Lock, Clock, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRoadmap } from '@/context/RoadmapContext';

export default function RoadmapPage() {
  const { milestones, targetRole, updateMilestoneStatus } = useRoadmap();

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <Badge variant="apple" className="gap-1 px-3 py-1 mb-2">
            <Sparkles size={13} /> AI Tailored Pathway
          </Badge>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Career Learning Roadmap</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Target Track: <strong className="text-zinc-200 font-semibold">{targetRole}</strong>
          </p>
        </div>
        <Link href="/student-os/onboarding">
          <Button variant="secondary" size="sm">Re-run AI Profiler</Button>
        </Link>
      </div>

      <div className="space-y-6 relative before:absolute before:inset-0 before:left-6 before:w-0.5 before:bg-zinc-800">
        {milestones.map((m, idx) => (
          <div key={m.id} className="relative pl-14 group">
            <div className={`absolute left-3 top-6 -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
              m.status === 'completed'
                ? 'bg-emerald-500 border-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/40'
                : m.status === 'in_progress'
                ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/40 animate-pulse'
                : 'bg-zinc-900 border-zinc-700 text-zinc-500'
            }`}>
              {m.status === 'completed' && <CheckCircle2 size={16} />}
              {m.status === 'in_progress' && <span className="text-xs font-bold">{idx + 1}</span>}
              {m.status === 'locked' && <Lock size={12} />}
            </div>

            <Card className={`p-6 transition-all ${
              m.status === 'in_progress' ? 'border-blue-500/50 bg-blue-950/20' : ''
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <Badge variant={m.status === 'completed' ? 'success' : m.status === 'in_progress' ? 'apple' : 'secondary'} className="uppercase">
                  {m.status.replace('_', ' ')}
                </Badge>
                <span className="text-xs text-zinc-400 flex items-center gap-1">
                  <Clock size={12} /> {m.estimatedWeeks} Weeks Estimated
                </span>
              </div>

              <h2 className="text-lg font-bold text-white mb-1">{m.title}</h2>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">{m.description}</p>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-800/60">
                {m.skills.map((skill) => (
                  <Badge key={skill} variant="outline" className="text-[10px]">
                    {skill}
                  </Badge>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                {m.status === 'in_progress' && (
                  <Button variant="apple" size="sm" className="gap-1 text-xs" onClick={() => updateMilestoneStatus(m.id, 'completed')}>
                    <CheckCircle2 size={14} /> Mark Completed
                  </Button>
                )}
                {m.status === 'locked' && (
                  <Button variant="secondary" size="sm" className="text-xs" onClick={() => updateMilestoneStatus(m.id, 'in_progress')}>
                    Unlock Phase
                  </Button>
                )}
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
