import React, { useState } from 'react';
import { X, Terminal as TerminalIcon } from 'lucide-react';

export default function TerminalModal({ agent, onClose }) {
  const [logs, setLogs] = useState([
    '$ npm test',
    'PASS tests/integration/auth.spec.js',
    '  ✓ POST /api/auth/login returns 200 and valid JWT token (45ms)',
    '  ✓ POST /api/auth/register creates user document (62ms)',
    '  ✓ GET /api/auth/me rejects invalid token with 401 (12ms)',
    '',
    'Test Suites: 1 passed, 1 total',
    'Tests:       3 passed, 3 total',
    'Snapshots:   0 total',
    'Time:        1.42s',
    'Ran all test suites matching /auth.spec.js/.',
    '',
    '$ git add .',
    '$ git commit -m "feat(auth): implement JWT middleware & password hashing"',
    '[main a7b931e] feat(auth): implement JWT middleware & password hashing',
    ' 2 files changed, 48 insertions(+), 4 deletions(-)'
  ]);

  const [inputCmd, setInputCmd] = useState('');

  const handleRunCommand = (e) => {
    e.preventDefault();
    if (!inputCmd.trim()) return;

    const cmd = inputCmd.trim();
    setLogs((prev) => [
      ...prev,
      `$ ${cmd}`,
      `Executing command: "${cmd}"...`,
      '✓ Command executed successfully with exit status 0'
    ]);
    setInputCmd('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-3xl bg-[#090b10] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[75vh] animate-in zoom-in-95 duration-200">
        {/* Terminal Header */}
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <TerminalIcon size={15} className="text-emerald-400" />
            <span className="font-bold">
              AI Agent Terminal ({agent ? agent.name : 'System Orchestrator'})
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Terminal Screen Output */}
        <div className="flex-1 p-4 bg-[#05070a] font-mono text-xs text-emerald-400 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          {logs.map((line, idx) => (
            <div key={idx} className={line.startsWith('$') ? 'text-white font-bold' : 'text-slate-300'}>
              {line}
            </div>
          ))}
        </div>

        {/* Terminal Input Bar */}
        <form onSubmit={handleRunCommand} className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center gap-2">
          <span className="text-xs font-mono text-emerald-400 font-bold">$</span>
          <input
            type="text"
            value={inputCmd}
            onChange={(e) => setInputCmd(e.target.value)}
            placeholder="Type terminal command (e.g. npm test, git status)..."
            className="flex-1 bg-transparent text-xs font-mono text-white focus:outline-none placeholder:text-slate-600"
          />
          <button
            type="submit"
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-mono font-bold transition-all"
          >
            Run
          </button>
        </form>
      </div>
    </div>
  );
}
