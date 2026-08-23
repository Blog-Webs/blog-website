'use client';

import React, { useState } from 'react';
import { Brain, Trophy, RefreshCw, Sparkles, CheckCircle2, X, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRoadmap } from '@/context/RoadmapContext';
import api from '@/lib/api';

const TOPICS = [
  { key: 'aptitude', label: 'Aptitude & Reasoning', icon: '🧠', color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
  { key: 'dsa', label: 'Data Structures & Algorithms', icon: '⚙️', color: 'text-blue-400 border-blue-500/40 bg-blue-500/10' },
  { key: 'os', label: 'Operating Systems', icon: '💻', color: 'text-purple-400 border-purple-500/40 bg-purple-500/10' },
  { key: 'dbms', label: 'DBMS & SQL', icon: '🗄️', color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10' },
  { key: 'system-design', label: 'System Design', icon: '🏗️', color: 'text-rose-400 border-rose-500/40 bg-rose-500/10' },
  { key: 'web-dev', label: 'Web Development', icon: '🌐', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
];

type Question = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  category?: string;
};

type Report = {
  report: string;
  score: number;
  total: number;
  percentage: number;
};

export default function AssessmentPage() {
  const { addAssessmentResult } = useRoadmap();

  const [phase, setPhase] = useState<'select' | 'quiz' | 'report'>('select');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [generating, setGenerating] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [report, setReport] = useState<Report | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);

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
      setSubmitted(false);
      setPhase('quiz');
    } catch {
      // fallback
      setQuestions([{
        question: `What is a key concept in ${topicLabel}?`,
        options: ['A. Option A', 'B. Option B', 'C. Option C', 'D. Option D'],
        correctAnswer: 0,
        explanation: 'Option A is correct.',
      }]);
      setAnswers([null]);
      setPhase('quiz');
    }
    setGenerating(false);
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

    setGeneratingReport(true);
    try {
      const wrongQ = questions
        .map((q, i) => finalAnswers[i] !== q.correctAnswer ? { question: q.question, correct: q.options[q.correctAnswer] } : null)
        .filter(Boolean);

      const res = await api.post('/student-os/ai/assessment-report', {
        topic: topicLabel,
        score,
        total,
        wrongQuestions: wrongQ,
      });
      setReport(res.data);
    } catch {
      setReport({ report: `Assessment complete! You scored ${score}/${total} (${Math.round(score/total*100)}%). Review the wrong answers to improve.`, score, total, percentage: Math.round(score/total*100) });
    }

    addAssessmentResult({ topic: topicLabel, score, total, date: new Date().toISOString() });
    setGeneratingReport(false);
    setPhase('report');
  };

  const reset = () => {
    setPhase('select');
    setQuestions([]);
    setAnswers([]);
    setReport(null);
    setSelectedOpt(null);
    setCurrentIdx(0);
  };

  const q = questions[currentIdx];

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      <div className="text-center space-y-2">
        <Badge variant="apple" className="gap-1 px-3 py-1"><Brain size={13} /> AI Diagnostic Assessment</Badge>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Skill Assessment</h1>
        <p className="text-xs text-zinc-400">AI-generated diagnostic tests to evaluate technical proficiency.</p>
      </div>

      {/* Topic Selection */}
      {phase === 'select' && (
        <div className="space-y-6">
          <div>
            <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-3">Choose a Subject</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {TOPICS.map(topic => (
                <button
                  key={topic.key}
                  onClick={() => setSelectedTopic(topic.key)}
                  className={`p-4 rounded-xl border text-left transition-all space-y-1 ${
                    selectedTopic === topic.key ? topic.color : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                  }`}
                >
                  <span className="text-xl">{topic.icon}</span>
                  <p className="text-xs font-semibold">{topic.label}</p>
                </button>
              ))}
            </div>
          </div>

          {selectedTopic && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-400 font-medium mb-2">Questions Count</p>
                  <div className="flex gap-2">
                    {[5, 10, 15].map(n => (
                      <button
                        key={n}
                        onClick={() => setQuestionCount(n)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                          questionCount === n ? 'bg-blue-500/20 border-blue-400 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                        }`}
                      >{n} Qs</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-zinc-400 font-medium mb-2">Difficulty</p>
                  <div className="flex gap-2">
                    {(['easy','medium','hard'] as const).map(d => (
                      <button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all capitalize ${
                          difficulty === d ? 'bg-blue-500/20 border-blue-400 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                        }`}
                      >{d}</button>
                    ))}
                  </div>
                </div>
              </div>

              <Button onClick={startTest} disabled={generating} variant="apple" size="lg" className="w-full gap-2">
                {generating ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {generating ? 'Generating AI Quiz...' : `Start ${topicLabel} Assessment`}
              </Button>
            </>
          )}
        </div>
      )}

      {/* Quiz */}
      {phase === 'quiz' && q && (
        <Card className="p-8 space-y-6 bg-zinc-950 border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800 pb-3">
            <span>Question {currentIdx + 1} of {questions.length}</span>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-[10px]">{q.category || topicLabel}</Badge>
              <Badge variant="secondary" className="text-[10px] capitalize">{difficulty}</Badge>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 transition-all" style={{ width: `${((currentIdx) / questions.length) * 100}%` }} />
          </div>

          <h2 className="text-base font-semibold text-white leading-relaxed">{q.question}</h2>

          <div className="space-y-3">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setSelectedOpt(i)}
                className={`w-full p-4 rounded-xl text-left text-xs font-medium border transition-all ${
                  selectedOpt === i
                    ? 'bg-blue-500/20 border-blue-400 text-white shadow-md'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <Button onClick={handleNext} disabled={selectedOpt === null} variant="apple" size="lg" className="w-full gap-2">
            {currentIdx + 1 === questions.length ? 'Submit Assessment' : 'Next Question'} <ChevronRight size={16} />
          </Button>
        </Card>
      )}

      {/* Report */}
      {phase === 'report' && (
        <div className="space-y-6">
          {generatingReport ? (
            <Card className="p-12 text-center space-y-4">
              <Sparkles size={40} className="text-blue-400 mx-auto animate-pulse" />
              <p className="text-zinc-400 text-sm">Generating AI performance analysis...</p>
            </Card>
          ) : report ? (
            <>
              <Card className={`p-8 text-center space-y-4 border ${report.percentage >= 70 ? 'border-emerald-500/30 bg-emerald-950/20' : 'border-amber-500/30 bg-amber-950/20'}`}>
                <Trophy size={48} className={`mx-auto ${report.percentage >= 70 ? 'text-amber-400' : 'text-zinc-400'}`} />
                <h2 className="text-2xl font-bold text-white">Assessment Complete!</h2>
                <p className="text-zinc-300 text-sm">
                  Score: <strong className={`font-bold text-lg ${report.percentage >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>{report.score} / {report.total} ({report.percentage}%)</strong>
                </p>
              </Card>

              <Card className="p-6 space-y-3 bg-zinc-950 border-zinc-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles size={16} className="text-blue-400" /> AI Performance Report
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">{report.report}</p>
              </Card>
            </>
          ) : null}

          <div className="flex gap-3">
            <Button onClick={reset} variant="secondary" className="flex-1">Take Another Test</Button>
            <Button onClick={() => { setPhase('select'); setSelectedTopic(null); }} variant="ghost" className="flex-1">Change Topic</Button>
          </div>
        </div>
      )}
    </div>
  );
}