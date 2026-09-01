import axios from 'axios';

const API_BASE = '/api/ai-office';

export const aiOfficeApi = {
  getProjects: () => axios.get(`${API_BASE}/projects`),
  getProjectById: (id) => axios.get(`${API_BASE}/projects/${id}`),
  createProject: (data) => axios.post(`${API_BASE}/projects`, data),
  updateProject: (id, data) => axios.put(`${API_BASE}/projects/${id}`, data)
};
