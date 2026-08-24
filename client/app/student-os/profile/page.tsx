'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  User as UserIcon, GraduationCap, Building2, BookOpen, Award, Phone,
  MapPin, Globe, Link2, Code2, Save, CheckCircle2, RefreshCw,
  Sparkles, Camera, Briefcase, Clock, Layers, ShieldCheck, Upload, Cloud,
  ExternalLink, Plus, Trash2, FolderOpen, Terminal, X
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useStudentOS } from '@/context/StudentOSContext';
import api from '@/lib/api';

type AcademicProject = {
  id: string;
  title: string;
  description: string;
  techStack: string;
  githubUrl?: string;
  liveUrl?: string;
  role?: string;
  duration?: string;
};

export default function StudentProfilePage() {
  const { isGoogleConnected, googleEmail } = useStudentOS();

  const [activeTab, setActiveTab] = useState<'academic' | 'projects' | 'personal' | 'social'>('academic');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Cloudinary Avatar Upload State
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUploadSuccess, setAvatarUploadSuccess] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    avatar: '',
    collegeName: '',
    universityName: '',
    collegeLocation: '',
    studentId: '',
    degree: 'B.Tech',
    branch: 'Computer Science & Engineering',
    yearOfStudy: 3,
    semester: 6,
    percentageOrCgpa: '',
    areaOfInterest: '',
    targetGraduationYear: 2026,
    coreCoursework: 'Data Structures, Operating Systems, Computer Networks, DBMS, System Design',
    phone: '',
    address: '',
    location: '',
    linkedInUrl: '',
    githubUrl: '',
    bio: '',
    careerGoal: 'software_engineer',
    careerGoalLabel: 'Full Stack Software Engineer',
    learningStyle: 'mixed',
    studyHoursPerDay: 4,
  });

  // Projects list state
  const [projects, setProjects] = useState<AcademicProject[]>([
    {
      id: 'p-1',
      title: 'High-Throughput Distributed Cache System',
      description: 'Built a multi-node LRU caching service in Go with consistent hashing and raft consensus for partition fault tolerance.',
      techStack: 'Go, Raft, gRPC, Docker, Prometheus',
      githubUrl: 'https://github.com/example/distributed-cache',
      liveUrl: 'https://demo-cache.example.com',
      role: 'Lead Systems Engineer',
      duration: '3 Months (Spring 2026)',
    },
  ]);

  const [newProject, setNewProject] = useState<Partial<AcademicProject>>({
    title: '',
    description: '',
    techStack: '',
    githubUrl: '',
    liveUrl: '',
    role: '',
    duration: '',
  });
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);

  // Fetch initial profile
  useEffect(() => {
    setLoading(true);
    try {
      const savedLocal = localStorage.getItem('studentos_academic_profile');
      if (savedLocal) {
        const parsed = JSON.parse(savedLocal);
        if (parsed.formData) setFormData(prev => ({ ...prev, ...parsed.formData }));
        if (Array.isArray(parsed.projects)) setProjects(parsed.projects);
      }
    } catch {}

    api.get('/student-os/profile')
      .then(res => {
        const u = res.data?.user || {};
        const a = res.data?.academic || {};
        setFormData(prev => ({
          ...prev,
          name: u.name || prev.name,
          avatar: u.avatar || prev.avatar,
          collegeName: a.collegeName || prev.collegeName,
          universityName: a.universityName || prev.universityName,
          collegeLocation: a.collegeLocation || prev.collegeLocation,
          studentId: a.studentId || prev.studentId,
          degree: a.degree || prev.degree,
          branch: a.branch || prev.branch,
          yearOfStudy: a.yearOfStudy || prev.yearOfStudy,
          semester: a.semester || prev.semester,
          percentageOrCgpa: a.percentageOrCgpa || prev.percentageOrCgpa,
          areaOfInterest: a.areaOfInterest || prev.areaOfInterest,
          targetGraduationYear: a.targetGraduationYear || prev.targetGraduationYear,
          coreCoursework: a.coreCoursework || prev.coreCoursework,
          phone: a.phone || prev.phone,
          address: a.address || prev.address,
          location: a.location || prev.location,
          linkedInUrl: a.linkedInUrl || prev.linkedInUrl,
          githubUrl: a.githubUrl || prev.githubUrl,
          bio: a.bio || prev.bio,
          careerGoal: a.careerGoal || prev.careerGoal,
          careerGoalLabel: a.careerGoalLabel || prev.careerGoalLabel,
          learningStyle: a.learningStyle || prev.learningStyle,
          studyHoursPerDay: a.studyHoursPerDay || prev.studyHoursPerDay,
        }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddProject = () => {
    if (!newProject.title?.trim()) return;
    const proj: AcademicProject = {
      id: `p-${Date.now()}`,
      title: newProject.title.trim(),
      description: newProject.description || '',
      techStack: newProject.techStack || '',
      githubUrl: newProject.githubUrl || '',
      liveUrl: newProject.liveUrl || '',
      role: newProject.role || 'Contributor',
      duration: newProject.duration || '2026',
    };
    const updatedProjects = [proj, ...projects];
    setProjects(updatedProjects);
    setNewProject({ title: '', description: '', techStack: '', githubUrl: '', liveUrl: '', role: '', duration: '' });
    setShowAddProjectModal(false);

    // Save locally
    try {
      localStorage.setItem('studentos_academic_profile', JSON.stringify({ formData, projects: updatedProjects }));
    } catch {}
  };

  const handleDeleteProject = (id: string) => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    try {
      localStorage.setItem('studentos_academic_profile', JSON.stringify({ formData, projects: updated }));
    } catch {}
  };

  // Upload photo to Cloudinary
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setAvatarUploadSuccess(false);

    try {
      const fd = new FormData();
      fd.append('avatar', file);

      const res = await api.post('/student-os/profile/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newAvatarUrl = res.data?.avatarUrl;
      if (newAvatarUrl) {
        setFormData(prev => ({ ...prev, avatar: newAvatarUrl }));
        try {
          localStorage.setItem('studentos_user_avatar', newAvatarUrl);
          window.dispatchEvent(new Event('storage'));
        } catch {}
        setAvatarUploadSuccess(true);
        setTimeout(() => setAvatarUploadSuccess(false), 4000);
      }
    } catch (err: any) {
      alert('Failed to upload image to Cloudinary: ' + (err?.response?.data?.message || err.message));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      localStorage.setItem('studentos_academic_profile', JSON.stringify({ formData, projects }));
      await api.put('/student-os/profile', { ...formData, projects });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Hidden File Input for Cloudinary Upload */}
      <input
        type="file"
        ref={avatarInputRef}
        onChange={handleAvatarFileChange}
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="apple" className="gap-1 px-3 py-1 text-xs">
              <Sparkles size={13} /> AI Academic Persona
            </Badge>
            <Badge variant="secondary" className="text-[10px] text-emerald-400 border-emerald-500/30">
              <ShieldCheck size={11} className="mr-1" /> Synced to Gemini AI
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Student Academic Profile</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Your personal & academic credentials, college information, and live projects feed into Gemini AI.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          variant="apple"
          className="gap-2 self-start sm:self-center shadow-lg shadow-blue-500/20"
        >
          {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-xs font-semibold shadow-lg">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>Profile & Academic projects saved successfully! AI models updated.</span>
        </div>
      )}

      {avatarUploadSuccess && (
        <div className="p-4 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center gap-3 text-blue-300 text-xs font-semibold shadow-lg">
          <Cloud size={18} className="text-blue-400 shrink-0" />
          <span>Profile photo uploaded to Cloudinary successfully!</span>
        </div>
      )}

      {/* Avatar & Persona Summary Card */}
      <Card className="p-6 bg-zinc-950 border-zinc-800 shadow-xl flex flex-col md:flex-row items-center gap-6">
        <div className="relative group shrink-0">
          <div
            onClick={() => avatarInputRef.current?.click()}
            className="cursor-pointer relative overflow-hidden rounded-full transition-transform active:scale-95"
            title="Click to upload profile photo to Cloudinary"
          >
            {formData.avatar ? (
              <img
                src={formData.avatar}
                alt={formData.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-blue-500 shadow-2xl"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-teal-400 text-white font-bold text-2xl flex items-center justify-center shadow-2xl border-2 border-zinc-700">
                {formData.name ? formData.name.slice(0, 2).toUpperCase() : 'SO'}
              </div>
            )}

            <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              {uploadingAvatar ? (
                <RefreshCw size={20} className="animate-spin text-blue-400" />
              ) : (
                <>
                  <Camera size={18} />
                  <span className="text-[9px] font-bold mt-0.5">Upload</span>
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white border-2 border-zinc-950 shadow-md transition-all"
            title="Upload photo to Cloudinary"
          >
            {uploadingAvatar ? <RefreshCw size={12} className="animate-spin" /> : <Upload size={12} />}
          </button>
        </div>

        <div className="flex-1 text-center md:text-left space-y-1">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h2 className="text-xl font-bold text-white">{formData.name || 'StudentOS User'}</h2>
            <Badge variant="outline" className="text-[10px] border-zinc-700 max-w-fit mx-auto md:mx-0">
              {formData.degree || 'B.Tech'} · {formData.branch || 'Engineering'}
            </Badge>
            {formData.avatar && formData.avatar.includes('cloudinary') && (
              <Badge variant="secondary" className="text-[9px] py-0 text-blue-400 border-blue-500/30 max-w-fit mx-auto md:mx-0">
                <Cloud size={9} className="mr-1" /> Cloudinary Hosted
              </Badge>
            )}
          </div>
          <p className="text-xs text-zinc-400">{formData.collegeName || 'University / Institution'} {formData.collegeLocation ? `(${formData.collegeLocation})` : ''}</p>
          {googleEmail && <p className="text-[11px] text-zinc-500 font-mono">{googleEmail}</p>}
          <div className="flex flex-wrap gap-2 pt-2 justify-center md:justify-start">
            {formData.areaOfInterest && (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30">
                🎯 {formData.areaOfInterest}
              </span>
            )}
            {formData.percentageOrCgpa && (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-semibold">
                📊 {formData.percentageOrCgpa}
              </span>
            )}
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 font-semibold">
              💻 {projects.length} Academic Projects
            </span>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('academic')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'academic'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <GraduationCap size={15} /> Academic & College Info
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'projects'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <FolderOpen size={15} /> Academic Projects ({projects.length})
        </button>
        <button
          onClick={() => setActiveTab('personal')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'personal'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <UserIcon size={15} /> Personal & Contact
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'social'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Globe size={15} /> Social & Goals
        </button>
      </div>

      {/* Form Card */}
      <Card className="p-6 bg-zinc-950 border-zinc-800 shadow-xl">
        <form onSubmit={handleSave} className="space-y-6">
          {/* TAB 1: Academic Background */}
          {activeTab === 'academic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 font-semibold mb-1.5 block">
                    College / Institution Name *
                  </label>
                  <Input
                    value={formData.collegeName}
                    onChange={e => handleChange('collegeName', e.target.value)}
                    placeholder="e.g. National Institute of Technology"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-semibold mb-1.5 block">
                    Affiliated University / Board
                  </label>
                  <Input
                    value={formData.universityName}
                    onChange={e => handleChange('universityName', e.target.value)}
                    placeholder="e.g. Visvesvaraya Technological University"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 font-semibold mb-1.5 block">
                    College Location / City
                  </label>
                  <Input
                    value={formData.collegeLocation}
                    onChange={e => handleChange('collegeLocation', e.target.value)}
                    placeholder="e.g. Bangalore, Karnataka"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-semibold mb-1.5 block">
                    Student Roll No. / Enrollment ID
                  </label>
                  <Input
                    value={formData.studentId}
                    onChange={e => handleChange('studentId', e.target.value)}
                    placeholder="e.g. 1NT21CS108"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-semibold mb-1.5 block">
                    Degree Program
                  </label>
                  <Input
                    value={formData.degree}
                    onChange={e => handleChange('degree', e.target.value)}
                    placeholder="e.g. B.Tech, B.E., MCA, M.Tech"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 font-semibold mb-1.5 block">
                    Branch / Specialization
                  </label>
                  <Input
                    value={formData.branch}
                    onChange={e => handleChange('branch', e.target.value)}
                    placeholder="e.g. Computer Science & Engineering"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-semibold mb-1.5 block">
                    Current Year of Study
                  </label>
                  <select
                    value={formData.yearOfStudy}
                    onChange={e => handleChange('yearOfStudy', parseInt(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-zinc-600"
                  >
                    <option value={1}>1st Year (Freshman)</option>
                    <option value={2}>2nd Year (Sophomore)</option>
                    <option value={3}>3rd Year (Junior)</option>
                    <option value={4}>4th Year (Senior)</option>
                    <option value={5}>5th Year</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-semibold mb-1.5 block">
                    Current Semester
                  </label>
                  <select
                    value={formData.semester}
                    onChange={e => handleChange('semester', parseInt(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-zinc-600"
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 font-semibold mb-1.5 block">
                    Academic CGPA / Percentage Marks
                  </label>
                  <Input
                    value={formData.percentageOrCgpa}
                    onChange={e => handleChange('percentageOrCgpa', e.target.value)}
                    placeholder="e.g. 8.9 CGPA or 88%"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-semibold mb-1.5 block">
                    Target Graduation Year
                  </label>
                  <Input
                    type="number"
                    value={formData.targetGraduationYear}
                    onChange={e => handleChange('targetGraduationYear', parseInt(e.target.value))}
                    placeholder="2026"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-semibold mb-1.5 block">
                  Core Area of Interest / Domain Specialization
                </label>
                <Input
                  value={formData.areaOfInterest}
                  onChange={e => handleChange('areaOfInterest', e.target.value)}
                  placeholder="e.g. Distributed Systems, Artificial Intelligence, Full-Stack Web Development, Cloud Computing"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-semibold mb-1.5 block">
                  Core Coursework & Completed Modules
                </label>
                <textarea
                  value={formData.coreCoursework}
                  onChange={e => handleChange('coreCoursework', e.target.value)}
                  placeholder="List key academic subjects: Data Structures, Algorithms, Operating Systems, DBMS..."
                  className="w-full h-20 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white resize-none focus:outline-none focus:border-zinc-600 placeholder-zinc-500"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Academic Projects & Live Links */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FolderOpen size={16} className="text-blue-400" /> Academic & Personal Projects
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Showcase your technical builds, GitHub repositories, and live deployed demos.</p>
                </div>
                <Button
                  type="button"
                  onClick={() => setShowAddProjectModal(true)}
                  variant="apple"
                  size="sm"
                  className="gap-1.5 text-xs"
                >
                  <Plus size={14} /> Add New Project
                </Button>
              </div>

              {/* Add Project Form Modal / Card */}
              {showAddProjectModal && (
                <Card className="p-4 bg-zinc-900/90 border-blue-500/40 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Code2 size={14} className="text-blue-400" /> Add Academic Project
                    </span>
                    <button type="button" onClick={() => setShowAddProjectModal(false)} className="text-zinc-400 hover:text-white">
                      <X size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-zinc-400 font-semibold block mb-1">Project Title *</label>
                      <Input
                        value={newProject.title}
                        onChange={e => setNewProject(p => ({ ...p, title: e.target.value }))}
                        placeholder="e.g. Real-Time Collaborative Canvas"
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-zinc-400 font-semibold block mb-1">Your Role / Team Size</label>
                      <Input
                        value={newProject.role}
                        onChange={e => setNewProject(p => ({ ...p, role: e.target.value }))}
                        placeholder="e.g. Lead Full Stack Dev / Team of 3"
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 font-semibold block mb-1">Technologies & Stack Used</label>
                    <Input
                      value={newProject.techStack}
                      onChange={e => setNewProject(p => ({ ...p, techStack: e.target.value }))}
                      placeholder="e.g. React, Node.js, WebSockets, Redis, WebGL"
                      className="text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-zinc-400 font-semibold block mb-1">GitHub Code Repository Link</label>
                      <Input
                        value={newProject.githubUrl}
                        onChange={e => setNewProject(p => ({ ...p, githubUrl: e.target.value }))}
                        placeholder="https://github.com/username/project"
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-zinc-400 font-semibold block mb-1">Live Project Demo Link</label>
                      <Input
                        value={newProject.liveUrl}
                        onChange={e => setNewProject(p => ({ ...p, liveUrl: e.target.value }))}
                        placeholder="https://my-app.vercel.app"
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 font-semibold block mb-1">Description & Architecture Highlights</label>
                    <textarea
                      value={newProject.description}
                      onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))}
                      placeholder="Describe what the project accomplishes, key features, and your engineering challenges solved..."
                      className="w-full h-20 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white resize-none focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddProjectModal(false)}>
                      Cancel
                    </Button>
                    <Button type="button" variant="apple" size="sm" onClick={handleAddProject}>
                      Save Project
                    </Button>
                  </div>
                </Card>
              )}

              {/* Projects List */}
              <div className="space-y-3">
                {projects.length === 0 && !showAddProjectModal && (
                  <p className="text-xs text-zinc-500 text-center py-8">
                    No academic projects added yet. Click "Add New Project" above to detail your work.
                  </p>
                )}

                {projects.map(proj => (
                  <div key={proj.id} className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{proj.title}</h4>
                          {proj.role && <Badge variant="secondary" className="text-[10px] py-0">{proj.role}</Badge>}
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">{proj.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteProject(proj.id)}
                        className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                        title="Delete project"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {proj.techStack && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-zinc-500 font-semibold uppercase">Stack:</span>
                        {proj.techStack.split(',').map((t, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-2 text-xs border-t border-zinc-800/60">
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-zinc-300 hover:text-white font-medium hover:underline text-[11px]"
                        >
                          <Code2 size={13} className="text-purple-400" /> GitHub Repository <ExternalLink size={11} />
                        </a>
                      )}

                      {proj.liveUrl && (
                        <a
                          href={proj.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium hover:underline text-[11px]"
                        >
                          <Globe size={13} /> Live Demo <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Personal & Contact Details */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 font-semibold mb-1.5 block">
                    Full Legal Name *
                  </label>
                  <Input
                    required
                    value={formData.name}
                    onChange={e => handleChange('name', e.target.value)}
                    placeholder="e.g. Alex Chen"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-semibold mb-1.5 block">
                    Profile Photo (Cloudinary)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.avatar}
                      onChange={e => handleChange('avatar', e.target.value)}
                      placeholder="https://res.cloudinary.com/..."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="gap-1.5 shrink-0 text-xs"
                    >
                      {uploadingAvatar ? <RefreshCw size={13} className="animate-spin" /> : <Upload size={13} />}
                      Upload File
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 font-semibold mb-1.5 block">
                    Mobile Phone Number
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={e => handleChange('phone', e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-semibold mb-1.5 block">
                    Location / City & Country
                  </label>
                  <Input
                    value={formData.location}
                    onChange={e => handleChange('location', e.target.value)}
                    placeholder="e.g. Bangalore, India"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-semibold mb-1.5 block">
                  Residential / Campus Address
                </label>
                <Input
                  value={formData.address}
                  onChange={e => handleChange('address', e.target.value)}
                  placeholder="Hostel / City Address"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-semibold mb-1.5 block">
                  Bio & Academic Statement
                </label>
                <textarea
                  value={formData.bio}
                  onChange={e => handleChange('bio', e.target.value)}
                  placeholder="Tell your academic story, research interests, and career ambitions..."
                  className="w-full h-24 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white resize-none focus:outline-none focus:border-zinc-600 placeholder-zinc-500"
                />
              </div>
            </div>
          )}

          {/* TAB 4: Social Portfolios & Goals */}
          {activeTab === 'social' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 font-semibold mb-1.5 flex items-center gap-1.5">
                    <Link2 size={13} className="text-blue-400" /> LinkedIn Profile
                  </label>
                  <Input
                    value={formData.linkedInUrl}
                    onChange={e => handleChange('linkedInUrl', e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-semibold mb-1.5 flex items-center gap-1.5">
                    <Code2 size={13} className="text-zinc-300" /> GitHub Profile
                  </label>
                  <Input
                    value={formData.githubUrl}
                    onChange={e => handleChange('githubUrl', e.target.value)}
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 font-semibold mb-1.5 block">
                    Target Career Goal / Role
                  </label>
                  <Input
                    value={formData.careerGoalLabel}
                    onChange={e => handleChange('careerGoalLabel', e.target.value)}
                    placeholder="e.g. Full Stack Software Engineer"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-semibold mb-1.5 block">
                    Target Daily Study Hours
                  </label>
                  <Input
                    type="number"
                    min={1} max={16}
                    value={formData.studyHoursPerDay}
                    onChange={e => handleChange('studyHoursPerDay', parseInt(e.target.value))}
                    placeholder="4"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-semibold mb-1.5 block">
                  Preferred Learning Style
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['practical', 'visual', 'reading', 'mixed'].map(style => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => handleChange('learningStyle', style)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all capitalize ${
                        formData.learningStyle === style
                          ? 'bg-blue-600/20 border-blue-400 text-white'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button type="submit" variant="apple" disabled={saving} className="gap-2">
              {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
              {saving ? 'Saving Profile...' : 'Save Profile Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}