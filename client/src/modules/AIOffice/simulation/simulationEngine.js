import { useState, useEffect, useCallback } from 'react';
import { INITIAL_AGENTS } from '../data/initialAgents';
import { INITIAL_TASKS } from '../data/initialTasks';
import { INITIAL_EVENTS } from '../data/initialEvents';
import { updateAgentPositions } from './movementEngine';
import { updateTaskProgress, calculateProjectProgress } from './taskEngine';
import { generateSimulationTickEvent, createNewEvent } from './eventEngine';
import { getRandomThought } from './agentState';

export function useSimulationEngine() {
  const [projectName, setProjectName] = useState('AI SaaS Platform');
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [isPaused, setIsPaused] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [systemStatus] = useState('Operational');

  // Simulation tick loop
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      // 1. Update Agent Positions
      setAgents((prevAgents) => updateAgentPositions(prevAgents, 100 * speedMultiplier));

      // 2. Occasionally update thoughts / speech bubbles
      if (Math.random() < 0.25 * speedMultiplier) {
        setAgents((prevAgents) =>
          prevAgents.map((a) => {
            if (Math.random() < 0.3) {
              return {
                ...a,
                thoughtBubble: getRandomThought()
              };
            }
            return a;
          })
        );
      }

      // 3. Update Tasks Progress
      setTasks((prevTasks) => updateTaskProgress(prevTasks, speedMultiplier));

      // 4. Generate Simulation Events
      if (Math.random() < 0.15 * speedMultiplier) {
        setAgents((currentAgents) => {
          setTasks((currentTasks) => {
            const newEvt = generateSimulationTickEvent(currentAgents, currentTasks);
            if (newEvt) {
              setEvents((prev) => [newEvt, ...prev.slice(0, 49)]);
            }
            return currentTasks;
          });
          return currentAgents;
        });
      }
    }, 1000 / speedMultiplier);

    return () => clearInterval(interval);
  }, [isPaused, speedMultiplier]);

  // Derived stats
  const projectProgress = calculateProjectProgress(tasks);
  const agentsOnline = agents.length;
  const tasksCompleted = tasks.filter((t) => t.status === 'COMPLETED').length;
  const tasksInProgress = tasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'TESTING' || t.status === 'REVIEW').length;
  const tasksBlocked = tasks.filter((t) => t.status === 'BLOCKED').length;

  const createNewProject = useCallback((name, description, techStack, requirements) => {
    setProjectName(name);
    setEvents((prev) => [
      createNewEvent('agent-pm', 'Alex Vance', 'PROJECT_CREATED', `New project initialized: "${name}"`),
      ...prev
    ]);

    // Create fresh task set for the project
    const newTasks = [
      {
        id: 'TASK-101',
        title: 'Requirements Breakdown & Task Allocation',
        description: requirements || description,
        assignedAgentId: 'agent-pm',
        priority: 'CRITICAL',
        status: 'IN_PROGRESS',
        progress: 30,
        dependencies: [],
        filePath: 'docs/requirements.md',
        createdTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        codeSnippet: `# Project: ${name}\nStack: ${techStack.join(', ')}\n\nRequirements:\n${description}`
      },
      {
        id: 'TASK-102',
        title: 'Database & Relational Model Design',
        description: 'Define models & migration scripts',
        assignedAgentId: 'agent-db',
        priority: 'HIGH',
        status: 'ASSIGNED',
        progress: 10,
        dependencies: ['TASK-101'],
        filePath: 'src/models/schema.js',
        createdTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        codeSnippet: `// Database Schema for ${name}`
      },
      {
        id: 'TASK-103',
        title: 'Core Business Logic & API Layer',
        description: 'Implement backend routes & controllers',
        assignedAgentId: 'agent-backend',
        priority: 'HIGH',
        status: 'BACKLOG',
        progress: 0,
        dependencies: ['TASK-102'],
        filePath: 'src/api/router.js',
        createdTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        codeSnippet: `// API Router for ${name}`
      },
      {
        id: 'TASK-104',
        title: 'Frontend Component Architecture',
        description: 'React components & Tailwind styling',
        assignedAgentId: 'agent-frontend',
        priority: 'MEDIUM',
        status: 'BACKLOG',
        progress: 0,
        dependencies: ['TASK-103'],
        filePath: 'src/App.jsx',
        createdTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        codeSnippet: `// UI App entrypoint for ${name}`
      }
    ];

    setTasks(newTasks);
  }, []);

  return {
    projectName,
    projectProgress,
    agentsOnline,
    totalAgents: 10,
    totalTasks: tasks.length,
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
  };
}
