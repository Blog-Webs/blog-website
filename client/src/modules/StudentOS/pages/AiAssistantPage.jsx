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
      <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mr-3 mt-1 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
        <Sparkles size={14} className="text-blue-400 animate-[pulse_3s_ease-in-out_infinite]" />
      </div>
    )}
    <div
      className="max-w-[85%] px-5 py-4 text-sm leading-relaxed shadow-sm break-words overflow-hidden"
      style={{
        backgroundColor: role === 'user' ? '#3b82f6' : '#161b22',
        color: role === 'user' ? '#ffffff' : '#d1d5db',
        borderRadius: role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
        border: role === 'assistant' ? '1px solid #30363d' : 'none',
      }}>
      {role === 'assistant' ? (
        <div className="prose prose-sm prose-invert max-w-none text-gray-300">
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
        <p className="text-xs font-semibold text-gray-500 tracking-wider uppercase">
          Card {idx + 1} of {cards.length}
        </p>
        <div className="flex gap-2">
          <button onClick={() => { setIdx(Math.max(0, idx - 1)); setFlipped(false); }}
            disabled={idx === 0} className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#161b22] border border-[#30363d] text-gray-300 hover:bg-[#21262d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Prev
          </button>
          <button onClick={() => { setIdx(Math.min(cards.length - 1, idx + 1)); setFlipped(false); }}
            disabled={idx === cards.length - 1} className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#161b22] border border-[#30363d] text-gray-300 hover:bg-[#21262d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Next
          </button>
        </div>
      </div>
      <div
        onClick={() => setFlipped(!flipped)}
        className={`cursor-pointer p-8 rounded-2xl border transition-all duration-500 relative overflow-hidden ${
          flipped ? 'bg-[#065f46]/20 border-[#34d399]/30 shadow-[0_0_20px_rgba(52,211,153,0.1)]' : 'bg-[#161b22] border-[#30363d] hover:border-gray-500'
        }`}
        style={{ 
          minHeight: 220,
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}>
        <div className="flex flex-col h-full justify-center items-center" style={{ transform: flipped ? 'rotateY(180deg)' : 'none' }}>
          <p className={`text-xs mb-4 uppercase tracking-wider font-bold ${flipped ? 'text-[#34d399]' : 'text-gray-500'}`}>
            {flipped ? 'Answer' : 'Question — click to flip'}
          </p>
          <p className="text-xl font-medium leading-relaxed text-center max-w-2xl mx-auto text-gray-200">
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
    <div className="text-center p-12 rounded-2xl border border-[#30363d] bg-[#161b22] shadow-xl animate-in zoom-in duration-500">
      <div className="w-24 h-24 mx-auto rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
        <span className="text-3xl text-blue-400 font-bold">{score}/{questions.length}</span>
      </div>
      <p className="text-2xl font-bold mb-3 text-white">{score === questions.length ? 'Outstanding!' : score >= questions.length / 2 ? 'Great effort!' : 'Keep reviewing!'}</p>
      <p className="text-gray-400">You've completed the quiz on this topic.</p>
    </div>
  );

  return (
    <div className="space-y-6 p-8 rounded-2xl border border-[#30363d] bg-[#161b22] shadow-lg animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <p className="text-xs uppercase tracking-wider font-bold text-gray-500">Question {qi + 1} of {questions.length}</p>
        <div className="flex gap-1.5">
          {questions.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === qi ? 'w-8 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]' : i < qi ? 'w-3 bg-blue-500 opacity-50' : 'w-3 bg-[#30363d]'}`} />
          ))}
        </div>
      </div>
      
      <p className="text-xl font-semibold leading-relaxed text-gray-200 mt-2">{q.question}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {q.options.map((opt) => {
          let stateClass = 'border-[#30363d] bg-[#0d1117] text-gray-300 hover:border-gray-500 hover:bg-[#21262d]';
          if (selected === opt) {
            stateClass = opt === q.answer 
              ? 'border-[#34d399] bg-[#065f46]/20 text-[#34d399] shadow-[0_0_15px_rgba(52,211,153,0.15)]' 
              : 'border-[#ef4444] bg-[#7f1d1d]/20 text-[#ef4444] shadow-[0_0_15px_rgba(239,68,68,0.15)]';
          }
          return (
            <button key={opt} onClick={() => handleAnswer(opt)}
              className={`p-5 rounded-xl text-sm font-medium text-left border transition-all duration-300 ${stateClass}`}>
              {opt}
            </button>
          );
        })}
      </div>
      
      {selected && q.explanation && (
        <div className="mt-6 p-5 rounded-xl animate-in slide-in-from-top-2 duration-300 border border-blue-500/30 bg-blue-500/10 text-gray-300 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
          <p className="text-sm flex items-start gap-3">
            <Sparkles size={16} className="text-blue-400 shrink-0 mt-0.5" /> 
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
    <div className="h-full flex flex-col w-full px-10 py-8 max-w-7xl mx-auto space-y-8 bg-[#0d1117] text-white font-sans transition-all duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <p className="text-sm font-mono text-gray-500">// studentos.ai</p>
          <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            AI Assistant
            {!aiAvailable && (
              <span className="text-xs px-3 py-1 rounded-full bg-[#7f1d1d]/20 border border-[#ef4444]/30 text-[#ef4444] shadow-sm ml-2 font-semibold">
                Missing API Key
              </span>
            )}
          </h1>
          <p className="text-gray-400 text-sm">Your intelligent study companion and workflow automation</p>
        </div>

        {/* Tab selector */}
        <div className="flex gap-1 items-center pb-2">
          {['chat', 'flashcards', 'quiz'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-xs font-semibold capitalize transition-colors ${
                tab === t 
                  ? 'bg-[#30363d] text-white' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#161b22]'
              }`}>
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
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                    <Sparkles size={14} className="text-blue-400 animate-spin-slow" />
                  </div>
                  <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#161b22] border border-[#30363d]">
                    <span className="text-sm font-semibold text-blue-400 animate-pulse">
                      Thinking
                    </span>
                    <div className="flex gap-1 ml-1">
                      {[0, 1, 2].map((i) => (
                        <span key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400"
                          style={{ animation: `bounce 1.4s infinite ease-in-out both`, animationDelay: `${i * 0.16}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} className="h-4" />
            </div>

            <div className="pt-4 pb-2 mt-auto">
              {/* Quick prompts */}
              <div className="flex flex-wrap gap-2 mb-4">
                {QUICK_PROMPTS.map((p) => (
                  <button key={p} onClick={() => sendMessage(p)}
                    className="text-xs font-medium px-4 py-2 rounded-full border border-[#30363d] bg-[#161b22] text-gray-400 hover:text-white hover:border-gray-500 hover:bg-[#21262d] transition-all shadow-sm">
                    {p}
                  </button>
                ))}
              </div>

              {/* Input Panel */}
              <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-2 flex items-center shadow-lg w-full focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Ask Gemini anything about your studies..."
                  className="flex-1 bg-transparent px-4 py-3 text-sm text-gray-300 outline-none placeholder-gray-600"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 mr-1">
                  <Send size={18} className={!loading && input.trim() ? 'translate-x-0.5 -translate-y-0.5' : ''} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Flashcards */}
        {tab === 'flashcards' && (
          <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300 pt-4">
            <div className="space-y-4 p-8 rounded-2xl border border-[#30363d] bg-[#161b22] shadow-lg">
              <input value={studyTopic} onChange={(e) => setStudyTopic(e.target.value)}
                placeholder="Topic name (e.g. DBMS, Operating Systems...)"
                className="w-full px-5 py-4 rounded-xl border border-[#30363d] bg-[#0d1117] text-sm text-gray-200 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-600" />
              <textarea value={studyContent} onChange={(e) => setStudyContent(e.target.value)}
                placeholder="Paste your notes, lecture content, or topic summary here..."
                rows={6}
                className="w-full px-5 py-4 rounded-xl border border-[#30363d] bg-[#0d1117] text-sm text-gray-200 outline-none resize-none transition-all duration-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-600 custom-scrollbar" />
              <button onClick={generateFlashcards} disabled={generating || !studyContent.trim()}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-sm font-bold bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {generating ? <RefreshCw size={18} className="animate-spin" /> : <Sparkles size={18} />}
                <span>{generating ? 'Generating Flashcards with Gemini...' : 'Generate Flashcards'}</span>
              </button>
            </div>
            {flashcards && flashcards.length > 0 && <FlashcardPanel cards={flashcards} />}
          </div>
        )}

        {/* Quiz */}
        {tab === 'quiz' && (
          <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300 pt-4">
            {!quiz ? (
              <div className="space-y-4 p-8 rounded-2xl border border-[#30363d] bg-[#161b22] shadow-lg">
                <input value={studyTopic} onChange={(e) => setStudyTopic(e.target.value)}
                  placeholder="Topic name (e.g. Data Structures)..."
                  className="w-full px-5 py-4 rounded-xl border border-[#30363d] bg-[#0d1117] text-sm text-gray-200 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-600" />
                <textarea value={studyContent} onChange={(e) => setStudyContent(e.target.value)}
                  placeholder="Paste your study content here to generate a custom quiz..."
                  rows={6}
                  className="w-full px-5 py-4 rounded-xl border border-[#30363d] bg-[#0d1117] text-sm text-gray-200 outline-none resize-none transition-all duration-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-600 custom-scrollbar" />
                <button onClick={generateQuiz} disabled={generating || !studyContent.trim()}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-sm font-bold bg-purple-500 hover:bg-purple-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {generating ? <RefreshCw size={18} className="animate-spin" /> : <Zap size={18} />}
                  <span>{generating ? 'Generating Quiz with Gemini...' : 'Generate AI Quiz'}</span>
                </button>
              </div>
            ) : (
              <div>
                <button onClick={() => setQuiz(null)} className="flex items-center gap-2 text-sm font-semibold mb-6 px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#161b22] transition-colors border border-transparent hover:border-[#30363d]">
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
