'use client';

import React, { useState } from 'react';
import {
  MapPin, CheckCircle2, Lock, Clock, Sparkles, Edit2, Save, X, Plus,
  ChevronRight, User, BookOpen, Timer, Code2, Target, Eye, ExternalLink,
  Check, Award, Layers, Lightbulb, Download
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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

// Helper to generate dynamic phase breakdown if not explicitly provided
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

  // Profiler form state
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
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {ROLES.map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setProfile(p => ({ ...p, targetRole: r }))}
              className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                profile.targetRole === r
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50/50'
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
        <div className="flex gap-3">
          {EXPERIENCE_LEVELS.map(l => (
            <button
              key={l}
              type="button"
              onClick={() => setProfile(p => ({ ...p, experience: l }))}
              className={`flex-1 py-4 rounded-2xl text-sm font-bold border transition-all ${
                profile.experience === l
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400 hover:bg-blue-50/50'
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
        <div className="grid grid-cols-3 gap-3">
          {HOURS_OPTIONS.map(h => (
            <button
              key={h}
              type="button"
              onClick={() => setProfile(p => ({ ...p, hoursPerWeek: h }))}
              className={`py-3.5 rounded-2xl text-sm font-extrabold border transition-all ${
                profile.hoursPerWeek === h
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400 hover:bg-blue-50/50'
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
        <Input
          value={profile.techStack}
          onChange={e => setProfile(p => ({ ...p, techStack: e.target.value }))}
          placeholder="e.g. Java, Python, React, SQL, Docker"
          className="text-sm bg-slate-50 border-slate-200 text-slate-900 rounded-xl"
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
          placeholder="e.g. Crack product-based company interviews, master distributed systems, build scalable SaaS..."
          className="w-full h-24 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 resize-none focus:outline-none focus:border-blue-500 placeholder-slate-400"
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
    // Inject print-specific styles temporarily
    const styleId = 'roadmap-print-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @media print {
          body > * { display: none !important; }
          #roadmap-print-root { display: block !important; }
          #roadmap-print-root {
            font-family: 'Inter', system-ui, sans-serif;
            color: #000;
            background: #fff;
            padding: 32px;
          }
          .roadmap-print-header { margin-bottom: 24px; border-bottom: 2px solid #e5e7eb; padding-bottom: 16px; }
          .roadmap-print-header h1 { font-size: 24px; font-weight: 800; margin: 0 0 4px; }
          .roadmap-print-header p { font-size: 13px; color: #6b7280; margin: 0; }
          .roadmap-print-phase { margin-bottom: 20px; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; break-inside: avoid; }
          .roadmap-print-phase-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
          .roadmap-print-phase-num { width: 28px; height: 28px; border-radius: 50%; background: #2563eb; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; flex-shrink: 0; }
          .roadmap-print-phase-num.done { background: #10b981; }
          .roadmap-print-phase-num.locked { background: #9ca3af; }
          .roadmap-print-phase h2 { font-size: 15px; font-weight: 700; margin: 0; }
          .roadmap-print-phase p { font-size: 12px; color: #6b7280; margin: 6px 0 10px; }
          .roadmap-print-skills { display: flex; flex-wrap: wrap; gap: 6px; }
          .roadmap-print-skill { font-size: 10px; border: 1px solid #d1d5db; border-radius: 99px; padding: 2px 8px; color: #374151; }
          .roadmap-print-meta { font-size: 11px; color: #9ca3af; margin-bottom: 4px; }
          .roadmap-print-status { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 2px 8px; border-radius: 99px; border: 1px solid; }
          .status-in_progress { color: #2563eb; border-color: #2563eb; background: #eff6ff; }
          .status-completed { color: #059669; border-color: #059669; background: #ecfdf5; }
          .status-locked { color: #9ca3af; border-color: #d1d5db; background: #f9fafb; }
        }
      `;
      document.head.appendChild(style);
    }

    // Create hidden print container
    let container = document.getElementById('roadmap-print-root');
    if (!container) {
      container = document.createElement('div');
      container.id = 'roadmap-print-root';
      container.style.display = 'none';
      document.body.appendChild(container);
    }

    container.innerHTML = `
      <div class="roadmap-print-header">
        <h1>Career Learning Roadmap</h1>
        <p>Target Track: ${targetRole} &nbsp;·&nbsp; Generated by StudentOS</p>
      </div>
      ${milestones.map((m, idx) => `
        <div class="roadmap-print-phase">
          <div class="roadmap-print-phase-header">
            <div class="roadmap-print-phase-num ${m.status === 'completed' ? 'done' : m.status === 'locked' ? 'locked' : ''}">${idx + 1}</div>
            <div>
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                <span class="roadmap-print-status status-${m.status}">${m.status.replace('_', ' ')}</span>
                <span class="roadmap-print-meta" style="margin:0">${m.estimatedWeeks} Weeks</span>
              </div>
              <h2>${m.title}</h2>
            </div>
          </div>
          <p>${m.description}</p>
          <div class="roadmap-print-skills">
            ${m.skills.map(s => `<span class="roadmap-print-skill">${s}</span>`).join('')}
          </div>
        </div>
      `).join('')}
    `;

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
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <Badge className="gap-1 px-3 py-1 mb-2 bg-blue-50 text-blue-700 border-blue-200 text-xs font-semibold">
            <Sparkles size={13} className="text-blue-600" /> AI Tailored Pathway
          </Badge>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Career Learning Roadmap</h1>
          <p className="text-sm text-slate-500 mt-1">
            Target Track: <strong className="text-blue-600 font-semibold">{targetRole}</strong> · Click any phase card to view its deep-dive curriculum.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start flex-wrap">
          {milestones.length > 0 && (
            <Button
              id="roadmap-download-pdf-btn"
              onClick={handleDownloadPDF}
              variant="outline"
              className="gap-2 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl"
            >
              <Download size={14} /> Download PDF
            </Button>
          )}
          <Button
            id="roadmap-generate-btn"
            onClick={() => { setShowProfiler(true); setStep(0); }}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
            disabled={isGenerating}
          >
            <Sparkles size={14} /> {milestones.length === 0 ? 'Generate AI Roadmap' : 'Regenerate Roadmap'}
          </Button>
        </div>
      </div>

      {/* Roadmap Timeline */}
      {milestones.length === 0 ? (
        <Card className="p-12 text-center space-y-4 bg-white border-slate-200 rounded-3xl shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Sparkles size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Generate Your AI Roadmap</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">Answer a few quick questions and let AI create your personalized, milestone-driven learning path.</p>
          <Button onClick={() => setShowProfiler(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
            <Sparkles size={14} /> Start AI Profiler
          </Button>
        </Card>
      ) : (
        <div className="space-y-6 relative before:absolute before:inset-0 before:left-6 before:w-0.5 before:bg-slate-200">
          {milestones.map((m, idx) => (
            <div key={m.id} className="relative pl-14 group">
              <div className={`absolute left-3 top-6 -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer ${
                m.status === 'completed'
                  ? 'bg-emerald-500 border-emerald-400 text-white shadow-md shadow-emerald-500/20'
                  : m.status === 'in_progress'
                  ? 'bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-500/30 ring-4 ring-blue-100'
                  : 'bg-white border-slate-300 text-slate-400'
              }`}
                onClick={() => setSelectedPhase(m)}
              >
                {m.status === 'completed' && <CheckCircle2 size={16} />}
                {m.status === 'in_progress' && <span className="text-xs font-bold">{idx + 1}</span>}
                {m.status === 'locked' && <Lock size={12} />}
              </div>

              <Card
                className={`p-6 transition-all cursor-pointer rounded-3xl border bg-white shadow-xs hover:shadow-md ${
                  m.status === 'in_progress' 
                    ? 'border-blue-300 bg-blue-50/20 ring-1 ring-blue-500/10' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => setSelectedPhase(m)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Badge className={`uppercase text-[10px] font-bold ${
                      m.status === 'completed' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : m.status === 'in_progress' 
                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {m.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-blue-600 font-semibold flex items-center gap-1 group-hover:underline">
                      <Eye size={12} /> View Detailed Plan
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <Clock size={12} /> {m.estimatedWeeks} Weeks
                    </span>
                    <button
                      onClick={(e) => editingId === m.id ? saveEdit(e) : startEdit(m, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                      title="Edit Title/Description"
                    >
                      {editingId === m.id ? <Save size={14} className="text-emerald-600" /> : <Edit2 size={14} />}
                    </button>
                    {editingId === m.id && (
                      <button onClick={(e) => { e.stopPropagation(); setEditingId(null); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-500">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {editingId === m.id ? (
                  <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                    <Input value={editDraft.title} onChange={e => setEditDraft(d => ({ ...d, title: e.target.value }))} className="font-bold text-sm bg-slate-50 border-slate-200 text-slate-900 rounded-xl" />
                    <textarea
                      value={editDraft.description}
                      onChange={e => setEditDraft(d => ({ ...d, description: e.target.value }))}
                      className="w-full h-20 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 resize-none focus:outline-none focus:border-blue-500"
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="text-lg font-bold text-slate-900 mb-1">{m.title}</h2>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">{m.description}</p>
                  </>
                )}

                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-100">
                  {m.skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="text-[11px] bg-slate-100 text-slate-700 border-slate-200 font-medium">
                      {skill}
                    </Badge>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1 h-8 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl"
                    onClick={() => setSelectedPhase(m)}
                  >
                    <Layers size={13} /> Deep Dive Plan
                  </Button>

                  {m.status === 'in_progress' && (
                    <Button size="sm" className="gap-1 text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs" onClick={() => updateMilestoneStatus(m.id, 'completed')}>
                      <CheckCircle2 size={14} /> Mark Completed
                    </Button>
                  )}
                  {m.status === 'locked' && (
                    <Button variant="secondary" size="sm" className="text-xs h-8 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl" onClick={() => updateMilestoneStatus(m.id, 'in_progress')}>
                      Unlock Phase
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* ── Interactive Phase Deep Dive Modal ── */}
      {selectedPhase && (() => {
        const curriculum = getPhaseCurriculum(selectedPhase, targetRole);
        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] bg-white border-slate-200 p-6 space-y-6 overflow-y-auto shadow-2xl rounded-3xl">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`uppercase text-[10px] font-bold ${
                      selectedPhase.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : selectedPhase.status === 'in_progress'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {selectedPhase.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                      <Clock size={12} /> {selectedPhase.estimatedWeeks} Weeks Estimated
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedPhase.title}</h2>
                  <p className="text-xs text-slate-500 mt-1">{selectedPhase.description}</p>
                </div>
                <button
                  onClick={() => setSelectedPhase(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modules breakdown */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers size={14} className="text-blue-600" /> Curriculum Modules & Topics
                </h3>
                <div className="space-y-3">
                  {curriculum.modules.map((mod, mi) => (
                    <div key={mi} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{mod.title}</span>
                        <Badge variant="outline" className="text-[10px] text-slate-600 bg-white border-slate-200">~{mod.estimatedHours}h</Badge>
                      </div>
                      <ul className="space-y-1 pl-4 list-disc text-[11px] text-slate-600 leading-relaxed">
                        {mod.topics.map((top, ti) => (
                          <li key={ti}>{top}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Capstone Project */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
                  <Award size={14} /> Phase Capstone Project
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">{curriculum.project}</p>
                <div className="pt-2 border-t border-blue-200/60 flex flex-wrap gap-2 text-[10px] text-slate-600">
                  {curriculum.deliverables.map((del, di) => (
                    <span key={di} className="px-2.5 py-1 rounded-full bg-white border border-blue-200 flex items-center gap-1 text-slate-700 font-medium">
                      <Check size={10} className="text-blue-600" /> {del}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <Button variant="ghost" size="sm" className="text-slate-600 hover:bg-slate-100 rounded-xl" onClick={() => setSelectedPhase(null)}>
                  Close
                </Button>

                {selectedPhase.status !== 'completed' ? (
                  <Button
                    size="sm"
                    className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
                    onClick={() => {
                      updateMilestoneStatus(selectedPhase.id, 'completed');
                      setSelectedPhase(prev => prev ? { ...prev, status: 'completed' } : null);
                    }}
                  >
                    <CheckCircle2 size={14} /> Mark Phase Completed
                  </Button>
                ) : (
                  <Badge className="gap-1 py-1 bg-emerald-50 text-emerald-700 border-emerald-200">
                    <CheckCircle2 size={12} /> Phase Completed
                  </Badge>
                )}
              </div>
            </Card>
          </div>
        );
      })()}

      {/* AI Profiler Modal */}
      {showProfiler && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-xl w-full bg-white border-slate-200 p-6 space-y-6 shadow-2xl rounded-3xl">
            {/* Steps indicator */}
            <div className="flex items-center gap-2">
              {PROFILER_STEPS.map((s, i) => (
                <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i <= step ? 'bg-blue-600' : 'bg-slate-100'}`} />
              ))}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-blue-600 font-bold">
                {React.createElement(PROFILER_STEPS[step].icon, { size: 18 })}
                <span className="text-xs uppercase tracking-wider">{PROFILER_STEPS[step].title}</span>
              </div>
              <p className="text-slate-600 text-sm">{PROFILER_STEPS[step].desc}</p>
            </div>

            <div>{PROFILER_STEPS[step].field}</div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <Button variant="ghost" className="text-slate-600 hover:bg-slate-100 rounded-xl" onClick={() => step > 0 ? setStep(s => s - 1) : setShowProfiler(false)}>
                {step === 0 ? 'Cancel' : 'Back'}
              </Button>

              {step < PROFILER_STEPS.length - 1 ? (
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs" onClick={() => setStep(s => s + 1)}>
                  Next <ChevronRight size={14} />
                </Button>
              ) : (
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs" onClick={handleGenerate} disabled={isGenerating}>
                  <Sparkles size={14} />
                  {isGenerating ? 'Generating...' : 'Generate My Roadmap'}
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}