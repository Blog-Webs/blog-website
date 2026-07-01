import { useEffect, useRef, useState } from 'react';
import { Sparkles, Send, RefreshCw, Zap, CopyCheck, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { studentOSApi } from '../api';

const QUICK_PROMPTS = [
  "What assignments are due tomorrow?",
  "Summarize my recent emails",
  "Find my latest Drive files",
  "What's on my calendar this week?",
  "What are my high priority tasks?",
  "Show me exam-related events",
];

const Message = ({ role, content }) => (
  <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
    {role === 'assistant' && (
      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mr-2 mt-1"
        style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #5EEAD4 100%)' }}>
        <Sparkles size={13} color="white" />
      </div>
    )}
    <div
      className="max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
      style={{
        backgroundColor: role === 'user' ? 'var(--accent)' : 'var(--surface)',
        color: role === 'user' ? 'var(--bg)' : 'var(--text)',
        borderRadius: role === 'user' ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
      }}>
      {content}
    </div>
  </div>
);

const FlashcardPanel = ({ cards }) => {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          Card {idx + 1} of {cards.length}
        </p>
        <div className="flex gap-2">
          <button onClick={() => { setIdx(Math.max(0, idx - 1)); setFlipped(false); }}
            disabled={idx === 0} className="px-3 py-1 text-xs rounded-lg border btn-press"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', opacity: idx === 0 ? 0.4 : 1 }}>
            Prev
          </button>
          <button onClick={() => { setIdx(Math.min(cards.length - 1, idx + 1)); setFlipped(false); }}
            disabled={idx === cards.length - 1} className="px-3 py-1 text-xs rounded-lg border btn-press"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', opacity: idx === cards.length - 1 ? 0.4 : 1 }}>
            Next
          </button>
        </div>
      </div>
      <div
        onClick={() => setFlipped(!flipped)}
        className="cursor-pointer p-8 rounded-2xl border text-center transition-all duration-300"
        style={{ backgroundColor: flipped ? 'var(--accent-soft)' : 'var(--surface)', borderColor: flipped ? 'var(--accent)' : 'var(--border)', minHeight: 140 }}>
        <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{flipped ? 'Answer' : 'Question — click to flip'}</p>
        <p className="text-base font-medium">{flipped ? cards[idx].answer : cards[idx].question}</p>
      </div>
    </div>
  );
};

const QuizPanel = ({ questions }) => {
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[qi];
  const handleAnswer = (opt) => {
    if (selected) return;
    setSelected(opt);
    if (opt === q.answer) setScore((s) => s + 1);
    setTimeout(() => {
      if (qi < questions.length - 1) { setQi(qi + 1); setSelected(null); }
      else setDone(true);
    }, 1500);
  };

  if (done) return (
    <div className="text-center p-8">
      <p className="text-4xl font-bold mb-2">{score}/{questions.length}</p>
      <p style={{ color: 'var(--text-muted)' }}>{score === questions.length ? '🎉 Perfect!' : score >= questions.length / 2 ? '👍 Good job!' : '📖 Keep studying!'}</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Q {qi + 1}/{questions.length}</p>
      <p className="font-medium">{q.question}</p>
      <div className="grid grid-cols-2 gap-2">
        {q.options.map((opt) => (
          <button key={opt} onClick={() => handleAnswer(opt)}
            className="p-3 rounded-xl text-sm text-left border btn-press transition-all"
            style={{
              borderColor: selected === opt ? (opt === q.answer ? '#34D399' : '#F87171') : 'var(--border)',
              backgroundColor: selected === opt ? (opt === q.answer ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)') : 'var(--surface)',
              color: 'var(--text)',
            }}>
            {opt}
          </button>
        ))}
      </div>
      {selected && q.explanation && (
        <p className="text-xs p-3 rounded-xl" style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--text-muted)' }}>
          💡 {q.explanation}
        </p>
      )}
    </div>
  );
};

const AiAssistantPage = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your StudentOS AI assistant. Ask me about your assignments, emails, Drive files, or calendar. I can also generate flashcards and quizzes!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(true);
  const [tab, setTab] = useState('chat');
  const [studyContent, setStudyContent] = useState('');
  const [studyTopic, setStudyTopic] = useState('');
  const [flashcards, setFlashcards] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [generating, setGenerating] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    studentOSApi.getAiStatus()
      .then(({ data }) => setAiAvailable(data.available))
      .catch(() => setAiAvailable(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (msg) => {
    const text = (msg || input).trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);
    try {
      const { data } = await studentOSApi.chat(text);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply || data.message }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I ran into an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const generateFlashcards = async () => {
    if (!studyContent.trim()) return;
    setGenerating(true);
    setFlashcards(null);
    try {
      const { data } = await studentOSApi.flashcards(studyContent, studyTopic);
      setFlashcards(data.flashcards);
    } finally {
      setGenerating(false);
    }
  };

  const generateQuiz = async () => {
    if (!studyContent.trim()) return;
    setGenerating(true);
    setQuiz(null);
    try {
      const { data } = await studentOSApi.quiz(studyContent, studyTopic);
      setQuiz(data.quiz);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto p-6 space-y-4">
      <div>
        <p className="text-xs font-mono-display" style={{ color: 'var(--accent)' }}>// studentos.ai</p>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          AI Assistant
          {!aiAvailable && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(255,180,84,0.15)', color: '#FFB454' }}>
              No API Key
            </span>
          )}
        </h1>
      </div>

      {/* Tab selector */}
      <div className="flex gap-1 p-1 rounded-xl border w-fit" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        {['chat', 'flashcards', 'quiz'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2 rounded-lg text-sm font-medium capitalize btn-press transition-all"
            style={{
              backgroundColor: tab === t ? 'var(--accent)' : 'transparent',
              color: tab === t ? 'var(--bg)' : 'var(--text-muted)',
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* Chat */}
      {tab === 'chat' && (
        <div className="flex flex-col flex-1 min-h-[500px]">
          <div className="flex-1 overflow-y-auto space-y-4 py-2 pr-2" style={{ maxHeight: 460 }}>
            {messages.map((m, i) => <Message key={i} role={m.role} content={m.content} />)}
            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #5EEAD4 100%)' }}>
                  <Sparkles size={13} color="white" />
                </div>
                <div className="flex items-center gap-1 px-4 py-3 rounded-2xl" style={{ backgroundColor: 'var(--surface)' }}>
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-2 h-2 rounded-full animate-bounce"
                      style={{ backgroundColor: 'var(--accent)', animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          <div className="flex flex-wrap gap-2 mt-2">
            {QUICK_PROMPTS.map((p) => (
              <button key={p} onClick={() => sendMessage(p)}
                className="text-xs px-3 py-1.5 rounded-full border btn-press transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                {p}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2 mt-3">
            <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-2xl border"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask anything about your studies..."
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: 'var(--text)' }}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="w-12 h-12 rounded-2xl flex items-center justify-center btn-press"
              style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #5EEAD4 100%)', opacity: loading || !input.trim() ? 0.5 : 1 }}>
              <Send size={16} color="white" />
            </button>
          </div>
        </div>
      )}

      {/* Flashcards */}
      {tab === 'flashcards' && (
        <div className="space-y-5">
          <div className="space-y-3">
            <input value={studyTopic} onChange={(e) => setStudyTopic(e.target.value)}
              placeholder="Topic name (e.g. DBMS, Operating Systems...)"
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text)' }} />
            <textarea value={studyContent} onChange={(e) => setStudyContent(e.target.value)}
              placeholder="Paste your notes, lecture content, or topic summary here..."
              rows={6}
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text)' }} />
            <button onClick={generateFlashcards} disabled={generating || !studyContent.trim()}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium btn-press"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)', opacity: !studyContent.trim() ? 0.5 : 1 }}>
              {generating ? <RefreshCw size={15} className="animate-spin" /> : <Sparkles size={15} />}
              {generating ? 'Generating...' : 'Generate Flashcards'}
            </button>
          </div>
          {flashcards && flashcards.length > 0 && <FlashcardPanel cards={flashcards} />}
        </div>
      )}

      {/* Quiz */}
      {tab === 'quiz' && (
        <div className="space-y-5">
          {!quiz ? (
            <div className="space-y-3">
              <input value={studyTopic} onChange={(e) => setStudyTopic(e.target.value)}
                placeholder="Topic name..."
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text)' }} />
              <textarea value={studyContent} onChange={(e) => setStudyContent(e.target.value)}
                placeholder="Paste your study content..."
                rows={6}
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text)' }} />
              <button onClick={generateQuiz} disabled={generating || !studyContent.trim()}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium btn-press"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)', opacity: !studyContent.trim() ? 0.5 : 1 }}>
                {generating ? <RefreshCw size={15} className="animate-spin" /> : <Zap size={15} />}
                {generating ? 'Generating...' : 'Generate Quiz'}
              </button>
            </div>
          ) : (
            <div>
              <button onClick={() => setQuiz(null)} className="text-xs mb-4 btn-press" style={{ color: 'var(--accent)' }}>
                ← New Quiz
              </button>
              <QuizPanel questions={quiz} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AiAssistantPage;
