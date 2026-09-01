import React, { useState } from 'react';
import { useSimulationEngine } from '../simulation/simulationEngine';
import TopBar from '../components/TopBar';
import LeftSidebar from '../components/LeftSidebar';
import RightAgentPanel from '../components/RightAgentPanel';
import OfficeCanvas from '../components/OfficeCanvas';
import TaskBoard from '../components/TaskBoard';
import TaskGraph from '../components/TaskGraph';
import ActivityFeed from '../components/ActivityFeed';
import CodeViewerModal from '../components/CodeViewerModal';
import TerminalModal from '../components/TerminalModal';
import ProjectCreatorModal from '../components/ProjectCreatorModal';
import SettingsModal from '../components/SettingsModal';
import { Users, Code, Terminal } from 'lucide-react';

export default function AIOfficeMainPage() {
  const {
    projectName,
    projectProgress,
    agentsOnline,
    totalAgents,
    totalTasks,
    tasksCompleted,
    tasksInProgress,
    tasksBlocked,
    systemStatus,
    agents,
    tasks,
    events,
    isPaused,
    speedMultiplier,
    setIsPaused,
    setSpeedMultiplier,
    createNewProject
  } = useSimulationEngine();

  const [activeTab, setActiveTab] = useState('office'); // office | tasks | agents | activity | architecture | code | tests | deployments | logs | comms
  const [agentFilter, setAgentFilter] = useState('ALL');
  const [selectedAgent, setSelectedAgent] = useState(null);

  // Modals
  const [codeViewerTarget, setCodeViewerTarget] = useState(null); // { agent, task }
  const [terminalTargetAgent, setTerminalTargetAgent] = useState(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Filtered agents
  const filteredAgents = agents.filter((a) => {
    if (agentFilter === 'ALL') return true;
    if (agentFilter === 'WORKING') return a.status === 'WORKING' || a.status === 'CODING';
    if (agentFilter === 'IDLE') return a.status === 'IDLE';
    if (agentFilter === 'BLOCKED') return a.status === 'BLOCKED';
    if (agentFilter === 'COMPLETED') return a.status === 'COMPLETED';
    return true;
  });

  const handleOpenCodeForAgent = (agent) => {
    const task = tasks.find((t) => t.assignedAgentId === agent.id) || tasks[0];
    setCodeViewerTarget({ agent, task });
  };

  const handleOpenCodeForTask = (task) => {
    const agent = agents.find((a) => a.id === task.assignedAgentId) || agents[0];
    setCodeViewerTarget({ agent, task });
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#090b10] text-slate-100 overflow-hidden font-sans select-none">
      {/* 1. TOP NAVIGATION BAR */}
      <TopBar
        projectName={projectName}
        projectProgress={projectProgress}
        agentsOnline={agentsOnline}
        totalAgents={totalAgents}
        totalTasks={totalTasks}
        tasksCompleted={tasksCompleted}
        tasksInProgress={tasksInProgress}
        tasksBlocked={tasksBlocked}
        systemStatus={systemStatus}
        isPaused={isPaused}
        speedMultiplier={speedMultiplier}
        onTogglePause={() => setIsPaused(!isPaused)}
        onSetSpeed={setSpeedMultiplier}
        onOpenNewProject={() => setShowNewProjectModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
      />

      {/* 2. MAIN BODY AREA */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT COLLAPSIBLE SIDEBAR */}
        <LeftSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          agentFilter={agentFilter}
          onSelectAgentFilter={setAgentFilter}
          agentCounts={{
            all: agents.length,
            working: agents.filter((a) => a.status === 'WORKING' || a.status === 'CODING').length,
            idle: agents.filter((a) => a.status === 'IDLE').length,
            blocked: agents.filter((a) => a.status === 'BLOCKED').length,
            completed: agents.filter((a) => a.status === 'COMPLETED').length
          }}
        />

        {/* CENTER CONTENT VIEWPORT */}
        <main className="flex-1 h-full overflow-hidden relative bg-[#0a0c10]">
          {activeTab === 'office' && (
            <OfficeCanvas
              agents={filteredAgents}
              selectedAgentId={selectedAgent?.id}
              onSelectAgent={setSelectedAgent}
              onViewCode={handleOpenCodeForAgent}
            />
          )}

          {activeTab === 'tasks' && (
            <TaskBoard tasks={tasks} agents={agents} onViewCode={handleOpenCodeForTask} />
          )}

          {activeTab === 'architecture' && <TaskGraph tasks={tasks} />}

          {activeTab === 'activity' && <ActivityFeed events={events} />}

          {activeTab === 'agents' && (
            <div className="w-full h-full p-6 overflow-y-auto bg-[#0b0d13]">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Users size={18} className="text-indigo-400" />
                AI Engineering Team Roster ({filteredAgents.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredAgents.map((ag) => (
                  <div
                    key={ag.id}
                    onClick={() => setSelectedAgent(ag)}
                    className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 hover:border-indigo-500 cursor-pointer transition-all space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl">
                        {ag.avatar}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white">{ag.name}</h3>
                        <p className="text-[11px] text-slate-400">{ag.role}</p>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      {ag.currentTask}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(activeTab === 'code' || activeTab === 'logs' || activeTab === 'comms' || activeTab === 'tests' || activeTab === 'deployments') && (
            <div className="w-full h-full p-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                {activeTab === 'code' ? <Code size={32} /> : <Terminal size={32} />}
              </div>
              <h2 className="text-base font-bold text-white capitalize">{activeTab} Interactive Panel</h2>
              <p className="text-xs text-slate-400 max-w-md">
                Click on any AI Agent in the Office View or Task Board to view generated code, stream terminal tests, or review PR diffs.
              </p>
              <button
                onClick={() => setActiveTab('office')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all"
              >
                Return to Office View
              </button>
            </div>
          )}
        </main>

        {/* RIGHT AGENT DETAIL PANEL */}
        {selectedAgent && (
          <RightAgentPanel
            agent={selectedAgent}
            onClose={() => setSelectedAgent(null)}
            onViewCode={handleOpenCodeForAgent}
            onOpenTerminal={setTerminalTargetAgent}
          />
        )}
      </div>

      {/* 3. MODALS */}
      {codeViewerTarget && (
        <CodeViewerModal
          agent={codeViewerTarget.agent}
          task={codeViewerTarget.task}
          onClose={() => setCodeViewerTarget(null)}
          onOpenTerminal={(ag) => {
            setCodeViewerTarget(null);
            setTerminalTargetAgent(ag);
          }}
        />
      )}

      {terminalTargetAgent !== null && (
        <TerminalModal agent={terminalTargetAgent} onClose={() => setTerminalTargetAgent(null)} />
      )}

      {showNewProjectModal && (
        <ProjectCreatorModal
          onClose={() => setShowNewProjectModal(false)}
          onCreateProject={createNewProject}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
          speedMultiplier={speedMultiplier}
          onSetSpeed={setSpeedMultiplier}
        />
      )}
    </div>
  );
}
