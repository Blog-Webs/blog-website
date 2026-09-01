import React, { useState } from 'react';
import { X, Settings as SettingsIcon } from 'lucide-react';

export default function SettingsModal({ onClose, speedMultiplier, onSetSpeed }) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-[#0c0e15] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <SettingsIcon size={16} className="text-indigo-400" />
            <span>AI Office Simulation Settings</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Simulation Speed */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-200">Simulation Speed Multiplier</label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 4].map((spd) => (
                <button
                  key={spd}
                  onClick={() => onSetSpeed(spd)}
                  className={`p-2 rounded-xl font-mono font-bold border transition-all ${
                    speedMultiplier === spd
                      ? 'bg-indigo-600 text-white border-indigo-400'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {spd}x Speed
                </button>
              ))}
            </div>
          </div>

          {/* Sound Toggles */}
          <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <span className="text-slate-300 font-medium">Ambient Office Audio</span>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={() => setSoundEnabled(!soundEnabled)}
              className="accent-indigo-500 w-4 h-4"
            />
          </div>

          {/* Auto Save State */}
          <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <span className="text-slate-300 font-medium">Auto-save simulation logs</span>
            <input
              type="checkbox"
              checked={autoSave}
              onChange={() => setAutoSave(!autoSave)}
              className="accent-indigo-500 w-4 h-4"
            />
          </div>
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
