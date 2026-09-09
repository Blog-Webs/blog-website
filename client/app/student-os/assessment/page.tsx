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
  { key: 'aptitude', label: 'Aptitude & Reasoning', icon: '🧠' },
  { key: 'dsa', label: 'Data Structures & Algorithms', icon: '⚙️' },
  { key: 'os', label: 'Operating Systems', icon: '💻' },
  { key: 'dbms', label: 'DBMS & SQL', icon: '🗄️' },
  { key: 'system-design', label: 'System Design', icon: '🏗️' },
  { key: 'web-dev', label: 'Web Development', icon: '🌐' },
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
    <div className="max-w-4xl mx-auto space-y-5 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight flex items-center gap-2">
            <Brain size={20} className="text-blue-600" /> Skill Diagnostic & Assessment
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Test technical proficiency with AI-generated questions, deep performance reports, and persistent history.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-gray-100 p-0.5 rounded-md border border-gray-200 self-start">
          <button
            onClick={() => setActiveTab('take')}
            className={`px-3 py-1 rounded-sm text-xs font-medium transition-colors ${
              activeTab === 'take'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Take Test
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1 rounded-sm text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <History size={12} /> Past History ({testHistory.length})
          </button>
        </div>
      </div>

      {/* ── TAB 1: Take Assessment ── */}
      {activeTab === 'take' && (
        <>
          {/* Topic Selection View */}
          {phase === 'select' && (
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
                  Choose Subject Domain
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {TOPICS.map(topic => (
                    <button
                      key={topic.key}
                      onClick={() => setSelectedTopic(topic.key)}
                      className={`p-3.5 rounded-lg border text-left transition-all space-y-1 shadow-xs ${
                        selectedTopic === topic.key
                          ? 'border-blue-600 bg-blue-50/50 text-blue-900'
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="text-xl">{topic.icon}</span>
                      <p className="text-xs font-semibold">{topic.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {selectedTopic && (
                <div className="p-5 bg-white border border-gray-200 rounded-lg space-y-4 shadow-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-700 font-medium mb-1.5">Question Count</p>
                      <div className="flex gap-2">
                        {[5, 10, 15].map(n => (
                          <button
                            key={n}
                            onClick={() => setQuestionCount(n)}
                            className={`flex-1 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                              questionCount === n
                                ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >{n} Qs</button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-700 font-medium mb-1.5">Difficulty Level</p>
                      <div className="flex gap-2">
                        {(['easy', 'medium', 'hard'] as const).map(d => (
                          <button
                            key={d}
                            onClick={() => setDifficulty(d)}
                            className={`flex-1 py-1.5 rounded-md text-xs font-medium border transition-colors capitalize ${
                              difficulty === d
                                ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >{d}</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={startTest}
                    disabled={generating}
                    className="w-full flex items-center justify-center gap-2 font-medium shadow-xs bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-xs transition-colors"
                  >
                    {generating ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    <span>{generating ? 'Generating AI Diagnostic Questions...' : `Launch ${topicLabel} Test`}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Interactive Quiz View */}
          {phase === 'quiz' && q && (
            <div className="p-6 space-y-4 bg-white border border-gray-200 shadow-xs rounded-lg">
              <div className="flex items-center justify-between text-xs text-gray-500 border-b border-gray-200 pb-2.5">
                <span className="font-mono font-medium">Question {currentIdx + 1} of {questions.length}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200 font-medium">{q.category || topicLabel}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md border border-gray-200 text-gray-600 capitalize">{difficulty}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${((currentIdx) / questions.length) * 100}%` }}
                />
              </div>

              <h2 className="text-sm font-semibold text-gray-900 leading-relaxed">{q.question}</h2>

              <div className="space-y-2">
                {q.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedOpt(i)}
                    className={`w-full p-3 rounded-md text-left text-xs font-medium border transition-colors ${
                      selectedOpt === i
                        ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={selectedOpt === null}
                className="w-full flex items-center justify-center gap-1.5 font-medium shadow-xs bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-xs transition-colors disabled:opacity-50"
              >
                <span>{currentIdx + 1 === questions.length ? 'Submit & Generate Diagnostic Report' : 'Next Question'}</span>
                <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* ── Enhanced Performance Report View ── */}
          {phase === 'report' && currentReport && (
            <div className="space-y-4">
              {/* Score Hero Card with Circular Ring */}
              <div className="p-6 bg-white border border-gray-200 shadow-xs rounded-lg flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <span className={`text-[10px] uppercase font-semibold font-mono px-2.5 py-1 rounded-md border ${
                    currentReport.percentage >= 70 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {currentReport.percentage >= 70 ? 'Proficient / Passed' : 'Needs Review'}
                  </span>
                  <h2 className="text-xl font-bold text-gray-900">Diagnostic Score Analysis</h2>
                  <p className="text-xs text-gray-500 max-w-md leading-relaxed">
                    Topic: <strong className="text-gray-800">{currentReport.topic}</strong> · Completed on {currentReport.date}
                  </p>
                </div>

                {/* Score Ring */}
                <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
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
                    <span className="text-xl font-bold text-gray-900 font-mono">{currentReport.score}/{currentReport.total}</span>
                    <p className="text-[10px] text-gray-500 font-mono font-medium">{currentReport.percentage}%</p>
                  </div>
                </div>
              </div>

              {/* AI Written Evaluation */}
              <div className="p-5 bg-white border border-gray-200 space-y-2 shadow-xs rounded-lg">
                <h3 className="text-xs font-semibold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles size={14} className="text-blue-600" /> AI Academic Performance Assessment
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap font-sans">
                  {currentReport.reportText}
                </p>
              </div>

              {/* Mistake Review Accordion */}
              {currentReport.wrongQuestions.length > 0 && (
                <div className="p-5 bg-white border border-gray-200 space-y-2.5 rounded-lg shadow-xs">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 uppercase tracking-wider">
                    <AlertCircle size={14} /> Weak Areas & Missed Questions ({currentReport.wrongQuestions.length})
                  </div>
                  <div className="space-y-2 pt-1">
                    {currentReport.wrongQuestions.map((wq, i) => (
                      <div key={i} className="p-3 rounded-md bg-gray-50 border border-gray-200 space-y-1">
                        <p className="text-xs font-semibold text-gray-900 leading-relaxed">{i + 1}. {wq.question}</p>
                        <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCircle2 size={12} /> Correct Answer: {wq.correct}
                        </p>
                        {wq.explanation && (
                          <p className="text-[11px] text-gray-500 pt-1 border-t border-gray-200">
                            <strong>Note:</strong> {wq.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button 
                  onClick={reset} 
                  className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-xs font-medium shadow-xs transition-colors"
                >
                  <RotateCcw size={13} /> Take Another Test
                </button>
                <button 
                  onClick={() => setActiveTab('history')} 
                  className="flex-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 rounded-md text-xs font-medium shadow-xs transition-colors"
                >
                  View Past History
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── TAB 2: Past Test History & Mistake Reviews ── */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {testHistory.length > 0 && (
            <div className="flex items-center justify-between px-1">
              <p className="text-xs text-gray-500 font-mono">
                Saved Attempts: <strong className="text-gray-900">{testHistory.length}</strong> · Average: <strong className="text-emerald-600">{Math.round(testHistory.reduce((acc, curr) => acc + curr.percentage, 0) / testHistory.length)}%</strong>
              </p>
              <button
                onClick={() => {
                  if (confirm('Clear all assessment history?')) {
                    saveHistory([]);
                  }
                }}
                className="text-xs text-gray-500 hover:text-red-600 px-2 py-0.5 rounded-md hover:bg-gray-100 transition-colors"
              >
                Clear History
              </button>
            </div>
          )}

          {testHistory.length === 0 ? (
            <div className="p-12 text-center space-y-3 bg-white border border-gray-200 rounded-lg shadow-xs">
              <div className="w-12 h-12 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
                <History size={24} />
              </div>
              <h2 className="text-xs font-semibold text-gray-900">No Previous Test History</h2>
              <p className="text-gray-500 text-[11px]">
                Your past diagnostic attempts, score ring reports, and mistake reviews will automatically be saved here.
              </p>
              <button 
                onClick={() => setActiveTab('take')} 
                className="gap-1.5 mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-md text-xs font-medium shadow-xs transition-colors"
              >
                Start First Test
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {testHistory.map(att => {
                const isExpanded = expandedHistoryId === att.id;
                return (
                  <div
                    key={att.id}
                    className="p-4 bg-white border border-gray-200 hover:border-gray-300 transition-colors space-y-2.5 shadow-xs rounded-lg"
                  >
                    <div
                      className="flex items-center justify-between gap-4 cursor-pointer select-none"
                      onClick={() => setExpandedHistoryId(isExpanded ? null : att.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center font-mono font-bold text-xs ${
                          att.percentage >= 70 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {att.percentage}%
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-semibold text-gray-900">{att.topic}</h3>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md capitalize bg-gray-100 text-gray-600 border border-gray-200">{att.difficulty}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5 font-mono">
                            Score: <strong className="text-gray-700">{att.score}/{att.total}</strong> · {att.date}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border ${
                          att.percentage >= 70 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {att.percentage >= 70 ? 'Passed' : 'Needs Review'}
                        </span>
                        {isExpanded ? <ChevronUp size={14} className="text-blue-600" /> : <ChevronDown size={14} className="text-gray-400" />}
                      </div>
                    </div>

                    {/* Detailed Review Dropdown */}
                    {isExpanded && (
                      <div className="pt-2.5 border-t border-gray-100 space-y-3">
                        <div className="p-3 rounded-md bg-gray-50 border border-gray-200 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {att.reportText}
                        </div>

                        {att.wrongQuestions.length > 0 ? (
                          <div className="space-y-1.5">
                            <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider">
                              Missed Questions & Correct Answers:
                            </p>
                            {att.wrongQuestions.map((wq, wi) => (
                              <div key={wi} className="p-2.5 rounded-md bg-white border border-gray-200 text-xs space-y-1">
                                <p className="text-gray-900 font-semibold">{wi + 1}. {wq.question}</p>
                                <p className="text-emerald-600 font-medium">Correct: {wq.correct}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                            <CheckCircle2 size={12} /> Perfect score! No missed questions on this attempt.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}