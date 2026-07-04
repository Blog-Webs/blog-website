import api from './client';

export const searchApi = {
  search: (q) => api.get('/search', { params: { q } }),
};
