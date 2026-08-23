export interface StudentUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  academicLevel?: string;
  targetRole?: string;
}

export interface StudentTask {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  category?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  color?: string;
  type?: 'exam' | 'assignment' | 'coding' | 'general';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  codeSnippet?: string;
}

export interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'locked';
  estimatedWeeks: number;
  skills: string[];
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  explanation?: string;
}

