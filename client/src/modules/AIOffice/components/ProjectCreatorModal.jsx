import { X, Sparkles, Cpu, ArrowRight } from 'lucide-react';

export default function ProjectCreatorModal({ onClose, onCreateProject }) {
  const [name, setName] = useState('URL Shortener & Analytics');
  const [description, setDescription] = useState('Build a high-performance URL shortener service with QR code generation, click analytics dashboard, custom aliases, and rate-limited REST API.');
  const [selectedTech, setSelectedTech] = useState(['React', 'Node.js', 'MongoDB', 'Redis', 'Docker']);
  const [requirements, setRequirements] = useState(
    `Requirements:\n1. Short URL generation with MD5 / Base62 hash encoding.\n2. Express REST API with JWT Auth and Redis caching for sub-10ms redirects.\n3. Interactive React analytics dashboard for click counts and geo-location metrics.\n4. Automated Jest test suite & Docker containerization.`
  );

  const [step, setStep] = useState('idle'); // idle | analyzing | graph | assigning | ready

  const techOptions = ['React', 'Node.js', 'MongoDB', 'Redis', 'Docker', 'PostgreSQL', 'Python', 'Tailwind', 'GraphQL'];

  const toggleTech = (tech) => {
    if (selectedTech.includes(tech)) {
      setSelectedTech(selectedTech.filter((t) => t !== tech));
    } else {
      setSelectedTech([...selectedTech, tech]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !description) return;

    // Simulation decomposition steps
    setStep('analyzing');
    setTimeout(() => {
      setStep('graph');
      setTimeout(() => {
        setStep('assigning');
        setTimeout(() => {
          setStep('ready');
          setTimeout(() => {
            onCreateProject(name, description, selectedTech, requirements);
            onClose();
          }, 800);
        }, 800);
      }, 800);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-2xl bg-[#0c0e15] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Create New AI Software Project</h3>
              <p className="text-[11px] text-slate-400">Autonomous PM will decompose requirements into an agent task graph</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        {step !== 'idle' ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center animate-pulse">
              <Cpu size={32} />
            </div>

            <div className="space-y-2">
              <h4 className="text-base font-bold text-white">AI Project Manager Orchestrating...</h4>
              <p className="text-xs text-indigo-300 font-mono">
                {step === 'analyzing' && 'Analyzing requirements & stack dependencies...'}
                {step === 'graph' && 'Building task DAG graph & pipeline...'}
                {step === 'assigning' && 'Assigning 10 specialized AI agents...'}
                {step === 'ready' && 'Development simulation started!'}
              </p>
            </div>

            <div className="w-64 bg-slate-800 h-2 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-700"
                style={{
                  width:
                    step === 'analyzing'
                      ? '25%'
                      : step === 'graph'
                      ? '60%'
                      : step === 'assigning'
                      ? '85%'
                      : '100%'
                }}
              />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
            {/* Project Name */}
            <div>
              <label className="block font-bold text-slate-200 mb-1">Project Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                placeholder="e.g. AI SaaS Platform"
              />
            </div>

            {/* Tech Stack Selection */}
            <div>
              <label className="block font-bold text-slate-200 mb-1">Technology Stack</label>
              <div className="flex flex-wrap gap-1.5">
                {techOptions.map((tech) => (
                  <button
                    type="button"
                    key={tech}
                    onClick={() => toggleTech(tech)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border transition-all ${
                      selectedTech.includes(tech)
                        ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-bold text-slate-200 mb-1">Project Overview</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Requirements Text Area */}
            <div>
              <label className="block font-bold text-slate-200 mb-1">Detailed Requirements</label>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-900/30 transition-all active:scale-95"
              >
                <span>Start AI Development</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
