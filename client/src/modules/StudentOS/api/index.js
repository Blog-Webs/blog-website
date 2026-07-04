import api from '../../core/api/client';

const BASE = '/studentos';

export const studentOSApi = {
  // Auth
  getAuthUrl: () => api.get(`${BASE}/auth/url`),
  getStatus: () => api.get(`${BASE}/auth/status`),
  disconnect: () => api.delete(`${BASE}/auth/disconnect`),

  // Dashboard
  getDashboard: () => api.get(`${BASE}/dashboard`),

  // Classroom
  getCourses: () => api.get(`${BASE}/classroom/courses`),
  getAssignments: (courseId) => api.get(`${BASE}/classroom/assignments${courseId ? `?courseId=${courseId}` : ''}`),
  getAnnouncements: (courseId) => api.get(`${BASE}/classroom/announcements${courseId ? `?courseId=${courseId}` : ''}`),

  // Drive
  getFiles: (query) => api.get(`${BASE}/drive/files${query ? `?query=${encodeURIComponent(query)}` : ''}`),
  searchFiles: (q) => api.get(`${BASE}/drive/search?q=${encodeURIComponent(q)}`),

  // Gmail
  getEmails: () => api.get(`${BASE}/gmail/emails`),
  searchEmails: (q) => api.get(`${BASE}/gmail/search?q=${encodeURIComponent(q)}`),
  markAsRead: (id) => api.patch(`${BASE}/gmail/${id}/read`),
  summarizeEmail: (id) => api.get(`${BASE}/gmail/${id}/summarize`),

  // Calendar
  getEvents: (days = 7) => api.get(`${BASE}/calendar/events?days=${days}`),
  getTodayEvents: () => api.get(`${BASE}/calendar/today`),

  // Tasks
  getTaskLists: () => api.get(`${BASE}/tasks/lists`),
  getTasks: (listId) => api.get(`${BASE}/tasks${listId ? `?listId=${listId}` : ''}`),
  createTask: (data, listId) => api.post(`${BASE}/tasks${listId ? `?listId=${listId}` : ''}`, data),
  updateTask: (taskId, patch, listId) => api.patch(`${BASE}/tasks/${taskId}${listId ? `?listId=${listId}` : ''}`, patch),
  deleteTask: (taskId, listId) => api.delete(`${BASE}/tasks/${taskId}${listId ? `?listId=${listId}` : ''}`),
  completeTask: (taskId, listId) => api.post(`${BASE}/tasks/${taskId}/complete${listId ? `?listId=${listId}` : ''}`),

  // AI
  getAiStatus: () => api.get(`${BASE}/ai/status`),
  chat: (message) => api.post(`${BASE}/ai/chat`, { message }),
  flashcards: (content, topic) => api.post(`${BASE}/ai/flashcards`, { content, topic }),
  quiz: (content, topic) => api.post(`${BASE}/ai/quiz`, { content, topic }),

  // RAG Files
  uploadDocument: (formData) => api.post(`${BASE}/files/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getDocuments: () => api.get(`${BASE}/files`),
};
