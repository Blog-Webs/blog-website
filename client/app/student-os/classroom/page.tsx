'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, ExternalLink, Clock, Users, RefreshCw, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';

type Course = {
  id: string;
  name: string;
  section?: string;
  description?: string;
  alternateLink?: string;
  totalStudents?: number;
  courseState?: string;
};

export default function ClassroomPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/student-os/classroom/courses');
      setCourses(res.data?.courses || []);
    } catch { setCourses([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const openStream = (course: Course) => {
    if (course.alternateLink) {
      window.open(course.alternateLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="text-blue-400" /> Google Classroom Hub
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Enrolled course streams and upcoming assignment alerts from Google Classroom.</p>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchCourses} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <Card key={i} className="h-48 animate-pulse bg-zinc-900" />)}
        </div>
      ) : courses.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <BookOpen size={40} className="text-zinc-600 mx-auto" />
          <p className="text-zinc-400 text-sm">No active Google Classroom courses found.</p>
          <p className="text-zinc-600 text-xs">Make sure Google Workspace is connected and you are enrolled in courses.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map(course => (
            <Card key={course.id} className="p-6 flex flex-col justify-between hover:border-blue-500/50 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="apple" className="text-[10px]">ENROLLED</Badge>
                  <span className="text-xs text-zinc-400 flex items-center gap-1">
                    <Users size={12} />
                    {course.totalStudents !== undefined ? course.totalStudents : '—'}
                    <span className="text-zinc-600 text-[10px]">students</span>
                  </span>
                </div>
                <h2 className="text-base font-bold text-white leading-snug">{course.name}</h2>
                {course.section && <p className="text-xs text-zinc-400">{course.section}</p>}
                {course.description && (
                  <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">{course.description}</p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800/80 space-y-3">
                <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                  <Clock size={14} className="shrink-0" />
                  <span>Check Google Classroom for upcoming assignments and announcements</span>
                </div>
                <Button
                  variant="secondary"
                  className="w-full text-xs gap-1.5"
                  onClick={() => openStream(course)}
                  disabled={!course.alternateLink}
                >
                  Open Stream <ExternalLink size={12} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}