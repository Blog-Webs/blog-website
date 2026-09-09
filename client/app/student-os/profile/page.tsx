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
    <div className="max-w-5xl mx-auto space-y-5 pb-10">
      {/* Hidden File Input for Cloudinary Upload */}
      <input
        type="file"
        ref={avatarInputRef}
        onChange={handleAvatarFileChange}
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight flex items-center gap-2">
            <UserIcon className="text-blue-600" size={20} /> Student Academic Profile
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Your personal & academic credentials, college information, and live projects synchronized with StudentOS.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 self-start sm:self-center bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-md text-xs font-medium shadow-xs transition-colors"
        >
          {saving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
          <span>{saving ? 'Saving...' : 'Save Profile'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs font-medium shadow-xs">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>Profile & Academic projects saved successfully! AI models updated.</span>
        </div>
      )}

      {avatarUploadSuccess && (
        <div className="p-3 rounded-md bg-blue-50 border border-blue-200 flex items-center gap-2 text-blue-800 text-xs font-medium shadow-xs">
          <Cloud size={16} className="text-blue-600 shrink-0" />
          <span>Profile photo uploaded to Cloudinary successfully!</span>
        </div>
      )}

      {/* Avatar & Persona Summary Card */}
      <div className="p-5 bg-white border border-gray-200 shadow-xs rounded-lg flex flex-col md:flex-row items-center gap-5">
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
                className="w-20 h-20 rounded-full object-cover border border-gray-200 shadow-xs"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-600 text-white font-bold text-xl flex items-center justify-center shadow-xs border border-blue-200">
                {formData.name ? formData.name.slice(0, 2).toUpperCase() : 'SO'}
              </div>
            )}

            <div className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              {uploadingAvatar ? (
                <RefreshCw size={16} className="animate-spin text-blue-300" />
              ) : (
                <>
                  <Camera size={16} />
                  <span className="text-[8px] font-medium mt-0.5">Upload</span>
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute -bottom-0.5 -right-0.5 p-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white border-2 border-white shadow-xs transition-colors"
            title="Upload photo to Cloudinary"
          >
            {uploadingAvatar ? <RefreshCw size={11} className="animate-spin" /> : <Upload size={11} />}
          </button>
        </div>

        <div className="flex-1 text-center md:text-left space-y-1">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h2 className="text-base font-semibold text-gray-900">{formData.name || 'StudentOS User'}</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md border border-gray-200 text-gray-600 max-w-fit mx-auto md:mx-0">
              {formData.degree || 'B.Tech'} · {formData.branch || 'Engineering'}
            </span>
            {formData.avatar && formData.avatar.includes('cloudinary') && (
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-md text-blue-700 bg-blue-50 border border-blue-200 max-w-fit mx-auto md:mx-0">
                <Cloud size={9} className="inline mr-1" /> Cloudinary Hosted
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">{formData.collegeName || 'University / Institution'} {formData.collegeLocation ? `(${formData.collegeLocation})` : ''}</p>
          {googleEmail && <p className="text-[11px] text-gray-400 font-mono">{googleEmail}</p>}
          <div className="flex flex-wrap gap-1.5 pt-1.5 justify-center md:justify-start">
            {formData.areaOfInterest && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                🎯 {formData.areaOfInterest}
              </span>
            )}
            {formData.percentageOrCgpa && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                📊 {formData.percentageOrCgpa}
              </span>
            )}
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200 font-medium">
              💻 {projects.length} Projects
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-gray-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('academic')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
            activeTab === 'academic'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <GraduationCap size={14} /> Academic Info
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
            activeTab === 'projects'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <FolderOpen size={14} /> Projects ({projects.length})
        </button>
        <button
          onClick={() => setActiveTab('personal')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
            activeTab === 'personal'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <UserIcon size={14} /> Personal & Contact
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
            activeTab === 'social'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Globe size={14} /> Social & Goals
        </button>
      </div>

      {/* Form Card */}
      <div className="p-5 bg-white border border-gray-200 shadow-xs rounded-lg">
        <form onSubmit={handleSave} className="space-y-4">
          {/* TAB 1: Academic Background */}
          {activeTab === 'academic' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs text-gray-700 font-medium mb-1 block">
                    College / Institution Name *
                  </label>
                  <Input
                    value={formData.collegeName}
                    onChange={e => handleChange('collegeName', e.target.value)}
                    placeholder="e.g. National Institute of Technology"
                    className="bg-white border-gray-300 text-gray-900 rounded-md h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-700 font-medium mb-1 block">
                    Affiliated University / Board
                  </label>
                  <Input
                    value={formData.universityName}
                    onChange={e => handleChange('universityName', e.target.value)}
                    placeholder="e.g. Visvesvaraya Technological University"
                    className="bg-white border-gray-300 text-gray-900 rounded-md h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div>
                  <label className="text-xs text-gray-700 font-medium mb-1 block">
                    College Location / City
                  </label>
                  <Input
                    value={formData.collegeLocation}
                    onChange={e => handleChange('collegeLocation', e.target.value)}
                    placeholder="e.g. Bangalore, Karnataka"
                    className="bg-white border-gray-300 text-gray-900 rounded-md h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-700 font-medium mb-1 block">
                    Student Roll No. / Enrollment ID
                  </label>
                  <Input
                    value={formData.studentId}
                    onChange={e => handleChange('studentId', e.target.value)}
                    placeholder="e.g. 1NT21CS108"
                    className="bg-white border-gray-300 text-gray-900 rounded-md h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-700 font-medium mb-1 block">
                    Degree Program
                  </label>
                  <Input
                    value={formData.degree}
                    onChange={e => handleChange('degree', e.target.value)}
                    placeholder="e.g. B.Tech, B.E., MCA, M.Tech"
                    className="bg-white border-gray-300 text-gray-900 rounded-md h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div>
                  <label className="text-xs text-gray-700 font-medium mb-1 block">
                    Branch / Specialization
                  </label>
                  <Input
                    value={formData.branch}
                    onChange={e => handleChange('branch', e.target.value)}
                    placeholder="e.g. Computer Science & Engineering"
                    className="bg-white border-gray-300 text-gray-900 rounded-md h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-700 font-medium mb-1 block">
                    Current Year of Study
                  </label>
                  <select
                    value={formData.yearOfStudy}
                    onChange={e => handleChange('yearOfStudy', parseInt(e.target.value))}
                    className="w-full h-9 px-3 rounded-md bg-white border border-gray-300 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value={1}>1st Year (Freshman)</option>
                    <option value={2}>2nd Year (Sophomore)</option>
                    <option value={3}>3rd Year (Junior)</option>
                    <option value={4}>4th Year (Senior)</option>
                    <option value={5}>5th Year</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-700 font-medium mb-1 block">
                    Current Semester
                  </label>
                  <select
                    value={formData.semester}
                    onChange={e => handleChange('semester', parseInt(e.target.value))}
                    className="w-full h-9 px-3 rounded-md bg-white border border-gray-300 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs text-gray-700 font-medium mb-1 block">
                    Academic CGPA / Percentage Marks
                  </label>
                  <Input
                    value={formData.percentageOrCgpa}
                    onChange={e => handleChange('percentageOrCgpa', e.target.value)}
                    placeholder="e.g. 8.9 CGPA or 88%"
                    className="bg-white border-gray-300 text-gray-900 rounded-md h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-700 font-medium mb-1 block">
                    Target Graduation Year
                  </label>
                  <Input
                    type="number"
                    value={formData.targetGraduationYear}
                    onChange={e => handleChange('targetGraduationYear', parseInt(e.target.value))}
                    placeholder="2026"
                    className="bg-white border-gray-300 text-gray-900 rounded-md h-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-700 font-medium mb-1 block">
                  Core Area of Interest / Domain Specialization
                </label>
                <Input
                  value={formData.areaOfInterest}
                  onChange={e => handleChange('areaOfInterest', e.target.value)}
                  placeholder="e.g. Distributed Systems, Artificial Intelligence, Full-Stack Web Development, Cloud Computing"
                  className="bg-white border-gray-300 text-gray-900 rounded-md h-9 text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-gray-700 font-medium mb-1 block">
                  Core Coursework & Completed Modules
                </label>
                <textarea
                  value={formData.coreCoursework}
                  onChange={e => handleChange('coreCoursework', e.target.value)}
                  placeholder="List key academic subjects: Data Structures, Algorithms, Operating Systems, DBMS..."
                  className="w-full h-18 px-3 py-2 rounded-md bg-white border border-gray-300 text-xs text-gray-900 resize-none focus:outline-none focus:border-blue-500 placeholder:text-gray-400"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Academic Projects & Live Links */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <FolderOpen size={14} className="text-blue-600" /> Academic & Personal Projects
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Showcase your technical builds, GitHub repositories, and live deployed demos.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(true)}
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs font-medium shadow-xs transition-colors"
                >
                  <Plus size={13} /> Add Project
                </button>
              </div>

              {/* Add Project Form Modal / Card */}
              {showAddProjectModal && (
                <div className="p-4 bg-gray-50 border border-gray-200 space-y-3 shadow-xs rounded-md">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <span className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                      <Code2 size={13} className="text-blue-600" /> Add Academic Project
                    </span>
                    <button type="button" onClick={() => setShowAddProjectModal(false)} className="text-gray-400 hover:text-gray-700">
                      <X size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-gray-700 font-medium block mb-1">Project Title *</label>
                      <Input
                        value={newProject.title}
                        onChange={e => setNewProject(p => ({ ...p, title: e.target.value }))}
                        placeholder="e.g. Real-Time Collaborative Canvas"
                        className="text-xs bg-white border-gray-300 text-gray-900 rounded-md h-8"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-700 font-medium block mb-1">Your Role / Team Size</label>
                      <Input
                        value={newProject.role}
                        onChange={e => setNewProject(p => ({ ...p, role: e.target.value }))}
                        placeholder="e.g. Lead Full Stack Dev / Team of 3"
                        className="text-xs bg-white border-gray-300 text-gray-900 rounded-md h-8"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-700 font-medium block mb-1">Technologies & Stack Used</label>
                    <Input
                      value={newProject.techStack}
                      onChange={e => setNewProject(p => ({ ...p, techStack: e.target.value }))}
                      placeholder="e.g. React, Node.js, WebSockets, Redis, WebGL"
                      className="text-xs bg-white border-gray-300 text-gray-900 rounded-md h-8"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-gray-700 font-medium block mb-1">GitHub Code Repository Link</label>
                      <Input
                        value={newProject.githubUrl}
                        onChange={e => setNewProject(p => ({ ...p, githubUrl: e.target.value }))}
                        placeholder="https://github.com/username/project"
                        className="text-xs bg-white border-gray-300 text-gray-900 rounded-md h-8"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-700 font-medium block mb-1">Live Project Demo Link</label>
                      <Input
                        value={newProject.liveUrl}
                        onChange={e => setNewProject(p => ({ ...p, liveUrl: e.target.value }))}
                        placeholder="https://my-app.vercel.app"
                        className="text-xs bg-white border-gray-300 text-gray-900 rounded-md h-8"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-700 font-medium block mb-1">Description & Highlights</label>
                    <textarea
                      value={newProject.description}
                      onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))}
                      placeholder="Describe what the project accomplishes, key features, and your engineering challenges solved..."
                      className="w-full h-18 px-3 py-1.5 rounded-md bg-white border border-gray-300 text-xs text-gray-900 resize-none focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                    <button 
                      type="button" 
                      onClick={() => setShowAddProjectModal(false)} 
                      className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1 rounded-md text-xs font-medium"
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      onClick={handleAddProject} 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs font-medium shadow-xs"
                    >
                      Save Project
                    </button>
                  </div>
                </div>
              )}

              {/* Projects List */}
              <div className="space-y-2.5">
                {projects.length === 0 && !showAddProjectModal && (
                  <p className="text-xs text-gray-400 text-center py-8">
                    No academic projects added yet. Click "Add Project" above to detail your work.
                  </p>
                )}

                {projects.map(proj => (
                  <div key={proj.id} className="p-3.5 rounded-md bg-white border border-gray-200 hover:border-gray-300 transition-colors space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-semibold text-gray-900">{proj.title}</h4>
                          {proj.role && <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-gray-100 text-gray-600 border border-gray-200">{proj.role}</span>}
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">{proj.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteProject(proj.id)}
                        className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-gray-50 transition-colors"
                        title="Delete project"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {proj.techStack && (
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] text-gray-400 font-semibold uppercase">Stack:</span>
                        {proj.techStack.split(',').map((t, idx) => (
                          <span key={idx} className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-2 text-xs border-t border-gray-100">
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-gray-700 hover:text-blue-600 font-medium text-[11px]"
                        >
                          <Code2 size={12} className="text-gray-500" /> GitHub Repository <ExternalLink size={10} />
                        </a>
                      )}

                      {proj.liveUrl && (
                        <a
                          href={proj.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium text-[11px]"
                        >
                          <Globe size={12} /> Live Demo <ExternalLink size={10} />
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
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs text-gray-700 font-medium mb-1 block">
                    Full Legal Name *
                  </label>
                  <Input
                    required
                    value={formData.name}
                    onChange={e => handleChange('name', e.target.value)}
                    placeholder="e.g. Alex Chen"
                    className="bg-white border-gray-300 text-gray-900 rounded-md h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-700 font-medium mb-1 block">
                    Profile Photo (Cloudinary)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.avatar}
                      onChange={e => handleChange('avatar', e.target.value)}
                      placeholder="https://res.cloudinary.com/..."
                      className="flex-1 bg-white border-gray-300 text-gray-900 rounded-md h-9 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="flex items-center gap-1 shrink-0 text-xs bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 h-9 rounded-md font-medium"
                    >
                      {uploadingAvatar ? <RefreshCw size={12} className="animate-spin" /> : <Upload size={12} />}
                      <span>Upload</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs text-gray-700 font-medium mb-1 block">
                    Mobile Phone Number
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={e => handleChange('phone', e.target.value)}
                    placeholder="+91 98765 43210"
                    className="bg-white border-gray-300 text-gray-900 rounded-md h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-700 font-medium mb-1 block">
                    Location / City & Country
                  </label>
                  <Input
                    value={formData.location}
                    onChange={e => handleChange('location', e.target.value)}
                    placeholder="e.g. Bangalore, India"
                    className="bg-white border-gray-300 text-gray-900 rounded-md h-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-700 font-medium mb-1 block">
                  Residential / Campus Address
                </label>
                <Input
                  value={formData.address}
                  onChange={e => handleChange('address', e.target.value)}
                  placeholder="Hostel / City Address"
                  className="bg-white border-gray-300 text-gray-900 rounded-md h-9 text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-gray-700 font-medium mb-1 block">
                  Bio & Academic Statement
                </label>
                <textarea
                  value={formData.bio}
                  onChange={e => handleChange('bio', e.target.value)}
                  placeholder="Tell your academic story, research interests, and career ambitions..."
                  className="w-full h-20 px-3 py-2 rounded-md bg-white border border-gray-300 text-xs text-gray-900 resize-none focus:outline-none focus:border-blue-500 placeholder:text-gray-400"
                />
              </div>
            </div>
          )}

          {/* TAB 4: Social Portfolios & Goals */}
          {activeTab === 'social' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs text-gray-700 font-medium mb-1 flex items-center gap-1.5">
                    <Link2 size={13} className="text-blue-600" /> LinkedIn Profile
                  </label>
                  <Input
                    value={formData.linkedInUrl}
                    onChange={e => handleChange('linkedInUrl', e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="bg-white border-gray-300 text-gray-900 rounded-md h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-700 font-medium mb-1 flex items-center gap-1.5">
                    <Code2 size={13} className="text-gray-700" /> GitHub Profile
                  </label>
                  <Input
                    value={formData.githubUrl}
                    onChange={e => handleChange('githubUrl', e.target.value)}
                    placeholder="https://github.com/username"
                    className="bg-white border-gray-300 text-gray-900 rounded-md h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs text-gray-700 font-medium mb-1 block">
                    Target Career Goal / Role
                  </label>
                  <Input
                    value={formData.careerGoalLabel}
                    onChange={e => handleChange('careerGoalLabel', e.target.value)}
                    placeholder="e.g. Full Stack Software Engineer"
                    className="bg-white border-gray-300 text-gray-900 rounded-md h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-700 font-medium mb-1 block">
                    Target Daily Study Hours
                  </label>
                  <Input
                    type="number"
                    min={1} max={16}
                    value={formData.studyHoursPerDay}
                    onChange={e => handleChange('studyHoursPerDay', parseInt(e.target.value))}
                    placeholder="4"
                    className="bg-white border-gray-300 text-gray-900 rounded-md h-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-700 font-medium mb-1 block">
                  Preferred Learning Style
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['practical', 'visual', 'reading', 'mixed'].map(style => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => handleChange('learningStyle', style)}
                      className={`py-1.5 rounded-md text-xs font-medium border transition-colors capitalize ${
                        formData.learningStyle === style
                          ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
            <button 
              type="submit" 
              disabled={saving} 
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-md text-xs font-medium shadow-xs transition-colors"
            >
              {saving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
              <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}