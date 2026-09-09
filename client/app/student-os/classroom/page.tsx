'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, ExternalLink, Clock, Users, RefreshCw } from 'lucide-react';
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="text-blue-600" /> Google Classroom Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">Enrolled course streams and upcoming assignment alerts from Google Classroom.</p>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchCourses} disabled={loading} className="text-slate-600 hover:text-slate-900">
          <RefreshCw size={16} className={loading ? 'animate-spin text-blue-600' : ''} />
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-48 rounded-3xl animate-pulse bg-slate-200/70" />)}
        </div>
      ) : courses.length === 0 ? (
        <div className="p-12 text-center space-y-3 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <BookOpen size={40} className="text-blue-600/60 mx-auto" />
          <p className="text-slate-900 font-semibold text-sm">No active Google Classroom courses found.</p>
          <p className="text-slate-500 text-xs">Make sure Google Workspace is connected and you are enrolled in courses.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course.id} className="p-6 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all shadow-xs">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">ENROLLED</Badge>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Users size={12} className="text-blue-600" />
                    {course.totalStudents !== undefined ? course.totalStudents : '—'}
                    <span className="text-slate-400 text-[10px]">students</span>
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-900 leading-snug">{course.name}</h2>
                {course.section && <p className="text-xs text-slate-500">{course.section}</p>}
                {course.description && (
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{course.description}</p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-2 text-xs text-blue-900 bg-blue-50 p-2.5 rounded-xl border border-blue-100">
                  <Clock size={14} className="shrink-0 text-blue-600" />
                  <span>Check Google Classroom for upcoming assignments and announcements</span>
                </div>
                <Button
                  className="w-full text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                  onClick={() => openStream(course)}
                  disabled={!course.alternateLink}
                >
                  Open Stream <ExternalLink size={12} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}