'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, ExternalLink, Clock, Users, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import studentOSApi from '@/lib/studentOSApi';

const DEFAULT_COURSES = [
  { id: 'c-1', name: 'CS 401: Distributed Operating Systems', instructor: 'Dr. Evelyn Vance', students: 48, assignment: 'Paxos Consensus Paper due in 2 days' },
  { id: 'c-2', name: 'CS 450: Machine Learning & Deep Nets', instructor: 'Prof. Marcus Chen', students: 62, assignment: 'PyTorch Transformer Optimization Notebook' },
  { id: 'c-3', name: 'CS 320: Algorithms & Complexity', instructor: 'Dr. Sarah Jenkins', students: 55, assignment: 'Dynamic Programming Problem Set 4' },
];

export default function ClassroomPage() {
  const [courses, setCourses] = useState(DEFAULT_COURSES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    studentOSApi.getCourses()
      .then((data) => {
        if (data?.courses && Array.isArray(data.courses) && data.courses.length > 0) {
          setCourses(data.courses.map((c: any) => ({
            id: c.id || c._id,
            name: c.name || c.title,
            instructor: c.section || c.owner || 'Faculty Instructor',
            students: c.studentCount || 30,
            assignment: c.upcomingAssignment || 'No pending assignments',
          })));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="text-blue-400" /> Google Classroom Hub
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Enrolled course streams and upcoming assignment alerts.</p>
        </div>
        {loading && <RefreshCw size={16} className="animate-spin text-blue-400" />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="p-6 flex flex-col justify-between hover:border-blue-500/50">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="apple" className="text-[10px]">ENROLLED</Badge>
                <span className="text-xs text-zinc-400 flex items-center gap-1">
                  <Users size={12} /> {course.students}
                </span>
              </div>
              <h2 className="text-base font-bold text-white leading-snug">{course.name}</h2>
              <p className="text-xs text-zinc-400">{course.instructor}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800/80 space-y-3">
              <div className="flex items-start gap-2 text-xs text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                <Clock size={14} className="shrink-0 mt-0.5" />
                <span>{course.assignment}</span>
              </div>
              <Button variant="secondary" className="w-full text-xs gap-1.5" onClick={() => alert(`Opening stream for ${course.name}`)}>
                Open Stream <ExternalLink size={12} />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

