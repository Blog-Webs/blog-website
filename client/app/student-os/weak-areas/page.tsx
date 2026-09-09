'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Sparkles, ArrowRight, RefreshCw, CheckCircle2, BookOpen, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRoadmap, WeakArea } from '@/context/RoadmapContext';
import api from '@/lib/api';

const SEVERITY_CONFIG = {
  high: { label: 'Critical', color: 'text-red-700', bg: 'bg-red-50/50 border-red-200', dot: 'bg-red-500' },
  medium: { label: 'Moderate', color: 'text-amber-700', bg: 'bg-amber-50/50 border-amber-200', dot: 'bg-amber-500' },
  low: { label: 'Minor', color: 'text-emerald-700', bg: 'bg-emerald-50/50 border-emerald-200', dot: 'bg-emerald-500' },
};

export default function WeakAreasPage() {
  const { weakAreas, setWeakAreas, milestones, targetRole, assessmentHistory } = useRoadmap();
  const [analyzing, setAnalyzing] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const activePhase = milestones.find(m => m.status === 'in_progress');

  const analyzeProfile = async () => {
    setAnalyzing(true);
    try {
      const res = await api.post('/student-os/ai/weak-areas', {
        assessmentResults: assessmentHistory,
        roadmapPhase: activePhase?.title || 'Foundations',
        targetRole,
      });
      setWeakAreas(res.data?.weakAreas || []);
    } catch {
      // Fallback
      setWeakAreas([
        {
          area: 'Dynamic Programming',
          severity: 'high',
          description: 'DP problems remain challenging — state transitions and memoization need reinforcement.',
          studySteps: ['Review Fibonacci with memoization', 'Solve 10 LeetCode DP problems (Easy → Medium)', 'Study 0/1 Knapsack problem pattern'],
          resources: ['NeetCode DP playlist', 'LeetCode DP Study Plan'],
          estimatedDays: 14,
        },
        {
          area: 'Database Indexing',
          severity: 'medium',
          description: 'SQL query optimization and B-Tree index structures need more practice.',
          studySteps: ['Read about B-Tree vs Hash indexes', 'Practice EXPLAIN ANALYZE in PostgreSQL', 'Write 5 optimized SQL queries'],
          resources: ['CMU Database Course', 'Use The Index Luke'],
          estimatedDays: 7,
        },
        {
          area: 'System Design — Load Balancing',
          severity: 'medium',
          description: 'Understanding how to distribute traffic across servers and handle failover.',
          studySteps: ['Study Round-robin vs Least Connections', 'Design a rate limiter system', 'Read about Nginx load balancing config'],
          resources: ['System Design Primer (GitHub)', 'Gaurav Sen YouTube'],
          estimatedDays: 5,
        },
      ]);
    }
    setAnalyzing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="text-amber-500" /> Weak Area Diagnostics
          </h1>
          <p className="text-xs text-slate-500 mt-1">AI analysis of your profile and assessment history to identify and plan improvement areas.</p>
        </div>
        <Button
          onClick={analyzeProfile}
          disabled={analyzing}
          className="gap-2 self-start bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
        >
          {analyzing ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {analyzing ? 'Analyzing Profile...' : weakAreas.length > 0 ? 'Re-analyze Profile' : 'Analyze My Profile'}
        </Button>
      </div>

      {/* Context Summary */}
      {(activePhase || assessmentHistory.length > 0) && (
        <Card className="p-4 flex flex-col sm:flex-row gap-4 bg-white border-slate-200 rounded-3xl shadow-xs">
          {activePhase && (
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <BookOpen size={16} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Active Phase</p>
                <p className="text-xs text-slate-800 font-bold">{activePhase.title}</p>
              </div>
            </div>
          )}
          {assessmentHistory.length > 0 && (
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Recent Assessments</p>
                <p className="text-xs text-slate-800 font-bold">
                  {assessmentHistory.slice(0, 2).map(a => `${a.topic}: ${a.score}/${a.total}`).join(' · ')}
                </p>
              </div>
            </div>
          )}
        </Card>
      )}

      {weakAreas.length === 0 ? (
        <Card className="p-12 text-center space-y-4 bg-white border-slate-200 rounded-3xl shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-lg font-bold text-slate-900">No Weak Areas Identified Yet</h2>
          <p className="text-slate-500 text-xs max-w-md mx-auto leading-relaxed">
            {assessmentHistory.length === 0
              ? 'Complete at least one Skill Assessment first, then click "Analyze My Profile" for personalized weak area detection.'
              : 'Click "Analyze My Profile" to generate an AI-powered weak area analysis based on your assessment history and roadmap phase.'
            }
          </p>
          {assessmentHistory.length === 0 && (
            <Link href="/student-os/assessment">
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs">
                <Sparkles size={14} /> Take Skill Assessment
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {weakAreas.map((area, idx) => {
            const config = SEVERITY_CONFIG[area.severity] || SEVERITY_CONFIG.medium;
            const isExpanded = expandedIdx === idx;

            return (
              <Card
                key={idx}
                className={`p-6 border transition-all cursor-pointer rounded-3xl bg-white shadow-xs hover:shadow-md ${config.bg} ${isExpanded ? 'ring-2 ring-blue-500/20' : ''}`}
                onClick={() => setExpandedIdx(isExpanded ? null : idx)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${config.dot}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-slate-900">{area.area}</h2>
                        <Badge className={`text-[10px] py-0.5 border ${config.color} bg-white font-bold`}>{config.label}</Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{area.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium"><Clock size={11} /> {area.estimatedDays}d</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-200 space-y-4" onClick={e => e.stopPropagation()}>
                    <div>
                      <p className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider">Study Steps</p>
                      <ol className="space-y-2">
                        {area.studySteps.map((step, si) => (
                          <li key={si} className="flex items-start gap-2 text-xs text-slate-700">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{si + 1}</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>

                    {area.resources && area.resources.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider">Recommended Resources</p>
                        <div className="flex flex-wrap gap-2">
                          {area.resources.map((r, ri) => (
                            <span key={ri} className="text-xs px-2.5 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200 font-medium">{r}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Link href="/student-os/ai">
                        <Button size="sm" className="gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs">
                          Ask AI Tutor <ArrowRight size={12} />
                        </Button>
                      </Link>
                      <Link href="/student-os/coding">
                        <Button variant="outline" size="sm" className="gap-1 text-xs bg-white border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl">
                          Practice in Workbench
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}