export const INITIAL_EVENTS = [
  {
    id: 'evt-1',
    time: '10:42:12',
    agentId: 'agent-backend',
    agentName: 'Devon Smith',
    type: 'TASK_PROGRESS',
    message: 'Backend Agent completed JWT middleware implementation.',
    details: { progress: 72, task: 'TASK-003' }
  },
  {
    id: 'evt-2',
    time: '10:42:14',
    agentId: 'agent-backend',
    agentName: 'Devon Smith',
    targetAgentId: 'agent-qa',
    targetAgentName: 'Maya Lin',
    type: 'COMMUNICATION',
    message: 'Devon Smith → Maya Lin: "API implementation completed. Please run integration tests."',
    details: { payload: 'REST endpoints live on /api/auth' }
  },
  {
    id: 'evt-3',
    time: '10:42:18',
    agentId: 'agent-qa',
    agentName: 'Maya Lin',
    type: 'TEST_STARTED',
    message: 'Maya Lin started automated integration test suite on auth endpoints.',
    details: { suite: 'auth.spec.js' }
  },
  {
    id: 'evt-4',
    time: '10:43:02',
    agentId: 'agent-qa',
    agentName: 'Maya Lin',
    type: 'TEST_RESULTS',
    message: 'QA Agent detected 1 minor edge-case warning in token expiry edge handling.',
    details: { status: 'WARNING' }
  },
  {
    id: 'evt-5',
    time: '10:43:04',
    agentId: 'agent-qa',
    agentName: 'Maya Lin',
    targetAgentId: 'agent-backend',
    targetAgentName: 'Devon Smith',
    type: 'COMMUNICATION',
    message: 'Maya Lin → Devon Smith: "Token expiry edge condition failed when clock skew is > 5s."',
    details: { issueId: 'BUG-109' }
  },
  {
    id: 'evt-6',
    time: '10:44:20',
    agentId: 'agent-backend',
    agentName: 'Devon Smith',
    type: 'CODE_PATCHED',
    message: 'Devon Smith fixed clock skew margin in JWT verification middleware.',
    details: { commit: 'a7b931e' }
  },
  {
    id: 'evt-7',
    time: '10:44:45',
    agentId: 'agent-qa',
    agentName: 'Maya Lin',
    type: 'TEST_PASSED',
    message: 'QA Agent tests passed! All 12 auth test cases green.',
    details: { passed: 12, failed: 0 }
  },
  {
    id: 'evt-8',
    time: '10:45:10',
    agentId: 'agent-reviewer',
    agentName: 'Clara Vance',
    type: 'CODE_REVIEW',
    message: 'Clara Vance approved Pull Request #14: Auth API & Security Middleware.',
    details: { pr: 14 }
  }
];
