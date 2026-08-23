import { useState, useEffect, useCallback } from 'react';
import {
  Users, Search, RefreshCw, GraduationCap, MapPin, Phone,
  ExternalLink, Mail, Award, BookOpen, User, Eye, X, Globe, Link2, Code2
} from 'lucide-react';
import { adminApi } from '../api/admin';

export default function AdminStudentOSUsers() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [stats, setStats] = useState({ total: 0, withAcademic: 0 });

  const fetchStudents = useCallback(async (q = '') => {
    setLoading(true);
    try {
      const { data } = await adminApi.getStudentOSUsers({ q });
      const list = data?.students || [];
      setStudents(list);
      setStats({
        total: data?.total || list.length,
        withAcademic: list.filter(s => s.academic && s.academic.collegeName).length,
      });
    } catch (err) {
      console.error('Failed to load student profiles:', err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents(search);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Users className="text-blue-400" /> StudentOS Registered Students
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Admin oversight of registered StudentOS learners, academic credentials, and career goals.
          </p>
        </div>

        <button
          onClick={() => fetchStudents(search)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition-all self-start"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800/80 shadow-md flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs text-zinc-400">Total Registered Students</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800/80 shadow-md flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <GraduationCap size={22} />
          </div>
          <div>
            <p className="text-xs text-zinc-400">Profiles with College Data</p>
            <p className="text-2xl font-bold text-white">{stats.withAcademic}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800/80 shadow-md flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
            <Award size={22} />
          </div>
          <div>
            <p className="text-xs text-zinc-400">Active AI Personas</p>
            <p className="text-2xl font-bold text-white">{students.length}</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, email, or college..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-colors"
        >
          Search
        </button>
      </form>

      {/* Students Table */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-zinc-500 text-xs animate-pulse">
            Loading StudentOS user directory...
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs">
            No students found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900/60 border-b border-zinc-800 text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">College & Degree</th>
                  <th className="py-3 px-4">Year & CGPA</th>
                  <th className="py-3 px-4">Area of Interest</th>
                  <th className="py-3 px-4">Target Track</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {students.map((student) => {
                  const acad = student.academic || {};
                  return (
                    <tr key={student.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {student.avatar ? (
                            <img
                              src={student.avatar}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover border border-zinc-700 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-500/30">
                              {student.name ? student.name.slice(0, 2).toUpperCase() : 'ST'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate">{student.name}</p>
                            <p className="text-[11px] text-zinc-400 truncate">{student.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-medium text-white truncate max-w-[200px]">
                          {acad.collegeName || '—'}
                        </p>
                        <p className="text-[11px] text-zinc-400">
                          {acad.degree} {acad.branch ? `· ${acad.branch}` : ''}
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-zinc-200">
                          Year {acad.yearOfStudy || 1} (Sem {acad.semester || 1})
                        </span>
                        {acad.percentageOrCgpa && (
                          <p className="text-[11px] text-emerald-400 font-semibold">
                            {acad.percentageOrCgpa}
                          </p>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {acad.areaOfInterest ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30 font-medium">
                            {acad.areaOfInterest}
                          </span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-zinc-300 font-medium truncate">
                          {acad.careerGoalLabel || acad.careerGoal || 'Software Engineer'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-medium transition-colors inline-flex items-center gap-1"
                        >
                          <Eye size={12} /> Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Student Profile Details Modal ── */}
      {selectedStudent && (() => {
        const acad = selectedStudent.academic || {};
        return (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex items-start justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  {selectedStudent.avatar ? (
                    <img
                      src={selectedStudent.avatar}
                      alt=""
                      className="w-14 h-14 rounded-full object-cover border-2 border-blue-500 shadow-md"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-blue-600 text-white font-bold text-lg flex items-center justify-center">
                      {selectedStudent.name ? selectedStudent.name.slice(0, 2).toUpperCase() : 'ST'}
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-bold text-white">{selectedStudent.name}</h2>
                    <p className="text-xs text-zinc-400">{selectedStudent.email}</p>
                    {acad.location && (
                      <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={11} /> {acad.location}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Academic Credentials */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap size={14} className="text-blue-400" /> Academic Information
                </p>
                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs">
                  <div>
                    <span className="text-zinc-500 block">Institution / College</span>
                    <span className="font-semibold text-white">{acad.collegeName || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Degree & Branch</span>
                    <span className="font-semibold text-white">
                      {acad.degree || 'B.Tech'} {acad.branch ? `(${acad.branch})` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Year & Semester</span>
                    <span className="font-semibold text-white">
                      Year {acad.yearOfStudy || 1} · Semester {acad.semester || 1}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">CGPA / Percentage</span>
                    <span className="font-semibold text-emerald-400">{acad.percentageOrCgpa || '—'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Area of Interest</span>
                    <span className="font-semibold text-blue-300">{acad.areaOfInterest || '—'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Target Graduation</span>
                    <span className="font-semibold text-white">{acad.targetGraduationYear || 2026}</span>
                  </div>
                </div>
              </div>

              {/* Contact & Portfolios */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone size={14} className="text-emerald-400" /> Contact & Portfolios
                </p>
                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs">
                  <div>
                    <span className="text-zinc-500 block">Phone</span>
                    <span className="font-semibold text-white">{acad.phone || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Campus Address</span>
                    <span className="font-semibold text-white">{acad.address || '—'}</span>
                  </div>
                  {acad.linkedInUrl && (
                    <div>
                      <span className="text-zinc-500 block">LinkedIn</span>
                      <a href={acad.linkedInUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">
                        <Link2 size={11} /> Profile <ExternalLink size={10} />
                      </a>
                    </div>
                  )}
                  {acad.githubUrl && (
                    <div>
                      <span className="text-zinc-500 block">GitHub</span>
                      <a href={acad.githubUrl} target="_blank" rel="noreferrer" className="text-zinc-300 hover:underline flex items-center gap-1">
                        <Code2 size={11} /> Repositories <ExternalLink size={10} />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              {acad.bio && (
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs space-y-1">
                  <span className="text-zinc-500 font-bold uppercase text-[10px]">Candidate Bio / Statement</span>
                  <p className="text-zinc-300 leading-relaxed">{acad.bio}</p>
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-zinc-800">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}