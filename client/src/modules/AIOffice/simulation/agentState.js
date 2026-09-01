/**
 * Agent State Definitions & State Machine Transitions
 */

export const AGENT_STATES = {
  IDLE: { label: 'Idle', color: '#9CA3AF', icon: '💤' },
  WORKING: { label: 'Working', color: '#3B82F6', icon: '⚡' },
  THINKING: { label: 'Thinking', color: '#8B5CF6', icon: '🧠' },
  CODING: { label: 'Coding', color: '#10B981', icon: '💻' },
  REVIEWING: { label: 'Reviewing', color: '#F59E0B', icon: '🔍' },
  TESTING: { label: 'Testing', color: '#EC4899', icon: '🧪' },
  WAITING: { label: 'Waiting', color: '#EAB308', icon: '⏳' },
  BLOCKED: { label: 'Blocked', color: '#EF4444', icon: '⚠️' },
  MEETING: { label: 'Meeting', color: '#F97316', icon: '🤝' },
  COMMUNICATING: { label: 'Communicating', color: '#06B6D4', icon: '💬' },
  COMPLETED: { label: 'Completed', color: '#22C55E', icon: '✅' },
  ERROR: { label: 'Error', color: '#DC2626', icon: '❌' }
};

export const AGENT_THOUGHTS = [
  'Refactoring modular layers...',
  'Checking index execution plan...',
  'Verifying CORS & rate limit policies...',
  'Compiling TypeScript definitions...',
  'Running unit test assertions...',
  'Optimizing bundle payload size...',
  'Evaluating token window budgets...',
  'Resolving dependency graph nodes...',
  'Synchronizing event bus emitters...',
  'Building Docker container layers...'
];

export function getRandomThought() {
  return AGENT_THOUGHTS[Math.floor(Math.random() * AGENT_THOUGHTS.length)];
}
