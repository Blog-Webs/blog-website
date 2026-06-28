import axios from 'axios';

const TOKEN_KEY = 'httptechnex_token';

// Frontend (Vercel) and backend (Render) live on different top-level
// domains. Cross-site cookies are increasingly blocked by default in
// modern browsers (Safari ITP, Chrome's third-party cookie phase-out,
// Brave, etc.) even when secure+SameSite=None is set correctly server-side
// — so we use a plain Authorization header instead, which isn't subject to
// any of that cross-site cookie policy.
//
// localStorage (not sessionStorage) so login persists across browser
// restarts, matching the previous cookie's 7-day maxAge. The JWT itself
// still expires server-side after JWT_EXPIRES_IN regardless of how long
// it sits in storage.
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
