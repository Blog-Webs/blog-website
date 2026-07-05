import api from '../../core/api/client';

export const adminApi = {
  checkAdmin: () => api.get('/admin/check'),
  getStats: () => api.get('/admin/stats'),
  getSubscribers: () => api.get('/newsletter/admin/subscribers'),
  getNotifications: () => api.get('/admin/notifications'),
  markNotificationRead: (id) => api.put(`/admin/notifications/${id}/read`),

  createSubject: (payload) => api.post('/admin/content/subjects', payload),
  updateSubject: (id, payload) => api.patch(`/admin/content/subjects/${id}`, payload),
  deleteSubject: (id) => api.delete(`/admin/content/subjects/${id}`),

  createChapter: (payload) => api.post('/admin/content/chapters', payload),
  updateChapter: (id, payload) => api.patch(`/admin/content/chapters/${id}`, payload),
  deleteChapter: (id) => api.delete(`/admin/content/chapters/${id}`),

  getIconOptions: () => api.get('/admin/content/icons'),
  createIconOption: (payload) => api.post('/admin/content/icons', payload),
  updateIconOption: (id, payload) => api.patch(`/admin/content/icons/${id}`, payload),
  deleteIconOption: (id) => api.delete(`/admin/content/icons/${id}`),
};
