import React, { useState } from 'react';
import { X, FileCode, Copy, Check, Terminal } from 'lucide-react';

export default function CodeViewerModal({ agent, task, onClose, onOpenTerminal }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('code');

  const filePath = task?.filePath || 'server/src/controllers/authController.js';
  const codeSnippet =
    task?.codeSnippet ||
    `const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * AI Generated Controller: User Login & JWT Middleware
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 1. Verify User exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 2. Compare Bcrypt password hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. Generate Signed JWT Payload
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};`;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-4xl bg-[#0d0f17] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Modal Top Bar */}
        <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
              <FileCode size={14} className="text-indigo-400" />
              <span>{filePath}</span>
            </div>
            {agent && (
              <span className="text-xs text-slate-400 font-sans">
                Active Developer: <span className="text-white font-semibold">{agent.name}</span> ({agent.role})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenTerminal(agent)}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all"
            >
              <Terminal size={13} />
              <span>Terminal</span>
            </button>

            <button
              onClick={handleCopy}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
              title="Copy Code"
            >
              {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Sub Tabs */}
        <div className="px-4 bg-slate-950 border-b border-slate-800/80 flex gap-4 text-xs font-mono">
          <button
            onClick={() => setActiveTab('code')}
            className={`py-2 border-b-2 font-bold transition-colors ${
              activeTab === 'code' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400'
            }`}
          >
            Source Code
          </button>
          <button
            onClick={() => setActiveTab('diff')}
            className={`py-2 border-b-2 font-bold transition-colors ${
              activeTab === 'diff' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400'
            }`}
          >
            Git Diff (+24 -2)
          </button>
        </div>

        {/* Code Content Editor Area */}
        <div className="flex-1 p-4 bg-[#090a0f] overflow-y-auto font-mono text-xs text-slate-200 scrollbar-thin scrollbar-thumb-slate-800 leading-relaxed">
          {activeTab === 'code' ? (
            <pre className="p-4 bg-[#0c0e15] rounded-xl border border-slate-800 overflow-x-auto text-emerald-300">
              <code>{codeSnippet}</code>
            </pre>
          ) : (
            <div className="space-y-1 bg-[#0c0e15] p-4 rounded-xl border border-slate-800 text-[11px]">
              <div className="text-slate-400">--- a/{filePath}</div>
              <div className="text-slate-400">+++ b/{filePath}</div>
              <div className="text-slate-400">@@ -15,7 +15,12 @@</div>
              <div className="bg-emerald-950/40 text-emerald-400 p-1 rounded">{'+ const isMatch = await bcrypt.compare(password, user.password);'}</div>
              <div className="bg-emerald-950/40 text-emerald-400 p-1 rounded">{"+ if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });"}</div>
              <div className="bg-emerald-950/40 text-emerald-400 p-1 rounded">{'+ const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);'}</div>
              <div className="bg-rose-950/40 text-rose-400 p-1 rounded">{"- const token = 'mock-jwt-token';"}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
