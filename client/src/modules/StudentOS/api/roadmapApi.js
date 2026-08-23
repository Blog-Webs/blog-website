import api from '../../../lib/api';

export const roadmapApi = {
  // Onboarding & Domains
  getOnboardingStatus: () => api.get('/roadmap/onboarding/status'),
  getDomains: () => api.get('/roadmap/onboarding/domains'),
  getCareerGoals: () => api.get('/roadmap/onboarding/career-goals'),
  getSkills: () => api.get('/roadmap/onboarding/skills'),
  submitStep1: (data) => api.post('/roadmap/onboarding/step1', data),
  submitStep2: (data) => api.post('/roadmap/onboarding/step2', data),
  submitStep3: (data) => api.post('/roadmap/onboarding/step3', data),
  submitStep4: (data) => api.post('/roadmap/onboarding/step4', data),
  completeOnboarding: (data) => api.post('/roadmap/onboarding/complete', data),

  // Profile
  getProfile: () => api.get('/roadmap/profile'),
  updateProfile: (data) => api.patch('/roadmap/profile', data),

  // Assessment
  getAssessmentSkills: () => api.get('/roadmap/assessment/skills'),
  startAssessment: (data) => api.post('/roadmap/assessment/start', data),
  getNextBatch: (data) => api.post('/roadmap/assessment/next', data),
  submitAssessment: (data) => api.post('/roadmap/assessment/submit', data),
  getAssessmentHistory: () => api.get('/roadmap/assessment/history'),

  // Roadmap
  getRoadmapStatus: () => api.get('/roadmap/roadmap/status'),
  getRoadmap: () => api.get('/roadmap/roadmap'),
  generateRoadmap: (data) => api.post('/roadmap/roadmap/generate', data),
  completeTopic: (roadmapId, topicId) => api.patch(`/roadmap/roadmap/${roadmapId}/topic/${topicId}/complete`),
  pauseRoadmap: (roadmapId) => api.patch(`/roadmap/roadmap/${roadmapId}/pause`),
  resumeRoadmap: (roadmapId) => api.patch(`/roadmap/roadmap/${roadmapId}/resume`),

  // Daily Plan & Progress
  getDailyPlan: () => api.get('/roadmap/daily-plan'),
  generateDailyPlan: (data) => api.post('/roadmap/daily-plan/generate', data),
  completeTask: (planId, taskId) => api.patch(`/roadmap/daily-plan/${planId}/task/${taskId}/complete`),
  logSession: (data) => api.post('/roadmap/session', data),
  getProgress: () => api.get('/roadmap/progress'),
  getAnalytics: () => api.get('/roadmap/analytics'),
  getRecommendations: () => api.get('/roadmap/recommendations'),

  // Admin Domains
  createDomain: (data) => api.post('/roadmap/admin/domains', data),
  updateDomain: (key, data) => api.patch(`/roadmap/admin/domains/${key}`, data),
  deleteDomain: (key) => api.delete(`/roadmap/admin/domains/${key}`),
};

export default roadmapApi;
