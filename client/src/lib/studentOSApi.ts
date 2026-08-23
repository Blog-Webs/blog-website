import api from './api';

export interface StudentOSAuthStatus {
  connected: boolean;
  email?: string;
  scopes?: string[];
}

export const studentOSApi = {
  // Auth
  getAuthStatus: async (): Promise<StudentOSAuthStatus> => {
    const res = await api.get('/studentos/auth/status');
    return res.data;
  },
  getAuthUrl: async (): Promise<{ url: string }> => {
    const res = await api.get('/studentos/auth/url');
    return res.data;
  },
  disconnectAuth: async () => {
    const res = await api.delete('/studentos/auth/disconnect');
    return res.data;
  },

  // Dashboard
  getDashboard: async () => {
    const res = await api.get('/studentos/dashboard');
    return res.data;
  },

  // Classroom
  getCourses: async () => {
    const res = await api.get('/studentos/classroom/courses');
    return res.data;
  },
  getAssignments: async () => {
    const res = await api.get('/studentos/classroom/assignments');
    return res.data;
  },
  getAnnouncements: async () => {
    const res = await api.get('/studentos/classroom/announcements');
    return res.data;
  },

  // Drive & Files
  getDriveFiles: async () => {
    const res = await api.get('/studentos/drive/files');
    return res.data;
  },
  searchDriveFiles: async (query: string) => {
    const res = await api.get(`/studentos/drive/search?q=${encodeURIComponent(query)}`);
    return res.data;
  },
  uploadDocument: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/studentos/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // Gmail
  getEmails: async () => {
    const res = await api.get('/studentos/gmail/emails');
    return res.data;
  },
  searchEmails: async (query: string) => {
    const res = await api.get(`/studentos/gmail/search?q=${encodeURIComponent(query)}`);
    return res.data;
  },
  summarizeEmail: async (messageId: string) => {
    const res = await api.get(`/studentos/gmail/${messageId}/summarize`);
    return res.data;
  },
  markEmailRead: async (messageId: string) => {
    const res = await api.patch(`/studentos/gmail/${messageId}/read`);
    return res.data;
  },

  // Calendar
  getCalendarEvents: async () => {
    const res = await api.get('/studentos/calendar/events');
    return res.data;
  },
  getTodayEvents: async () => {
    const res = await api.get('/studentos/calendar/today');
    return res.data;
  },

  // Tasks
  getTasks: async () => {
    const res = await api.get('/studentos/tasks');
    return res.data;
  },
  createTask: async (taskData: any) => {
    const res = await api.post('/studentos/tasks', taskData);
    return res.data;
  },
  updateTask: async (taskId: string, updates: any) => {
    const res = await api.patch(`/studentos/tasks/${taskId}`, updates);
    return res.data;
  },
  deleteTask: async (taskId: string) => {
    const res = await api.delete(`/studentos/tasks/${taskId}`);
    return res.data;
  },
  completeTask: async (taskId: string) => {
    const res = await api.post(`/studentos/tasks/${taskId}/complete`);
    return res.data;
  },

  // AI
  getAIStatus: async () => {
    const res = await api.get('/studentos/ai/status');
    return res.data;
  },
  chatAI: async (prompt: string) => {
    const res = await api.post('/studentos/ai/chat', { prompt });
    return res.data;
  },
  generateFlashcards: async (topic: string) => {
    const res = await api.post('/studentos/ai/flashcards', { topic });
    return res.data;
  },
  generateQuiz: async (topic: string) => {
    const res = await api.post('/studentos/ai/quiz', { topic });
    return res.data;
  },
};

export default studentOSApi;
