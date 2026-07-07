import { useEffect, useState } from 'react';
import { Plus, Trash2, Check, Clock, Calendar, Sparkles, FileText, X } from 'lucide-react';
import { todoApi, noteApi } from '../api/userFeatures';
import { ListSkeleton } from '../../core/components/ui/Skeleton';
import { useAuth } from '../../core/context/AuthContext';
import GoogleSignInButton from '../../core/components/ui/GoogleSignInButton';

const SUBJECTS = ['DSA', 'Java', 'Aptitude', 'System Design', 'Database', 'OS', 'General'];
const NOTE_COLORS = ['#5EEAD4', '#FFB454', '#A78BFA', '#F87171', '#60A5FA', '#34D399'];

const TodoPage = () => {
  const { user, loading: authLoading } = useAuth();

  // Todos state
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');
  const [priority, setPriority] = useState('medium');

  // Notes state
  const [notes, setNotes] = useState([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteSubject, setNoteSubject] = useState('');
  const [noteColor, setNoteColor] = useState('#5EEAD4');

  const [loading, setLoading] = useState(true);

  // Dynamic Metrics
  const doneTodos = todos.filter(t => t.isDone).length;
  const totalTodos = todos.length;
  const donePercentage = totalTodos > 0 ? Math.round((doneTodos / totalTodos) * 100) : 0;
  const urgentCount = todos.filter(t => t.priority === 'high' && !t.isDone).length;

  useEffect(() => {
    if (!user) return;
    Promise.all([
      todoApi.getAll().then(({ data }) => setTodos(data.todos || [])),
      noteApi.getAll().then(({ data }) => setNotes(data.notes || [])),
    ]).finally(() => setLoading(false));
  }, [user]);

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const { data } = await todoApi.create(text, priority);
    setTodos((prev) => [data.todo, ...prev]);
    setText('');
    setPriority('medium');
  };

  const handleToggleTodo = async (todo) => {
    const { data } = await todoApi.update(todo._id, { isDone: !todo.isDone });
    setTodos((prev) => prev.map((t) => (t._id === todo._id ? data.todo : t)));
  };

  const handleDeleteTodo = async (id) => {
    await todoApi.remove(id);
    setTodos((prev) => prev.filter((t) => t._id !== id));
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;
    const { data } = await noteApi.create({ title: noteTitle, content: noteContent, subject: noteSubject, color: noteColor });
    setNotes((prev) => [data.note, ...prev]);
    setIsAddingNote(false);
    setNoteTitle('');
    setNoteContent('');
    setNoteSubject('');
    setNoteColor('#5EEAD4');
  };

  const handleDeleteNote = async (id) => {
    await noteApi.remove(id);
    setNotes((prev) => prev.filter((n) => n._id !== id));
  };

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-3 text-white">Your Workspace</h1>
        <p className="mb-6 text-[#8B949E]">Sign in to access your to-dos and notes.</p>
        <GoogleSignInButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E1015] text-white p-6 md:p-10">
      <div className="max-w-[1300px] mx-auto">
        {/* Header equivalent if needed, layout usually handles it, but we add a small inner header just in case */}
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Left Column: Technical Notes */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">Technical Notes</h2>
              <button 
                onClick={() => setIsAddingNote(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#1C202B] border border-[#2D3342] rounded-lg text-sm font-medium hover:bg-[#2D3342] transition-colors"
              >
                <FileText size={16} /> New Note
              </button>
            </div>
            
            {loading ? (
              <ListSkeleton count={2} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {notes.map((note) => (
                  <div 
                    key={note._id} 
                    className="bg-[#161B22] border border-[#2D3342] rounded-xl p-6 flex flex-col h-56 relative group transition-colors shadow-sm text-left"
                    style={{ borderColor: '#2D3342' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = note.color || '#5EEAD4'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2D3342'; }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span 
                        className="px-3 py-1 text-[10px] font-bold tracking-wide uppercase rounded-full bg-[#1C202B] border border-[#2D3342]"
                        style={{ color: note.color || '#5EEAD4' }}
                      >
                        {note.subject || 'General'}
                      </span>
                      <button onClick={() => handleDeleteNote(note._id)} className="opacity-0 group-hover:opacity-100 text-[#8B949E] hover:text-[#F87171] transition-all">
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <h3 className="text-[17px] font-bold text-white mb-2 truncate">{note.title}</h3>
                    <p className="text-[13px] text-[#8B949E] line-clamp-3 mb-4 flex-1 leading-relaxed">{note.content}</p>
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#8B949E] mt-auto">
                      <Clock size={12} /> Edited recently
                    </div>
                  </div>
                ))}
                
                {/* Create Quick Snippet Card */}
                <button 
                  onClick={() => setIsAddingNote(true)}
                  className="flex flex-col items-center justify-center h-56 rounded-xl border-2 border-dashed border-[#2D3342] bg-transparent text-[#8B949E] hover:border-[#4375FF] hover:text-[#4375FF] transition-all group"
                >
                  <div className="p-3 bg-[#1C202B] rounded-full mb-3 group-hover:bg-[#4375FF]/10 transition-colors">
                    <FileText size={20} />
                  </div>
                  <span className="text-sm font-medium">Create quick snippet</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Tasks & Deadlines */}
          <div className="w-full lg:w-[420px] flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-white mb-2">Tasks & Deadlines</h2>
            
            {/* Project & Tasks Card */}
            <div className="bg-[#161B22] border border-[#2D3342] rounded-2xl overflow-hidden shadow-lg">
              {/* Header banner */}
              <div className="p-6 flex items-center gap-5 bg-gradient-to-r from-[#381B1F] to-[#161B22] border-b border-[#2D3342]">
                <div className="relative w-[52px] h-[52px] flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90 absolute" viewBox="0 0 36 36">
                    <path className="text-[#4A262B]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" />
                    <path className="text-[#FCA5A5]" strokeDasharray={`${donePercentage}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" />
                  </svg>
                  <span className="text-[11px] font-bold text-[#FCA5A5] relative z-10">{donePercentage}%</span>
                </div>
                <div>
                  <h4 className="text-[#FCA5A5] font-bold text-[15px] mb-1">Project Nexus Release</h4>
                  <p className="text-xs text-[#8B949E]">{urgentCount > 0 ? `${urgentCount} urgent tasks remaining` : 'All clean! No urgent tasks'}</p>
                </div>
              </div>

              {/* Tasks List */}
              <div className="p-4 flex flex-col gap-1 min-h-[300px]">
                {loading ? (
                  <ListSkeleton count={3} />
                ) : (
                  todos.map(todo => (
                    <div 
                      key={todo._id} 
                      className={`group flex items-start gap-3 p-3.5 rounded-xl hover:bg-[#1C202B] transition-colors relative ${todo.priority === 'high' && !todo.isDone ? 'border-l-2 border-[#FCA5A5] bg-[#381B1F]/20' : ''}`}
                    >
                      <button 
                        onClick={() => handleToggleTodo(todo)} 
                        className={`w-[18px] h-[18px] rounded-[4px] border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${todo.isDone ? 'bg-[#4375FF] border-[#4375FF]' : 'border-[#4C5363] hover:border-[#8B949E]'}`}
                      >
                        {todo.isDone && <Check size={12} className="text-white" strokeWidth={3} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`text-sm font-semibold truncate ${todo.isDone ? 'text-[#8B949E] line-through' : 'text-white'}`}>
                            {todo.text}
                          </h4>
                          {todo.priority === 'high' && !todo.isDone && (
                            <span className="px-1.5 py-[2px] text-[9px] font-bold bg-[#FCA5A5]/20 text-[#FCA5A5] rounded shrink-0 uppercase tracking-wide">
                              Priority
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#8B949E]">
                          {todo.priority === 'high' ? 'Bug Fix • Due Today' : 'Study • Due in 5 days'}
                        </p>
                      </div>
                      <button onClick={() => handleDeleteTodo(todo._id)} className="opacity-0 group-hover:opacity-100 text-[#8B949E] hover:text-[#F87171] p-1 transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
                
                <div className="mt-auto pt-4">
                  <form onSubmit={handleAddTodo} className="flex items-center gap-3 p-2.5 rounded-xl border border-[#2D3342] bg-[#111113] focus-within:border-[#4375FF] transition-colors">
                    <Plus size={18} className="text-[#8B949E] shrink-0 ml-1" />
                    <input 
                      value={text} 
                      onChange={e => setText(e.target.value)}
                      placeholder="Add a new task..."
                      className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-[#8B949E]"
                    />
                    <select
                      value={priority}
                      onChange={e => setPriority(e.target.value)}
                      className="bg-[#1C202B] border border-[#2D3342] rounded-lg px-2 py-1 text-xs text-white outline-none mr-1"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <button type="submit" className="px-4 py-1.5 bg-[#a5b4fc] hover:bg-[#c7d2fe] text-[#1e1b4b] text-xs font-bold rounded-lg transition-colors">
                      Add
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Bottom Deadlines */}
            <div className="flex gap-4">
              <div className="flex-1 bg-[#161B22] border border-[#2D3342] rounded-2xl p-5 hover:border-[#8B949E] transition-colors cursor-default">
                <Calendar size={20} className="text-[#a5b4fc] mb-3" />
                <h4 className="text-[15px] font-bold text-white mb-1">Sprint Demo</h4>
                <p className="text-xs text-[#8B949E]">Fri, 2:00 PM</p>
              </div>
              <div className="flex-1 bg-[#161B22] border border-[#2D3342] rounded-2xl p-5 hover:border-[#8B949E] transition-colors cursor-default">
                <Sparkles size={20} className="text-[#5EEAD4] mb-3" />
                <h4 className="text-[15px] font-bold text-white mb-1">AI Workshop</h4>
                <p className="text-xs text-[#8B949E]">Next Monday</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Note Modal */}
      {isAddingNote && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161B22] border border-[#2D3342] rounded-2xl w-[calc(100vw-2rem)] sm:w-[480px] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Create Note</h3>
              <button onClick={() => setIsAddingNote(false)} className="text-[#8B949E] hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddNote} className="flex flex-col gap-4">
              <input
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Note title..."
                className="w-full px-4 py-3 rounded-xl border border-[#2D3342] bg-[#111113] text-sm text-white outline-none focus:border-[#4375FF]"
                autoFocus
              />
              
              <div className="flex gap-3">
                <select
                  value={noteSubject}
                  onChange={(e) => setNoteSubject(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border border-[#2D3342] bg-[#111113] text-sm text-white outline-none focus:border-[#4375FF] appearance-none"
                >
                  <option value="">Subject (optional)</option>
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>

                <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#2D3342] bg-[#111113]">
                  {NOTE_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNoteColor(c)}
                      className="w-5 h-5 rounded-full shrink-0 transition-transform"
                      style={{
                        backgroundColor: c,
                        transform: noteColor === c ? 'scale(1.2)' : 'scale(1)',
                        border: noteColor === c ? '2px solid white' : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>

              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your note here..."
                rows={6}
                className="w-full px-4 py-3 rounded-xl border border-[#2D3342] bg-[#111113] text-sm text-white outline-none focus:border-[#4375FF] resize-none"
              />

              <button
                type="submit"
                className="mt-2 w-full py-3 bg-[#4375FF] hover:bg-[#3460E0] text-white text-sm font-bold rounded-xl transition-colors"
              >
                Save Note
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoPage;
