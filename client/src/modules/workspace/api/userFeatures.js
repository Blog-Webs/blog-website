import api from '../../core/api/client';

export const progressApi = {
  toggleStudied: (chapterId) => api.post(`/progress/${chapterId}`),
  getSummary: () => api.get('/progress/summary'),
};

export const bookmarkApi = {
  getAll: () => api.get('/bookmarks'),
  toggle: (itemType, itemId) => api.post('/bookmarks', { itemType, itemId }),
};

export const todoApi = {
  getAll: () => api.get('/todos'),
  create: (text, priority) => api.post('/todos', { text, priority }),
  update: (id, patch) => api.patch(`/todos/${id}`, patch),
  remove: (id) => api.delete(`/todos/${id}`),
};

export const noteApi = {
  getAll: () => api.get('/notes'),
  create: (payload) => api.post('/notes', payload),
  update: (id, patch) => api.patch(`/notes/${id}`, patch),
  remove: (id) => api.delete(`/notes/${id}`),
};
