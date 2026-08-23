'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, Sparkles, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRoadmap } from '@/context/RoadmapContext';

export default function WeakAreasPage() {
  const { weakAreas } = useRoadmap();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="text-amber-400" /> Weak Area Diagnostics
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Concepts identified for practice based on assessment performance.</p>
        </div>
        <Link href="/student-os/coding">
          <Button variant="apple" size="sm" className="gap-2">
            <Sparkles size={14} /> Practice Weak Problems
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {weakAreas.map((area, idx) => (
          <Card key={idx} className="p-6 border-amber-500/20 bg-zinc-950 flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <h2 className="text-base font-bold text-white">{area}</h2>
              </div>
              <p className="text-xs text-zinc-400">
                Action: Solve 5 targeted problems in Coding Workbench or consult AI Academic Tutor.
              </p>
            </div>
            <Link href="/student-os/ai">
              <Button variant="outline" size="sm" className="gap-1 text-xs text-amber-300 border-amber-500/30">
                Ask AI <ArrowRight size={12} />
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
