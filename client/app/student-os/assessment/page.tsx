'use client';

import React, { useState } from 'react';
import { Brain, Trophy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AssessmentQuestion } from '@/types/studentos';

const QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'q-1',
    question: 'What is the worst-case time complexity of QuickSort when bad pivot choices recur?',
    options: ['O(n log n)', 'O(n^2)', 'O(n)', 'O(log n)'],
    correctAnswer: 1,
    category: 'Algorithms',
  },
  {
    id: 'q-2',
    question: 'In Next.js App Router, how do you specify a Client Component boundary?',
    options: ['use client directive at line 1', 'React.useClient() hook', 'export default client()', 'Define inside pages/'],
    correctAnswer: 0,
    category: 'Next.js & Frontend',
  },
];

export default function AssessmentPage() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const handleNext = () => {
    if (selectedOpt === QUESTIONS[currentIdx].correctAnswer) {
      setScore((prev) => prev + 1);
    }
    if (currentIdx + 1 < QUESTIONS.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOpt(null);
    } else {
      setIsFinished(true);
    }
  };

  const q = QUESTIONS[currentIdx];

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6">
      <div className="text-center space-y-2">
        <Badge variant="apple" className="gap-1 px-3 py-1">
          <Brain size={13} /> AI Diagnostic Assessment
        </Badge>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Skill Assessment</h1>
        <p className="text-xs text-zinc-400">Evaluate technical proficiency to refine AI recommendations.</p>
      </div>

      {!isFinished ? (
        <Card className="p-8 space-y-6 bg-zinc-950 border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800 pb-3">
            <span>Question {currentIdx + 1} of {QUESTIONS.length}</span>
            <Badge variant="secondary" className="text-[10px]">{q.category}</Badge>
          </div>

          <h2 className="text-base font-semibold text-white leading-relaxed">{q.question}</h2>

          <div className="space-y-3">
            {q.options.map((opt, i) => (
              <button
                key={opt}
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

          <Button
            onClick={handleNext}
            disabled={selectedOpt === null}
            variant="apple"
            size="lg"
            className="w-full"
          >
            {currentIdx + 1 === QUESTIONS.length ? 'Finish Assessment' : 'Next Question'}
          </Button>
        </Card>
      ) : (
        <Card className="p-8 text-center space-y-4 bg-zinc-950 border-emerald-500/30">
          <Trophy size={48} className="text-amber-400 mx-auto" />
          <h2 className="text-2xl font-bold text-white">Assessment Complete!</h2>
          <p className="text-zinc-300 text-sm">
            Score: <strong className="text-emerald-400 font-bold">{score} / {QUESTIONS.length}</strong>
          </p>
          <Button
            variant="secondary"
            onClick={() => { setCurrentIdx(0); setSelectedOpt(null); setScore(0); setIsFinished(false); }}
          >
            Retake Quiz
          </Button>
        </Card>
      )}
    </div>
  );
}
