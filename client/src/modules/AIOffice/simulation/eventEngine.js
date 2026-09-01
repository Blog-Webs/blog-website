/**
 * Event Engine - Real-time activity log logger & event stream manager
 */

export function createNewEvent(agentId, agentName, type, message, details = {}) {
  const time = new Date().toLocaleTimeString();
  return {
    id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    time,
    agentId,
    agentName,
    type,
    message,
    details
  };
}

export function generateSimulationTickEvent(agents, _tasks) {
  const activeAgents = agents.filter(a => a.status === 'CODING' || a.status === 'WORKING' || a.status === 'TESTING');
  if (activeAgents.length === 0) return null;

  const agent = activeAgents[Math.floor(Math.random() * activeAgents.length)];
  const eventTypes = [
    { type: 'CODE_PATCHED', msg: `${agent.name} updated implementation file for ${agent.currentTask}.` },
    { type: 'COMMUNICATION', msg: `${agent.name} → Alex Vance (PM): "Progress update logged for ${agent.currentTask}."` },
    { type: 'TEST_PASSED', msg: `${agent.name} verified unit test assertions cleanly.` },
    { type: 'TASK_PROGRESS', msg: `${agent.name} completed sub-task milestone.` }
  ];

  const item = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  return createNewEvent(agent.id, agent.name, item.type, item.msg);
}
