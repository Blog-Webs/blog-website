import api from './client';

export const seriesApi = {
  getAll: () => api.get('/series'),
  getBySlug: (slug) => api.get(`/series/${slug}`),

  // Admin
  create: (payload) => api.post('/series', payload),
  update: (id, payload) => api.patch(`/series/${id}`, payload),
  remove: (id) => api.delete(`/series/${id}`),
};
