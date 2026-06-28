import api from './client';

export const authApi = {
  googleLogin: (credential) => api.post('/auth/google', { credential }),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateTheme: (theme) => api.patch('/auth/theme', { theme }),
};
