'use client';

import React, { useState, useEffect } from 'react';
import {
  User as UserIcon, GraduationCap, Building2, BookOpen, Award, Phone,
  MapPin, Globe, Link2, Code2, Save, CheckCircle2, RefreshCw,
  Sparkles, Camera, Briefcase, Clock, Layers, ShieldCheck
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useStudentOS } from '@/context/StudentOSContext';
import api from '@/lib/api';

export default function StudentProfilePage() {
  const { isGoogleConnected, googleEmail } = useStudentOS();

  const [activeTab, setActiveTab] = useState<'academic' | 'personal' | 'social'>('academic');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    avatar: '',
    collegeName: '',
    degree: 'B.Tech',
    branch: 'Computer Science & Engineering',
    yearOfStudy: 3,
    semester: 6,
    percentageOrCgpa: '',
    areaOfInterest: '',
    targetGraduationYear: 2026,
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

  // Fetch initial profile
  useEffect(() => {
    setLoading(true);
    api.get('/student-os/profile')
      .then(res => {
        const u = res.data?.user || {};
        const a = res.data?.academic || {};
        setFormData({
          name: u.name || '',
          avatar: u.avatar || '',
          collegeName: a.collegeName || '',
          degree: a.degree || 'B.Tech',
          branch: a.branch || 'Computer Science & Engineering',
          yearOfStudy: a.yearOfStudy || 3,
          semester: a.semester || 6,
          percentageOrCgpa: a.percentageOrCgpa || '',
          areaOfInterest: a.areaOfInterest || '',
          targetGraduationYear: a.targetGraduationYear || 2026,
          phone: a.phone || '',
          address: a.address || '',
          location: a.location || '',
          linkedInUrl: a.linkedInUrl || '',
          githubUrl: a.githubUrl || '',
          bio: a.bio || '',
          careerGoal: a.careerGoal || 'software_engineer',
          careerGoalLabel: a.careerGoalLabel || 'Full Stack Software Engineer',
          learningStyle: a.learningStyle || 'mixed',
          studyHoursPerDay: a.studyHoursPerDay || 4,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await api.put('/student-os/profile', formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      alert('Failed to save profile: ' + (err?.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
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
            Your personal & academic credentials feed into Gemini AI for ultra-personalized learning roadmaps and career job matching.
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
          <span>Profile saved successfully! All AI roadmaps and daily planning models are updated.</span>
        </div>
      )}

      {/* Avatar & Persona Summary Card */}
      <Card className="p-6 bg-zinc-950 border-zinc-800 shadow-xl flex flex-col md:flex-row items-center gap-6">
        <div className="relative group shrink-0">
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
        </div>

        <div className="flex-1 text-center md:text-left space-y-1">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h2 className="text-xl font-bold text-white">{formData.name || 'StudentOS User'}</h2>
            <Badge variant="outline" className="text-[10px] border-zinc-700 max-w-fit mx-auto md:mx-0">
              {formData.degree || 'B.Tech'} · {formData.branch || 'Engineering'}
            </Badge>
          </div>
          <p className="text-xs text-zinc-400">{formData.collegeName || 'University / Institution'}</p>
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
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('academic')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'academic'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white bg-zinc-900'
          }`}
        >
          <GraduationCap size={15} /> Academic Background
        </button>
        <button
          onClick={() => setActiveTab('personal')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'personal'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white bg-zinc-900'
          }`}
        >
          <UserIcon size={15} /> Personal & Contact
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'social'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white bg-zinc-900'
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
                    College / University Name
                  </label>
                  <Input
                    value={formData.collegeName}
                    onChange={e => handleChange('collegeName', e.target.value)}
                    placeholder="e.g. National Institute of Technology"
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
                    placeholder="e.g. Computer Science"
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
                    Academic CGPA / Percentage
                  </label>
                  <Input
                    value={formData.percentageOrCgpa}
                    onChange={e => handleChange('percentageOrCgpa', e.target.value)}
                    placeholder="e.g. 8.9 CGPA or 85%"
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
            </div>
          )}

          {/* TAB 2: Personal & Contact Details */}
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
                    Profile Photo URL
                  </label>
                  <Input
                    value={formData.avatar}
                    onChange={e => handleChange('avatar', e.target.value)}
                    placeholder="https://..."
                  />
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

          {/* TAB 3: Social Portfolios & Goals */}
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