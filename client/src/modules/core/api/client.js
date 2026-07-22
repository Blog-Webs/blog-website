import axios from 'axios';

const TOKEN_KEY = 'httptechnex_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Simple in-memory cache for GET requests
const requestCache = new Map();
const CACHE_TTL = 30 * 1000; // 30 seconds

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Check cache for GET requests
  if (config.method?.toLowerCase() === 'get') {
    const paramStr = config.params ? JSON.stringify(config.params) : '';
    const key = `${config.url}?${paramStr}`;
    const cached = requestCache.get(key);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      config.adapter = async () => ({
        data: cached.data,
        status: 200,
        statusText: 'OK',
        headers: cached.headers || {},
        config,
        request: {}
      });
    }
  }

  return config;
});

api.interceptors.response.use((response) => {
  if (response.config.method?.toLowerCase() === 'get') {
    const paramStr = response.config.params ? JSON.stringify(response.config.params) : '';
    const key = `${response.config.url}?${paramStr}`;
    requestCache.set(key, {
      data: response.data,
      headers: response.headers,
      timestamp: Date.now()
    });
  }
  return response;
});

export default api;
