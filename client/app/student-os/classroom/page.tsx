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
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight flex items-center gap-2">
            <BookOpen className="text-blue-600" size={20} /> Google Classroom Hub
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Enrolled course streams and upcoming assignment alerts from Google Classroom.</p>
        </div>
        <button 
          onClick={fetchCourses} 
          disabled={loading} 
          className="p-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 text-xs transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-blue-600' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-44 rounded-lg animate-pulse bg-gray-100 border border-gray-200" />)}
        </div>
      ) : courses.length === 0 ? (
        <div className="p-12 text-center space-y-3 bg-white rounded-lg border border-gray-200 shadow-xs">
          <BookOpen size={32} className="text-gray-400 mx-auto" />
          <p className="text-gray-900 font-medium text-xs">No active Google Classroom courses found.</p>
          <p className="text-gray-500 text-[11px]">Make sure Google Workspace is connected and you are enrolled in courses.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {courses.map(course => (
            <div key={course.id} className="p-5 rounded-lg bg-white border border-gray-200 flex flex-col justify-between hover:border-gray-300 transition-all shadow-xs">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 font-semibold uppercase">Enrolled</span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Users size={12} className="text-blue-600" />
                    <span className="font-mono text-gray-700">{course.totalStudents !== undefined ? course.totalStudents : '—'}</span>
                    <span className="text-gray-400 text-[10px]">students</span>
                  </span>
                </div>
                <h2 className="text-sm font-semibold text-gray-900 leading-snug">{course.name}</h2>
                {course.section && <p className="text-xs text-gray-500 font-mono">{course.section}</p>}
                {course.description && (
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{course.description}</p>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 space-y-2.5">
                <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-md border border-gray-200">
                  <Clock size={13} className="shrink-0 text-blue-600" />
                  <span className="text-[11px] truncate">Assignments & announcements synced</span>
                </div>
                <button
                  className="w-full flex items-center justify-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 px-3.5 py-1.5 rounded-md text-xs font-medium shadow-xs transition-colors disabled:opacity-50"
                  onClick={() => openStream(course)}
                  disabled={!course.alternateLink}
                >
                  <span>Open Stream</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}