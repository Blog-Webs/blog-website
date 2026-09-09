'use client';

import React, { useState } from 'react';
import {
  MapPin, CheckCircle2, Lock, Clock, Sparkles, Edit2, Save, X, Plus,
  ChevronRight, User, BookOpen, Timer, Code2, Target, Eye,
  Check, Award, Layers, Download
} from 'lucide-react';
import { useRoadmap } from '@/context/RoadmapContext';
import { RoadmapMilestone } from '@/types/studentos';

const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const HOURS_OPTIONS = [5, 10, 15, 20, 30, 40];
const ROLES = [
  'Full Stack Software Engineer',
  'Backend Engineer',
  'Frontend Engineer',
  'ML/AI Engineer',
  'DevOps / Cloud Engineer',
  'Data Engineer',
  'Mobile Developer (React Native)',
  'Product Manager',
  'Cybersecurity Engineer',
];

function getPhaseCurriculum(m: RoadmapMilestone, targetRole: string) {
  const skillsList = m.skills || ['Core Foundations', 'Practical Application'];
  return {
    modules: skillsList.map((skill, i) => ({
      title: `Module ${i + 1}: ${skill} Mastery`,
      topics: [
        `Fundamental concepts and architectural trade-offs of ${skill}`,
        `Hands-on coding exercises and patterns in ${skill}`,
        `Testing, benchmarking, and real-world edge cases`,
      ],
      estimatedHours: 8,
    })),
    project: `Build a production-ready ${skillsList[0] || 'System'} integration showcasing ${skillsList.slice(0, 3).join(', ')} with full documentation and deployment.`,
    deliverables: [
      'Git repository with clean commit history',
      'Unit test suite with >80% coverage',
      'Live deployed demo link',
    ],
  };
}

export default function RoadmapPage() {
  const { milestones, targetRole, updateMilestoneStatus, generateRoadmap, editMilestone, setTargetRole, isGenerating } = useRoadmap();

  const [showProfiler, setShowProfiler] = useState(false);
  const [step, setStep] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{ title: string; description: string }>({ title: '', description: '' });
  const [selectedPhase, setSelectedPhase] = useState<RoadmapMilestone | null>(null);

  const [profile, setProfile] = useState({
    targetRole: targetRole,
    experience: 'Intermediate',
    hoursPerWeek: 15,
    techStack: '',
    learningGoals: '',
  });

  const PROFILER_STEPS = [
    {
      icon: Target,
      title: 'Target Role',
      desc: 'What role are you working towards?',
      field: (
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {ROLES.map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setProfile(p => ({ ...p, targetRole: r }))}
              className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium border transition-colors ${
                profile.targetRole === r
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >{r}</button>
          ))}
        </div>
      ),
    },
    {
      icon: User,
      title: 'Experience Level',
      desc: 'Your current programming experience:',
      field: (
        <div className="flex gap-2">
          {EXPERIENCE_LEVELS.map(l => (
            <button
              key={l}
              type="button"
              onClick={() => setProfile(p => ({ ...p, experience: l }))}
              className={`flex-1 py-3 rounded-md text-xs font-medium border transition-colors ${
                profile.experience === l
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >{l}</button>
          ))}
        </div>
      ),
    },
    {
      icon: Timer,
      title: 'Weekly Study Hours',
      desc: 'How many hours per week can you dedicate?',
      field: (
        <div className="grid grid-cols-3 gap-2">
          {HOURS_OPTIONS.map(h => (
            <button
              key={h}
              type="button"
              onClick={() => setProfile(p => ({ ...p, hoursPerWeek: h }))}
              className={`py-2.5 rounded-md text-xs font-bold border transition-colors ${
                profile.hoursPerWeek === h
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >{h}h/week</button>
          ))}
        </div>
      ),
    },
    {
      icon: Code2,
      title: 'Tech Stack',
      desc: 'Technologies you already know (comma separated):',
      field: (
        <input
          value={profile.techStack}
          onChange={e => setProfile(p => ({ ...p, techStack: e.target.value }))}
          placeholder="e.g. Java, Python, React, SQL, Docker"
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
        />
      ),
    },
    {
      icon: BookOpen,
      title: 'Learning Goals',
      desc: 'What do you want to achieve? (optional):',
      field: (
        <textarea
          value={profile.learningGoals}
          onChange={e => setProfile(p => ({ ...p, learningGoals: e.target.value }))}
          placeholder="e.g. Crack product-based company interviews, master distributed systems..."
          className="w-full h-20 p-2.5 rounded-md border border-gray-300 bg-white text-xs text-gray-900 focus:outline-none focus:border-blue-500 resize-none"
        />
      ),
    },
  ];

  const handleGenerate = async () => {
    setTargetRole(profile.targetRole);
    await generateRoadmap(profile);
    setShowProfiler(false);
    setStep(0);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const startEdit = (m: RoadmapMilestone, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(m.id);
    setEditDraft({ title: m.title, description: m.description });
  };

  const saveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingId) {
      editMilestone(editingId, editDraft);
      setEditingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
            <Sparkles size={13} className="text-blue-600" />
            <span>AI Tailored Pathway</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Career Learning Roadmap</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Target Track: <strong className="text-gray-800 font-semibold">{targetRole}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2 self-start flex-wrap">
          {milestones.length > 0 && (
            <button
              onClick={handleDownloadPDF}
              className="rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium px-3 py-1.5 flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Download size={13} /> PDF
            </button>
          )}
          <button
            onClick={() => { setShowProfiler(true); setStep(0); }}
            className="rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3.5 py-1.5 flex items-center gap-1.5 shadow-xs transition-colors"
            disabled={isGenerating}
          >
            <Sparkles size={13} /> {milestones.length === 0 ? 'Generate Roadmap' : 'Regenerate'}
          </button>
        </div>
      </div>

      {/* Roadmap Timeline */}
      {milestones.length === 0 ? (
        <div className="border border-gray-200 rounded-lg p-10 text-center space-y-3 bg-white shadow-2xs">
          <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-200 text-gray-500 flex items-center justify-center mx-auto">
            <Target size={24} />
          </div>
          <h2 className="text-sm font-bold text-gray-900">No Active Roadmap Generated</h2>
          <p className="text-gray-500 text-xs max-w-sm mx-auto">Click below to synthesize a milestone-driven pathway customized to your weekly hours.</p>
          <button
            onClick={() => setShowProfiler(true)}
            className="rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3.5 py-1.5 shadow-xs"
          >
            Start Profiler
          </button>
        </div>
      ) : (
        <div className="space-y-4 relative before:absolute before:inset-0 before:left-5 before:w-px before:bg-gray-200">
          {milestones.map((m, idx) => (
            <div key={m.id} className="relative pl-12 group">
              <div
                className={`absolute left-2.5 top-5 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center border text-[11px] font-bold transition-all cursor-pointer ${
                  m.status === 'completed'
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : m.status === 'in_progress'
                    ? 'bg-blue-600 border-blue-600 text-white ring-2 ring-blue-100'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
                onClick={() => setSelectedPhase(m)}
              >
                {m.status === 'completed' ? <CheckCircle2 size={13} /> : idx + 1}
              </div>

              <div
                className={`p-4 rounded-lg border bg-white shadow-2xs hover:border-gray-300 cursor-pointer transition-all ${
                  m.status === 'in_progress' ? 'border-blue-300 ring-1 ring-blue-100' : 'border-gray-200'
                }`}
                onClick={() => setSelectedPhase(m)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                      m.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : m.status === 'in_progress'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-gray-50 text-gray-600 border-gray-200'
                    }`}>
                      {m.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                      <Clock size={11} /> {m.estimatedWeeks} Weeks
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => editingId === m.id ? saveEdit(e) : startEdit(m, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                    >
                      {editingId === m.id ? <Save size={13} className="text-emerald-600" /> : <Edit2 size={13} />}
                    </button>
                    {editingId === m.id && (
                      <button onClick={(e) => { e.stopPropagation(); setEditingId(null); }} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500">
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {editingId === m.id ? (
                  <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      value={editDraft.title}
                      onChange={e => setEditDraft(d => ({ ...d, title: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-xs font-bold"
                    />
                    <textarea
                      value={editDraft.description}
                      onChange={e => setEditDraft(d => ({ ...d, description: e.target.value }))}
                      className="w-full h-16 rounded-md border border-gray-300 p-2 text-xs"
                    />
                  </div>
                ) : (
                  <>
                    <h3 className="text-sm font-bold text-gray-900">{m.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{m.description}</p>
                  </>
                )}

                <div className="flex flex-wrap gap-1.5 pt-2.5 mt-2.5 border-t border-gray-100">
                  {m.skills.map(skill => (
                    <span key={skill} className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200 font-medium">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setSelectedPhase(m)}
                    className="h-6 text-[11px] px-2.5 rounded border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                  >
                    View Modules
                  </button>

                  {m.status === 'in_progress' && (
                    <button
                      onClick={() => updateMilestoneStatus(m.id, 'completed')}
                      className="h-6 text-[11px] px-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-2xs transition-colors"
                    >
                      Complete
                    </button>
                  )}
                  {m.status === 'locked' && (
                    <button
                      onClick={() => updateMilestoneStatus(m.id, 'in_progress')}
                      className="h-6 text-[11px] px-2.5 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                    >
                      Unlock
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Phase Deep Dive Modal */}
      {selectedPhase && (() => {
        const curriculum = getPhaseCurriculum(selectedPhase, targetRole);
        return (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
            <div className="max-w-xl w-full max-h-[85vh] bg-white border border-gray-200 p-5 space-y-4 overflow-y-auto rounded-lg shadow-xl">
              <div className="flex items-start justify-between pb-2 border-b border-gray-100">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{selectedPhase.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{selectedPhase.description}</p>
                </div>
                <button onClick={() => setSelectedPhase(null)} className="p-1 rounded text-gray-400 hover:text-gray-700">
                  <X size={15} />
                </button>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Curriculum Modules</h4>
                {curriculum.modules.map((mod, mi) => (
                  <div key={mi} className="p-3 rounded border border-gray-200 bg-gray-50/50 space-y-1">
                    <div className="flex justify-between items-center text-xs font-semibold text-gray-800">
                      <span>{mod.title}</span>
                      <span className="text-[10px] text-gray-500">~{mod.estimatedHours}h</span>
                    </div>
                    <ul className="list-disc pl-4 text-[11px] text-gray-600 space-y-0.5 leading-relaxed">
                      {mod.topics.map((t, ti) => <li key={ti}>{t}</li>)}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded border border-blue-200 bg-blue-50/40 space-y-1 text-xs">
                <p className="font-bold text-blue-900">Capstone Deliverable</p>
                <p className="text-blue-800">{curriculum.project}</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => setSelectedPhase(null)}
                  className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedPhase.status !== 'completed' && (
                  <button
                    onClick={() => {
                      updateMilestoneStatus(selectedPhase.id, 'completed');
                      setSelectedPhase(prev => prev ? { ...prev, status: 'completed' } : null);
                    }}
                    className="rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 shadow-xs"
                  >
                    Mark Phase Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* AI Profiler Modal */}
      {showProfiler && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white border border-gray-200 p-5 space-y-4 rounded-lg shadow-xl">
            <div className="flex items-center gap-1.5">
              {PROFILER_STEPS.map((s, i) => (
                <div key={i} className={`flex-1 h-1 rounded ${i <= step ? 'bg-blue-600' : 'bg-gray-200'}`} />
              ))}
            </div>

            <div className="space-y-0.5">
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">{PROFILER_STEPS[step].title}</span>
              <p className="text-xs text-gray-500">{PROFILER_STEPS[step].desc}</p>
            </div>

            <div>{PROFILER_STEPS[step].field}</div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <button
                onClick={() => step > 0 ? setStep(s => s - 1) : setShowProfiler(false)}
                className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
              >
                {step === 0 ? 'Cancel' : 'Back'}
              </button>

              {step < PROFILER_STEPS.length - 1 ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  className="rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3.5 py-1.5 shadow-xs"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3.5 py-1.5 shadow-xs"
                >
                  {isGenerating ? 'Generating...' : 'Generate Roadmap'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}