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
  high: { label: 'Critical', color: 'text-red-700', bg: 'bg-white border-red-200', dot: 'bg-red-500' },
  medium: { label: 'Moderate', color: 'text-amber-700', bg: 'bg-white border-amber-200', dot: 'bg-amber-500' },
  low: { label: 'Minor', color: 'text-emerald-700', bg: 'bg-white border-emerald-200', dot: 'bg-emerald-500' },
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
    <div className="max-w-4xl mx-auto space-y-5 py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="text-amber-500" size={20} /> Weak Area Diagnostics
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">AI analysis of your profile and assessment history to identify and plan improvement areas.</p>
        </div>
        <button
          onClick={analyzeProfile}
          disabled={analyzing}
          className="flex items-center gap-1.5 self-start bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-md text-xs font-medium shadow-xs transition-colors"
        >
          {analyzing ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
          <span>{analyzing ? 'Analyzing Profile...' : weakAreas.length > 0 ? 'Re-analyze Profile' : 'Analyze My Profile'}</span>
        </button>
      </div>

      {/* Context Summary */}
      {(activePhase || assessmentHistory.length > 0) && (
        <div className="p-3.5 flex flex-col sm:flex-row gap-4 bg-white border border-gray-200 rounded-lg shadow-xs">
          {activePhase && (
            <div className="flex items-center gap-2.5 flex-1">
              <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <BookOpen size={14} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-semibold">Active Phase</p>
                <p className="text-xs text-gray-800 font-semibold">{activePhase.title}</p>
              </div>
            </div>
          )}
          {assessmentHistory.length > 0 && (
            <div className="flex items-center gap-2.5 flex-1">
              <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                <CheckCircle2 size={14} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-semibold">Recent Assessments</p>
                <p className="text-xs text-gray-800 font-medium font-mono">
                  {assessmentHistory.slice(0, 2).map(a => `${a.topic}: ${a.score}/${a.total}`).join(' · ')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {weakAreas.length === 0 ? (
        <div className="p-12 text-center space-y-3 bg-white border border-gray-200 rounded-lg shadow-xs">
          <div className="w-12 h-12 rounded-md bg-amber-50 text-amber-500 flex items-center justify-center mx-auto border border-amber-100">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-xs font-semibold text-gray-900">No Weak Areas Identified Yet</h2>
          <p className="text-gray-500 text-[11px] max-w-md mx-auto leading-relaxed">
            {assessmentHistory.length === 0
              ? 'Complete at least one Skill Assessment first, then click "Analyze My Profile" for personalized weak area detection.'
              : 'Click "Analyze My Profile" to generate an AI-powered weak area analysis based on your assessment history and roadmap phase.'
            }
          </p>
          {assessmentHistory.length === 0 && (
            <Link href="/student-os/assessment">
              <button className="flex items-center gap-1.5 mx-auto bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-md text-xs font-medium shadow-xs transition-colors">
                <Sparkles size={13} />
                <span>Take Skill Assessment</span>
              </button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {weakAreas.map((area, idx) => {
            const config = SEVERITY_CONFIG[area.severity] || SEVERITY_CONFIG.medium;
            const isExpanded = expandedIdx === idx;

            return (
              <div
                key={idx}
                className={`p-4 border transition-colors cursor-pointer rounded-lg bg-white shadow-xs ${config.bg} ${isExpanded ? 'border-gray-400' : 'hover:border-gray-300'}`}
                onClick={() => setExpandedIdx(isExpanded ? null : idx)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${config.dot}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xs font-semibold text-gray-900">{area.area}</h2>
                        <span className={`text-[10px] font-mono px-2 py-0.2 rounded-md border ${config.color} bg-gray-50 font-medium`}>{config.label}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{area.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs text-gray-500 flex items-center gap-1 font-mono"><Clock size={11} /> {area.estimatedDays}d</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3.5 pt-3 border-t border-gray-100 space-y-3" onClick={e => e.stopPropagation()}>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Study Steps</p>
                      <ol className="space-y-1.5">
                        {area.studySteps.map((step, si) => (
                          <li key={si} className="flex items-start gap-2 text-xs text-gray-700">
                            <span className="w-4 h-4 rounded bg-gray-100 text-gray-700 flex items-center justify-center text-[10px] font-mono font-medium shrink-0 mt-0.5">{si + 1}</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {area.resources && area.resources.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Recommended Resources</p>
                        <div className="flex flex-wrap gap-1.5">
                          {area.resources.map((r, ri) => (
                            <span key={ri} className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-gray-50 text-gray-700 border border-gray-200 font-medium">{r}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      <Link href="/student-os/ai">
                        <button className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md font-medium shadow-xs transition-colors">
                          <span>Ask AI Tutor</span>
                          <ArrowRight size={11} />
                        </button>
                      </Link>
                      <Link href="/student-os/coding">
                        <button className="flex items-center gap-1 text-xs bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-md font-medium shadow-xs transition-colors">
                          Practice in Workbench
                        </button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}