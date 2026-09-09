'use client';

import React, { useState, useEffect } from 'react';
import {
  Brain, Trophy, RefreshCw, Sparkles, CheckCircle2, XCircle, ChevronRight,
  History, RotateCcw, AlertCircle, Award, Target, BookOpen, Clock, ChevronDown, ChevronUp
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRoadmap } from '@/context/RoadmapContext';
import api from '@/lib/api';

const TOPICS = [
  { key: 'aptitude', label: 'Aptitude & Reasoning', icon: '🧠', color: 'text-amber-700 border-amber-200 bg-amber-50' },
  { key: 'dsa', label: 'Data Structures & Algorithms', icon: '⚙️', color: 'text-blue-700 border-blue-200 bg-blue-50' },
  { key: 'os', label: 'Operating Systems', icon: '💻', color: 'text-indigo-700 border-indigo-200 bg-indigo-50' },
  { key: 'dbms', label: 'DBMS & SQL', icon: '🗄️', color: 'text-sky-700 border-sky-200 bg-sky-50' },
  { key: 'system-design', label: 'System Design', icon: '🏗️', color: 'text-rose-700 border-rose-200 bg-rose-50' },
  { key: 'web-dev', label: 'Web Development', icon: '🌐', color: 'text-emerald-700 border-emerald-200 bg-emerald-50' },
];

type Question = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  category?: string;
};

type TestAttempt = {
  id: string;
  topic: string;
  difficulty: string;
  score: number;
  total: number;
  percentage: number;
  date: string;
  wrongQuestions: { question: string; correct: string; explanation?: string }[];
  reportText: string;
};

export default function AssessmentPage() {
  const { addAssessmentResult } = useRoadmap();

  const [activeTab, setActiveTab] = useState<'take' | 'history'>('take');
  const [phase, setPhase] = useState<'select' | 'quiz' | 'report'>('select');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [generating, setGenerating] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);

  const [currentReport, setCurrentReport] = useState<TestAttempt | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  // Persistent Test History State
  const [testHistory, setTestHistory] = useState<TestAttempt[]>([]);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('studentos_assessment_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setTestHistory(parsed);
      }
    } catch {}
  }, []);

  const saveHistory = (newAttempts: TestAttempt[]) => {
    setTestHistory(newAttempts);
    try {
      localStorage.setItem('studentos_assessment_history', JSON.stringify(newAttempts));
    } catch {}
  };

  const topicLabel = TOPICS.find(t => t.key === selectedTopic)?.label || selectedTopic || '';

  const startTest = async () => {
    if (!selectedTopic) return;
    setGenerating(true);
    try {
      const res = await api.post('/student-os/ai/quiz', {
        topic: topicLabel,
        count: questionCount,
        difficulty,
      });
      const quiz = res.data?.quiz || [];
      setQuestions(quiz);
      setAnswers(new Array(quiz.length).fill(null));
      setCurrentIdx(0);
      setSelectedOpt(null);
      setPhase('quiz');
    } catch {
      // High-quality fallback quiz
      const fallback: Question[] = [
        {
          question: `Which fundamental principle is central to ${topicLabel}?`,
          options: [
            'A. Time and Space Complexity Trade-off',
            'B. Unbounded linear recursion',
            'C. Monolithic tight coupling',
            'D. Static unindexed queries',
          ],
          correctAnswer: 0,
          explanation: 'Optimizing algorithmic complexity trade-offs is fundamental.',
        },
        {
          question: 'What is the standard time complexity for balanced binary search tree operations?',
          options: ['A. O(1)', 'B. O(log N)', 'C. O(N)', 'D. O(N^2)'],
          correctAnswer: 1,
          explanation: 'Balanced BST lookups, insertions, and deletions execute in O(log N).',
        },
      ];
      setQuestions(fallback);
      setAnswers(new Array(fallback.length).fill(null));
      setPhase('quiz');
    } finally {
      setGenerating(false);
    }
  };

  const handleNext = () => {
    const newAnswers = [...answers];
    newAnswers[currentIdx] = selectedOpt;
    setAnswers(newAnswers);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOpt(null);
    } else {
      finishTest(newAnswers);
    }
  };

  const finishTest = async (finalAnswers: (number | null)[]) => {
    const score = finalAnswers.reduce((sum, ans, idx) => {
      return ans === questions[idx]?.correctAnswer ? sum + 1 : sum;
    }, 0);
    const total = questions.length;
    const percentage = Math.round((score / total) * 100);

    const wrongQ = questions
      .map((q, i) =>
        finalAnswers[i] !== q.correctAnswer
          ? {
              question: q.question,
              correct: q.options[q.correctAnswer],
              explanation: q.explanation || 'Review topic fundamentals.',
            }
          : null
      )
      .filter(Boolean) as { question: string; correct: string; explanation?: string }[];

    setGeneratingReport(true);
    let reportText = '';

    try {
      const res = await api.post('/student-os/ai/assessment-report', {
        topic: topicLabel,
        score,
        total,
        wrongQuestions: wrongQ,
      });
      reportText = res.data?.report || '';
    } catch {
      reportText = `Diagnostic Evaluation Complete. Candidate scored ${score}/${total} (${percentage}%). ` +
        (percentage >= 80 ? 'Demonstrated strong domain mastery.' : 'Recommended targeted review of missed algorithmic patterns.');
    }

    const attemptRecord: TestAttempt = {
      id: `test-${Date.now()}`,
      topic: topicLabel,
      difficulty,
      score,
      total,
      percentage,
      date: new Date().toLocaleString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      wrongQuestions: wrongQ,
      reportText,
    };

    setCurrentReport(attemptRecord);
    const updatedHistory = [attemptRecord, ...testHistory];
    saveHistory(updatedHistory);
    addAssessmentResult({ topic: topicLabel, score, total, date: new Date().toISOString() });

    setGeneratingReport(false);
    setPhase('report');
  };

  const reset = () => {
    setPhase('select');
    setQuestions([]);
    setAnswers([]);
    setCurrentReport(null);
    setSelectedOpt(null);
    setCurrentIdx(0);
  };

  const q = questions[currentIdx];

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Badge className="gap-1 px-3 py-1 mb-1.5 bg-blue-50 text-blue-700 border-blue-200 text-xs font-semibold">
            <Brain size={13} className="text-blue-600" /> AI Diagnostic Engine
          </Badge>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Skill Diagnostic & Assessment</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Test technical proficiency with AI-generated questions, deep performance reports, and persistent history.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start">
          <button
            onClick={() => setActiveTab('take')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'take'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Take Test
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History size={13} /> Past History ({testHistory.length})
          </button>
        </div>
      </div>

      {/* ── TAB 1: Take Assessment ── */}
      {activeTab === 'take' && (
        <>
          {/* Topic Selection View */}
          {phase === 'select' && (
            <div className="space-y-6">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-3">
                  Choose Subject Domain
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {TOPICS.map(topic => (
                    <button
                      key={topic.key}
                      onClick={() => setSelectedTopic(topic.key)}
                      className={`p-4 rounded-3xl border text-left transition-all space-y-1.5 shadow-xs ${
                        selectedTopic === topic.key
                          ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 text-blue-950'
                          : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="text-2xl">{topic.icon}</span>
                      <p className="text-xs font-bold">{topic.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {selectedTopic && (
                <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-6 shadow-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-600 font-semibold mb-2">Question Count</p>
                      <div className="flex gap-2">
                        {[5, 10, 15].map(n => (
                          <button
                            key={n}
                            onClick={() => setQuestionCount(n)}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                              questionCount === n
                                ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-blue-400 hover:bg-blue-50/50'
                            }`}
                          >{n} Qs</button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-slate-600 font-semibold mb-2">Difficulty Level</p>
                      <div className="flex gap-2">
                        {(['easy', 'medium', 'hard'] as const).map(d => (
                          <button
                            key={d}
                            onClick={() => setDifficulty(d)}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all capitalize ${
                              difficulty === d
                                ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-blue-400 hover:bg-blue-50/50'
                            }`}
                          >{d}</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={startTest}
                    disabled={generating}
                    size="lg"
                    className="w-full gap-2 font-bold shadow-xs bg-blue-600 hover:bg-blue-700 text-white rounded-2xl"
                  >
                    {generating ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    {generating ? 'Generating AI Diagnostic Questions...' : `Launch ${topicLabel} Test`}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Interactive Quiz View */}
          {phase === 'quiz' && q && (
            <Card className="p-8 space-y-6 bg-white border-slate-200 shadow-xs rounded-3xl">
              <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-3">
                <span className="font-mono font-medium">Question {currentIdx + 1} of {questions.length}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-700 border-slate-200">{q.category || topicLabel}</Badge>
                  <Badge variant="outline" className="text-[10px] capitalize border-slate-200 text-slate-600">{difficulty}</Badge>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${((currentIdx) / questions.length) * 100}%` }}
                />
              </div>

              <h2 className="text-base font-bold text-slate-900 leading-relaxed">{q.question}</h2>

              <div className="space-y-3">
                {q.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedOpt(i)}
                    className={`w-full p-4 rounded-2xl text-left text-xs font-semibold border transition-all ${
                      selectedOpt === i
                        ? 'bg-blue-50 border-blue-600 text-blue-900 ring-1 ring-blue-500/20 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-white'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <Button
                onClick={handleNext}
                disabled={selectedOpt === null}
                size="lg"
                className="w-full gap-2 font-bold shadow-xs bg-blue-600 hover:bg-blue-700 text-white rounded-2xl"
              >
                {currentIdx + 1 === questions.length ? 'Submit & Generate Diagnostic Report' : 'Next Question'}{' '}
                <ChevronRight size={16} />
              </Button>
            </Card>
          )}

          {/* ── Enhanced Performance Report View ── */}
          {phase === 'report' && currentReport && (
            <div className="space-y-6">
              {/* Score Hero Card with Circular Ring */}
              <Card className="p-8 bg-white border-slate-200 shadow-xs rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <Badge className={`text-xs uppercase font-bold ${
                    currentReport.percentage >= 70 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {currentReport.percentage >= 70 ? 'Proficient / Passed' : 'Needs Review'}
                  </Badge>
                  <h2 className="text-2xl font-black text-slate-900">Diagnostic Score Analysis</h2>
                  <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                    Topic: <strong className="text-slate-800">{currentReport.topic}</strong> · Completed on {currentReport.date}
                  </p>
                </div>

                {/* Score Ring */}
                <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={currentReport.percentage >= 70 ? '#16a34a' : '#2563eb'}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - currentReport.percentage / 100)}`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-2xl font-black text-slate-900 font-mono">{currentReport.score}/{currentReport.total}</span>
                    <p className="text-[10px] text-slate-500 font-bold">{currentReport.percentage}%</p>
                  </div>
                </div>
              </Card>

              {/* AI Written Evaluation */}
              <Card className="p-6 bg-white border-slate-200 space-y-3 shadow-xs rounded-3xl">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles size={16} className="text-blue-600" /> AI Academic Performance Assessment
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap font-sans">
                  {currentReport.reportText}
                </p>
              </Card>

              {/* Mistake Review Accordion */}
              {currentReport.wrongQuestions.length > 0 && (
                <Card className="p-6 bg-white border-slate-200 space-y-3 rounded-3xl shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider">
                    <AlertCircle size={15} /> Weak Areas & Missed Questions ({currentReport.wrongQuestions.length})
                  </div>
                  <div className="space-y-3 pt-2">
                    {currentReport.wrongQuestions.map((wq, i) => (
                      <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <p className="text-xs font-bold text-slate-900 leading-relaxed">{i + 1}. {wq.question}</p>
                        <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 size={13} /> Correct Answer: {wq.correct}
                        </p>
                        {wq.explanation && (
                          <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                            <strong>Note:</strong> {wq.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <div className="flex gap-3">
                <Button onClick={reset} className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs">
                  <RotateCcw size={14} /> Take Another Test
                </Button>
                <Button onClick={() => setActiveTab('history')} variant="outline" className="flex-1 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl">
                  View Past History
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── TAB 2: Past Test History & Mistake Reviews ── */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {testHistory.length > 0 && (
            <div className="flex items-center justify-between px-1">
              <p className="text-xs text-slate-500 font-semibold">
                Saved Attempts: <strong className="text-slate-900">{testHistory.length}</strong> · Average Score: <strong className="text-emerald-600">{Math.round(testHistory.reduce((acc, curr) => acc + curr.percentage, 0) / testHistory.length)}%</strong>
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm('Clear all assessment history?')) {
                    saveHistory([]);
                  }
                }}
                className="text-xs text-slate-500 hover:text-red-600 h-7 px-2 rounded-lg"
              >
                Clear History
              </Button>
            </div>
          )}

          {testHistory.length === 0 ? (
            <Card className="p-12 text-center space-y-3 bg-white border-slate-200 rounded-3xl shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <History size={32} />
              </div>
              <h2 className="text-base font-bold text-slate-900">No Previous Test History</h2>
              <p className="text-slate-500 text-xs">
                Your past diagnostic attempts, score ring reports, and mistake reviews will automatically be saved here.
              </p>
              <Button onClick={() => setActiveTab('take')} className="gap-1.5 mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                Start First Test
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {testHistory.map(att => {
                const isExpanded = expandedHistoryId === att.id;
                return (
                  <Card
                    key={att.id}
                    className="p-5 bg-white border-slate-200 hover:border-slate-300 transition-all space-y-3 shadow-xs rounded-3xl"
                  >
                    <div
                      className="flex items-center justify-between gap-4 cursor-pointer select-none"
                      onClick={() => setExpandedHistoryId(isExpanded ? null : att.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-mono font-bold text-xs ${
                          att.percentage >= 70 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {att.percentage}%
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900">{att.topic}</h3>
                            <Badge variant="secondary" className="text-[10px] py-0 capitalize bg-slate-100 text-slate-600 border-slate-200">{att.difficulty}</Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Score: <strong className="text-slate-700">{att.score}/{att.total}</strong> · {att.date}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge className={`text-[10px] font-bold ${
                          att.percentage >= 70 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {att.percentage >= 70 ? 'Passed' : 'Needs Review'}
                        </Badge>
                        {isExpanded ? <ChevronUp size={16} className="text-blue-600" /> : <ChevronDown size={16} className="text-slate-400" />}
                      </div>
                    </div>

                    {/* Detailed Review Dropdown */}
                    {isExpanded && (
                      <div className="pt-3 border-t border-slate-100 space-y-4">
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {att.reportText}
                        </div>

                        {att.wrongQuestions.length > 0 ? (
                          <div className="space-y-2">
                            <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                              Missed Questions & Correct Answers:
                            </p>
                            {att.wrongQuestions.map((wq, wi) => (
                              <div key={wi} className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                                <p className="text-slate-900 font-bold">{wi + 1}. {wq.question}</p>
                                <p className="text-emerald-600 font-semibold">Correct: {wq.correct}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 size={13} /> Perfect score! No missed questions on this attempt.
                          </p>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}