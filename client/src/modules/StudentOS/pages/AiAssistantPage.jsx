import { useEffect, useRef, useState } from 'react';
import { Sparkles, Send, RefreshCw, Zap, CopyCheck, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} w-full group transition-all duration-500 ease-in-out animate-in fade-in slide-in-from-bottom-2`}>
    {role === 'assistant' && (
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mr-3 mt-1 shadow-lg border border-white/10"
        style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #5EEAD4 100%)' }}>
        <Sparkles size={14} color="white" className="animate-[pulse_3s_ease-in-out_infinite]" />
      </div>
    )}
    <div
      className="max-w-[85%] px-5 py-4 rounded-2xl text-sm leading-relaxed shadow-sm break-words overflow-hidden"
      style={{
        backgroundColor: role === 'user' ? 'var(--accent)' : 'rgba(255, 255, 255, 0.03)',
        color: role === 'user' ? 'var(--bg)' : 'var(--text)',
        borderRadius: role === 'user' ? '24px 24px 6px 24px' : '24px 24px 24px 6px',
        border: role === 'assistant' ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
        backdropFilter: role === 'assistant' ? 'blur(10px)' : 'none',
      }}>
      {role === 'assistant' ? (
        <div className="prose prose-sm prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      ) : (
        <div className="whitespace-pre-wrap">{content}</div>
      )}
    </div>
  </div>
);

const FlashcardPanel = ({ cards }) => {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          Card {idx + 1} of {cards.length}
        </p>
        <div className="flex gap-2">
          <button onClick={() => { setIdx(Math.max(0, idx - 1)); setFlipped(false); }}
            disabled={idx === 0} className="px-4 py-1.5 text-xs rounded-full border transition-all duration-300 hover:bg-white/5 active:scale-95"
            style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'var(--text)', opacity: idx === 0 ? 0.4 : 1, backdropFilter: 'blur(8px)' }}>
            Prev
          </button>
          <button onClick={() => { setIdx(Math.min(cards.length - 1, idx + 1)); setFlipped(false); }}
            disabled={idx === cards.length - 1} className="px-4 py-1.5 text-xs rounded-full border transition-all duration-300 hover:bg-white/5 active:scale-95"
            style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'var(--text)', opacity: idx === cards.length - 1 ? 0.4 : 1, backdropFilter: 'blur(8px)' }}>
            Next
          </button>
        </div>
      </div>
      <div
        onClick={() => setFlipped(!flipped)}
        className="cursor-pointer p-8 rounded-3xl border text-center transition-all duration-500 hover:shadow-lg relative overflow-hidden"
        style={{ 
          backgroundColor: flipped ? 'rgba(52, 211, 153, 0.05)' : 'rgba(255, 255, 255, 0.02)', 
          borderColor: flipped ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255, 255, 255, 0.1)', 
          minHeight: 180,
          backdropFilter: 'blur(12px)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}>
        <div className="flex flex-col h-full justify-center items-center" style={{ transform: flipped ? 'rotateY(180deg)' : 'none' }}>
          <p className="text-xs mb-4 uppercase tracking-wider font-semibold" style={{ color: flipped ? '#34D399' : 'var(--text-muted)' }}>
            {flipped ? 'Answer' : 'Question — click to flip'}
          </p>
          <p className="text-lg font-medium leading-relaxed max-w-2xl mx-auto">
            {flipped ? cards[idx].answer : cards[idx].question}
          </p>
        </div>
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
    <div className="text-center p-12 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md animate-in zoom-in duration-500 shadow-2xl">
      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-[#34D399] to-[#3B82F6] flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
        <span className="text-2xl text-white font-bold">{score}/{questions.length}</span>
      </div>
      <p className="text-2xl font-bold mb-2">{score === questions.length ? 'Outstanding!' : score >= questions.length / 2 ? 'Great effort!' : 'Keep reviewing!'}</p>
      <p style={{ color: 'var(--text-muted)' }}>You've completed the quiz on this topic.</p>
    </div>
  );

  return (
    <div className="space-y-6 p-6 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>Question {qi + 1} of {questions.length}</p>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === qi ? 'w-6 bg-[var(--accent)]' : i < qi ? 'w-2 bg-[var(--accent)] opacity-50' : 'w-2 bg-white/10'}`} />
          ))}
        </div>
      </div>
      
      <p className="text-lg font-medium leading-relaxed">{q.question}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        {q.options.map((opt) => (
          <button key={opt} onClick={() => handleAnswer(opt)}
            className="p-4 rounded-2xl text-sm text-left border transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden group"
            style={{
              borderColor: selected === opt ? (opt === q.answer ? '#34D399' : '#F87171') : 'rgba(255,255,255,0.05)',
              backgroundColor: selected === opt ? (opt === q.answer ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)') : 'rgba(255,255,255,0.03)',
              color: 'var(--text)',
              backdropFilter: 'blur(10px)',
            }}>
            <span className="relative z-10">{opt}</span>
            {!selected && <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />}
          </button>
        ))}
      </div>
      
      {selected && q.explanation && (
        <div className="mt-4 p-4 rounded-2xl animate-in slide-in-from-top-2 duration-300 border border-white/5" style={{ backgroundColor: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', backdropFilter: 'blur(10px)' }}>
          <p className="text-sm flex items-start gap-2">
            <span className="text-[var(--accent)] shrink-0">💡</span> 
            {q.explanation}
          </p>
        </div>
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
    <div className="h-full flex flex-col w-full max-w-full px-4 md:px-8 py-6 space-y-6 transition-all duration-500">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-xs font-mono-display uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>// studentos.ai</p>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            AI Assistant
            {!aiAvailable && (
              <span className="text-xs px-3 py-1 rounded-full border shadow-sm" style={{ backgroundColor: 'rgba(248,113,113,0.1)', color: '#F87171', borderColor: 'rgba(248,113,113,0.2)' }}>
                Missing API Key
              </span>
            )}
          </h1>
        </div>

        {/* Tab selector - Glassmorphism */}
        <div className="flex gap-1 p-1.5 rounded-2xl border shadow-lg backdrop-blur-xl transition-all duration-300" style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}>
          {['chat', 'flashcards', 'quiz'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: tab === t ? 'var(--accent)' : 'transparent',
                color: tab === t ? 'var(--bg)' : 'var(--text-muted)',
                boxShadow: tab === t ? '0 4px 14px 0 rgba(0,0,0,0.2)' : 'none'
              }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full flex flex-col min-h-0 bg-transparent relative">
        {/* Chat */}
        {tab === 'chat' && (
          <div className="flex flex-col h-full absolute inset-0 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex-1 overflow-y-auto space-y-6 py-4 pr-4 custom-scrollbar rounded-3xl">
              {messages.map((m, i) => <Message key={i} role={m.role} content={m.content} />)}
              {loading && (
                <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg border border-white/20"
                    style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #5EEAD4 100%)' }}>
                    <Sparkles size={14} color="white" className="animate-spin-slow" />
                  </div>
                  <div className="flex items-center gap-1.5 px-5 py-4 rounded-2xl border backdrop-blur-md shadow-sm" style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.05)' }}>
                    <span className="text-sm font-medium" style={{ color: 'var(--accent)', background: 'linear-gradient(to right, var(--accent), #5EEAD4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                      Gemini is thinking
                    </span>
                    <div className="flex gap-1 ml-1">
                      {[0, 1, 2].map((i) => (
                        <span key={i} className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: 'var(--accent)', animation: `bounce 1.4s infinite ease-in-out both`, animationDelay: `${i * 0.16}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} className="h-4" />
            </div>

            <div className="pt-2 pb-4 mt-auto">
              {/* Quick prompts */}
              <div className="flex flex-wrap gap-2 mb-4">
                {QUICK_PROMPTS.map((p) => (
                  <button key={p} onClick={() => sendMessage(p)}
                    className="text-xs px-4 py-2 rounded-full border backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm"
                    style={{ 
                      borderColor: 'rgba(255,255,255,0.1)', 
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      color: 'var(--text-muted)' 
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'; }}
                    >
                    {p}
                  </button>
                ))}
              </div>

              {/* Input - Glassmorphism */}
              <div className="flex gap-3 relative group">
                <div className="absolute -inset-0.5 rounded-3xl opacity-20 blur-md transition duration-500 group-hover:opacity-40" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #3B82F6 100%)' }}></div>
                <div className="flex-1 flex items-center gap-3 px-6 py-4 rounded-3xl border relative shadow-xl backdrop-blur-2xl transition-all duration-300"
                  style={{ backgroundColor: 'rgba(20,20,20,0.6)', borderColor: 'rgba(255,255,255,0.15)' }}>
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="Ask Gemini anything about your studies..."
                    className="flex-1 bg-transparent text-base outline-none w-full"
                    style={{ color: 'var(--text)' }}
                  />
                </div>
                
                {/* Submit button - Glassmorphism */}
                <button
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  className="w-14 h-14 rounded-3xl flex items-center justify-center relative shadow-lg overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{ 
                    background: 'linear-gradient(135deg, var(--accent) 0%, #3B82F6 100%)', 
                    opacity: loading || !input.trim() ? 0.6 : 1,
                    filter: loading || !input.trim() ? 'grayscale(30%)' : 'none'
                  }}>
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  <Send size={20} color="white" className={`relative z-10 ${!loading && input.trim() ? 'hover:translate-x-0.5 hover:-translate-y-0.5 transition-transform' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Flashcards */}
        {tab === 'flashcards' && (
          <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300 pt-4">
            <div className="space-y-4 p-6 rounded-3xl border border-white/10 shadow-xl backdrop-blur-xl" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <input value={studyTopic} onChange={(e) => setStudyTopic(e.target.value)}
                placeholder="Topic name (e.g. DBMS, Operating Systems...)"
                className="w-full px-5 py-4 rounded-2xl border text-base outline-none transition-all duration-300 focus:border-[var(--accent)]"
                style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.2)', color: 'var(--text)' }} />
              <textarea value={studyContent} onChange={(e) => setStudyContent(e.target.value)}
                placeholder="Paste your notes, lecture content, or topic summary here..."
                rows={6}
                className="w-full px-5 py-4 rounded-2xl border text-base outline-none resize-none transition-all duration-300 focus:border-[var(--accent)]"
                style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.2)', color: 'var(--text)' }} />
              <button onClick={generateFlashcards} disabled={generating || !studyContent.trim()}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-base font-semibold shadow-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #3B82F6 100%)', color: 'white', opacity: !studyContent.trim() ? 0.6 : 1 }}>
                <div className="absolute inset-0 bg-white/20 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                {generating ? <RefreshCw size={18} className="animate-spin relative z-10" /> : <Sparkles size={18} className="relative z-10" />}
                <span className="relative z-10">{generating ? 'Generating Flashcards with Gemini...' : 'Generate Flashcards'}</span>
              </button>
            </div>
            {flashcards && flashcards.length > 0 && <FlashcardPanel cards={flashcards} />}
          </div>
        )}

        {/* Quiz */}
        {tab === 'quiz' && (
          <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300 pt-4">
            {!quiz ? (
              <div className="space-y-4 p-6 rounded-3xl border border-white/10 shadow-xl backdrop-blur-xl" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <input value={studyTopic} onChange={(e) => setStudyTopic(e.target.value)}
                  placeholder="Topic name (e.g. Data Structures)..."
                  className="w-full px-5 py-4 rounded-2xl border text-base outline-none transition-all duration-300 focus:border-[var(--accent)]"
                  style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.2)', color: 'var(--text)' }} />
                <textarea value={studyContent} onChange={(e) => setStudyContent(e.target.value)}
                  placeholder="Paste your study content here to generate a custom quiz..."
                  rows={6}
                  className="w-full px-5 py-4 rounded-2xl border text-base outline-none resize-none transition-all duration-300 focus:border-[var(--accent)]"
                  style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.2)', color: 'var(--text)' }} />
                <button onClick={generateQuiz} disabled={generating || !studyContent.trim()}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-base font-semibold shadow-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #8B5CF6 100%)', color: 'white', opacity: !studyContent.trim() ? 0.6 : 1 }}>
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  {generating ? <RefreshCw size={18} className="animate-spin relative z-10" /> : <Zap size={18} className="relative z-10" />}
                  <span className="relative z-10">{generating ? 'Generating Quiz with Gemini...' : 'Generate AI Quiz'}</span>
                </button>
              </div>
            ) : (
              <div>
                <button onClick={() => setQuiz(null)} className="flex items-center gap-2 text-sm font-medium mb-6 px-4 py-2 rounded-xl transition-all duration-300 hover:bg-white/5 active:scale-95" style={{ color: 'var(--accent)' }}>
                  ← Create New Quiz
                </button>
                <QuizPanel questions={quiz} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AiAssistantPage;
