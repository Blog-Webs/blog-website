'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { RoadmapMilestone } from '@/types/studentos';
import api from '@/lib/api';

interface RoadmapContextType {
  milestones: RoadmapMilestone[];
  targetRole: string;
  setTargetRole: (role: string) => void;
  updateMilestoneStatus: (id: string, status: RoadmapMilestone['status']) => void;
  editMilestone: (id: string, changes: Partial<RoadmapMilestone>) => void;
  setMilestones: (milestones: RoadmapMilestone[]) => void;
  generateRoadmap: (profile: GenerateProfile) => Promise<void>;
  isGenerating: boolean;
  weakAreas: WeakArea[];
  setWeakAreas: (areas: WeakArea[]) => void;
  assessmentHistory: AssessmentResult[];
  addAssessmentResult: (result: AssessmentResult) => void;
}

export interface GenerateProfile {
  targetRole: string;
  experience?: string;
  hoursPerWeek?: number;
  techStack?: string;
  learningGoals?: string;
}

export interface WeakArea {
  area: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  studySteps: string[];
  resources: string[];
  estimatedDays: number;
}

export interface AssessmentResult {
  topic: string;
  score: number;
  total: number;
  date: string;
}

const DEFAULT_MILESTONES: RoadmapMilestone[] = [];

const RoadmapContext = createContext<RoadmapContextType>({
  milestones: [],
  targetRole: 'Full Stack Software Engineer',
  setTargetRole: () => {},
  updateMilestoneStatus: () => {},
  editMilestone: () => {},
  setMilestones: () => {},
  generateRoadmap: async () => {},
  isGenerating: false,
  weakAreas: [],
  setWeakAreas: () => {},
  assessmentHistory: [],
  addAssessmentResult: () => {},
});

export const RoadmapProvider = ({ children }: { children: React.ReactNode }) => {
  const [targetRole, setTargetRole] = useState('Full Stack Software Engineer');
  const [milestones, setMilestones] = useState<RoadmapMilestone[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [weakAreas, setWeakAreas] = useState<WeakArea[]>([]);
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentResult[]>([]);

  // Try to load from backend roadmap
  useEffect(() => {
    api.get('/roadmap')
      .then((res) => {
        if (res.data?.roadmap?.phases && Array.isArray(res.data.roadmap.phases)) {
          // Map backend phases to local milestone format
          const phases = res.data.roadmap.phases.map((p: any, idx: number) => ({
            id: p._id || `m-${idx + 1}`,
            title: p.title || p.name,
            description: p.description || '',
            status: p.status === 'completed' ? 'completed' : idx === 0 ? 'in_progress' : 'locked',
            estimatedWeeks: p.estimatedWeeks || p.durationWeeks || 4,
            skills: p.skills || p.topics?.map((t: any) => t.name || t) || [],
          }));
          setMilestones(phases);
        }
      })
      .catch(() => {});
  }, []);

  const updateMilestoneStatus = (id: string, status: RoadmapMilestone['status']) => {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, status } : m));
  };

  const editMilestone = (id: string, changes: Partial<RoadmapMilestone>) => {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, ...changes } : m));
  };

  const generateRoadmap = useCallback(async (profile: GenerateProfile) => {
    setIsGenerating(true);
    try {
      const res = await api.post('/student-os/ai/generate-roadmap', {
        targetRole: profile.targetRole,
        experience: profile.experience,
        hoursPerWeek: profile.hoursPerWeek,
        techStack: profile.techStack,
        learningGoals: profile.learningGoals,
      });

      if (res.data?.milestones && Array.isArray(res.data.milestones)) {
        // Ensure proper types
        const mapped: RoadmapMilestone[] = res.data.milestones.map((m: any, idx: number) => ({
          id: m.id || `m-${idx + 1}`,
          title: m.title,
          description: m.description,
          status: m.status || (idx === 0 ? 'in_progress' : 'locked'),
          estimatedWeeks: m.estimatedWeeks || 4,
          skills: Array.isArray(m.skills) ? m.skills : [],
        }));
        setMilestones(mapped);
        setTargetRole(profile.targetRole);
      }
    } catch (err) {
      console.error('[generateRoadmap error]', err);
      // Fallback with a default structure
      setMilestones([
        {
          id: 'm-1',
          title: `Phase 1: Foundations for ${profile.targetRole}`,
          description: `Build core skills needed for ${profile.targetRole}. Focus on fundamentals, core language proficiency, and foundational algorithms.`,
          status: 'in_progress',
          estimatedWeeks: 4,
          skills: ['Core Language', 'Data Structures', 'Algorithms', 'Version Control'],
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const addAssessmentResult = (result: AssessmentResult) => {
    setAssessmentHistory(prev => [result, ...prev.slice(0, 9)]);
  };

  return (
    <RoadmapContext.Provider
      value={{
        milestones,
        targetRole,
        setTargetRole,
        updateMilestoneStatus,
        editMilestone,
        setMilestones,
        generateRoadmap,
        isGenerating,
        weakAreas,
        setWeakAreas,
        assessmentHistory,
        addAssessmentResult,
      }}
    >
      {children}
    </RoadmapContext.Provider>
  );
};

export const useRoadmap = () => useContext(RoadmapContext);