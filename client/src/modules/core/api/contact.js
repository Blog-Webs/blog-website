import api from './client';

export const contactApi = {
  submit: (payload) => api.post('/contact', payload),

  // Admin
  getAll: (type) => api.get('/contact/admin/all', { params: type ? { type } : {} }),
  markAsRead: (id) => api.patch(`/contact/admin/${id}/read`),
};
