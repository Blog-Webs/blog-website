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

// Simple in-memory cache for GET requests
const requestCache = new Map();
const CACHE_TTL = 60 * 1000; // 60 seconds

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Check cache for GET requests
  if (config.method?.toLowerCase() === 'get') {
    const key = `${config.url}?${new URLSearchParams(config.params || {}).toString()}`;
    const cached = requestCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      // Return a custom adapter that resolves immediately with cached data
      config.adapter = () => Promise.resolve({
        data: cached.data,
        status: 200,
        statusText: 'OK',
        headers: cached.headers,
        config,
        request: {}
      });
    }
  }

  return config;
});

api.interceptors.response.use((response) => {
  if (response.config.method?.toLowerCase() === 'get') {
    const key = `${response.config.url}?${new URLSearchParams(response.config.params || {}).toString()}`;
    requestCache.set(key, {
      data: response.data,
      headers: response.headers,
      timestamp: Date.now()
    });
  }
  return response;
});

export default api;
