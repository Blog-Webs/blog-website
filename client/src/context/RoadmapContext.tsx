'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { RoadmapMilestone } from '@/types/studentos';
import api from '@/lib/api';

interface RoadmapContextType {
  milestones: RoadmapMilestone[];
  targetRole: string;
  setTargetRole: (role: string) => void;
  updateMilestoneStatus: (id: string, status: RoadmapMilestone['status']) => void;
  weakAreas: string[];
}

const RoadmapContext = createContext<RoadmapContextType>({
  milestones: [],
  targetRole: 'Full Stack Software Engineer',
  setTargetRole: () => {},
  updateMilestoneStatus: () => {},
  weakAreas: [],
});

export const RoadmapProvider = ({ children }: { children: React.ReactNode }) => {
  const [targetRole, setTargetRole] = useState('Full Stack Software Engineer');
  const [weakAreas] = useState([
    'Dynamic Programming (DP state transitions)',
    'Database Query Indexing & B-Tree Optimization',
    'Docker Container Isolation & Networking',
  ]);

  const [milestones, setMilestones] = useState<RoadmapMilestone[]>([
    {
      id: 'm-1',
      title: 'Phase 1: Advanced Algorithms & System Foundations',
      description: 'Master graphs, heaps, dynamic programming, memory bounds, and algorithmic complexity.',
      status: 'completed',
      estimatedWeeks: 4,
      skills: ['Graphs', 'DP', 'Tries', 'Big-O Analysis'],
    },
    {
      id: 'm-2',
      title: 'Phase 2: Next.js App Router & Modern Apple UI Engineering',
      description: 'Architect server-rendered React 19 App Router applications with shadcn/ui components.',
      status: 'in_progress',
      estimatedWeeks: 3,
      skills: ['Next.js App Router', 'TypeScript', 'Tailwind CSS', 'shadcn/ui'],
    },
    {
      id: 'm-3',
      title: 'Phase 3: High-Performance Backend & Microservices',
      description: 'Build REST APIs, WebSockets, Redis caching, and MongoDB schemas in Node.js.',
      status: 'locked',
      estimatedWeeks: 4,
      skills: ['Express.js', 'MongoDB', 'Redis', 'WebSockets'],
    },
    {
      id: 'm-4',
      title: 'Phase 4: Cloud Infrastructure & CI/CD Pipelines',
      description: 'Deploy microservices with Docker containers, AWS S3, and automated GitHub Actions.',
      status: 'locked',
      estimatedWeeks: 3,
      skills: ['Docker', 'AWS', 'GitHub Actions', 'Vercel'],
    },
  ]);

  useEffect(() => {
    api.get('/roadmap')
      .then((res) => {
        if (res.data?.roadmap?.phases) {
          // Sync backend data if available
        }
      })
      .catch(() => {});
  }, []);

  const updateMilestoneStatus = (id: string, status: RoadmapMilestone['status']) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status } : m))
    );
  };

  return (
    <RoadmapContext.Provider
      value={{
        milestones,
        targetRole,
        setTargetRole,
        updateMilestoneStatus,
        weakAreas,
      }}
    >
      {children}
    </RoadmapContext.Provider>
  );
};

export const useRoadmap = () => useContext(RoadmapContext);
