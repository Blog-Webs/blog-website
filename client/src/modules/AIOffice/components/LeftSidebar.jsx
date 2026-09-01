import React, { useState } from 'react';
import {
  Layout,
  CheckSquare,
  Users,
  Activity,
  GitMerge,
  Code,
  CheckCircle,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  Terminal,
  MessageSquare,
  Zap,
  DollarSign
} from 'lucide-react';

export default function LeftSidebar({
  activeTab,
  onSelectTab,
  agentFilter,
  onSelectAgentFilter,
  agentCounts = { all: 10, working: 7, idle: 2, blocked: 0, completed: 1 }
}) {
  const [collapsed, setCollapsed] = useState(false);

  const projectItems = [
    { id: 'office', label: 'Office View', icon: Layout },
    { id: 'tasks', label: 'Tasks Board', icon: CheckSquare },
    { id: 'agents', label: 'Agents Roster', icon: Users },
    { id: 'activity', label: 'Activity Feed', icon: Activity },
    { id: 'architecture', label: 'Architecture Graph', icon: GitMerge },
    { id: 'code', label: 'Code Viewer', icon: Code },
    { id: 'tests', label: 'Tests Suite', icon: CheckCircle },
    { id: 'deployments', label: 'Deployments', icon: UploadCloud }
  ];

  const agentFilterItems = [
    { id: 'ALL', label: 'All Agents', count: agentCounts.all },
    { id: 'WORKING', label: 'Working', count: agentCounts.working },
    { id: 'IDLE', label: 'Idle', count: agentCounts.idle },
    { id: 'BLOCKED', label: 'Blocked', count: agentCounts.blocked },
    { id: 'COMPLETED', label: 'Completed', count: agentCounts.completed }
  ];

  const systemItems = [
    { id: 'logs', label: 'Logs', icon: Terminal },
    { id: 'comms', label: 'Agent Comms', icon: MessageSquare },
    { id: 'tokens', label: 'Token Usage', icon: Zap },
    { id: 'costs', label: 'Est. Costs', icon: DollarSign }
  ];

  return (
    <aside
      className={`bg-[#0c0e14] border-r border-slate-800/80 flex flex-col justify-between transition-all duration-300 z-20 shrink-0 select-none ${
        collapsed ? 'w-14' : 'w-60'
      }`}
    >
      {/* Top Header & Toggle */}
      <div className="flex items-center justify-between p-3 border-b border-slate-800/60">
        {!collapsed && <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Navigation</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Main Nav Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-5 scrollbar-none text-xs">
        {/* Section: Project */}
        <div>
          {!collapsed && <p className="px-2 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Project</p>}
          <nav className="space-y-0.5">
            {projectItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={16} className={isActive ? 'text-indigo-400' : 'text-slate-400'} />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Section: Agents Filter */}
        <div>
          {!collapsed && <p className="px-2 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Agents Filter</p>}
          <div className="space-y-0.5">
            {agentFilterItems.map((filter) => {
              const isActive = agentFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => onSelectAgentFilter(filter.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition-all ${
                    isActive ? 'bg-slate-800 text-white font-semibold' : ''
                  }`}
                  title={collapsed ? `${filter.label} (${filter.count})` : undefined}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    {!collapsed && <span>{filter.label}</span>}
                  </div>
                  {!collapsed && (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {filter.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section: System */}
        <div>
          {!collapsed && <p className="px-2 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">System</p>}
          <nav className="space-y-0.5">
            {systemItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition-all ${
                    isActive ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : ''
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={15} />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-800/60 text-[10px] text-slate-400 font-mono bg-slate-950/40">
          <p className="flex justify-between">
            <span>Model:</span>
            <span className="text-slate-300 font-bold">Gemini 2.5 Flash</span>
          </p>
          <p className="flex justify-between mt-1">
            <span>Latency:</span>
            <span className="text-emerald-400 font-bold">140ms</span>
          </p>
        </div>
      )}
    </aside>
  );
}
