import api from '../../core/api/client';

const BASE = '/roadmap';

export const roadmapApi = {
  // ── Onboarding ─────────────────────────────────────────────────────────
  getOnboardingStatus: ()           => api.get(`${BASE}/onboarding/status`),
  getDomains:          ()           => api.get(`${BASE}/onboarding/domains`),
  getCareerGoals:      (domain)     => api.get(`${BASE}/onboarding/career-goals?domain=${encodeURIComponent(domain)}`),
  getSkills:           (domain)     => api.get(`${BASE}/onboarding/skills?domain=${encodeURIComponent(domain)}`),
  step1:               (data)       => api.post(`${BASE}/onboarding/step1`, data),
  step2:               (data)       => api.post(`${BASE}/onboarding/step2`, data),
  step3:               (data)       => api.post(`${BASE}/onboarding/step3`, data),
  step4:               (data)       => api.post(`${BASE}/onboarding/step4`, data),
  completeOnboarding:  ()           => api.post(`${BASE}/onboarding/complete`),

  // ── Profile ─────────────────────────────────────────────────────────────
  getProfile:          ()           => api.get(`${BASE}/profile`),
  updateProfile:       (data)       => api.patch(`${BASE}/profile`, data),

  // ── Assessment ──────────────────────────────────────────────────────────
  getAssessmentSkills: (domain)     => api.get(`${BASE}/assessment/skills?domain=${encodeURIComponent(domain || '')}`),
  startAssessment:     (skill, domain) => api.post(`${BASE}/assessment/start`, { skill, domain }),
  getNextBatch:        (data)       => api.post(`${BASE}/assessment/next`, data),
  submitAssessment:    (data)       => api.post(`${BASE}/assessment/submit`, data),
  getAssessmentHistory: ()          => api.get(`${BASE}/assessment/history`),

  // ── Roadmap ─────────────────────────────────────────────────────────────
  getRoadmapStatus:    ()           => api.get(`${BASE}/roadmap/status`),
  getRoadmap:          ()           => api.get(`${BASE}/roadmap`),
  generateRoadmap:     ()           => api.post(`${BASE}/roadmap/generate`),
  completeTopic:       (roadmapId, topicId) => api.patch(`${BASE}/roadmap/${roadmapId}/topic/${topicId}/complete`),
  pauseRoadmap:        (roadmapId)  => api.patch(`${BASE}/roadmap/${roadmapId}/pause`),
  resumeRoadmap:       (roadmapId)  => api.patch(`${BASE}/roadmap/${roadmapId}/resume`),

  // ── Daily Plan ──────────────────────────────────────────────────────────
  getDailyPlan:        (date)       => api.get(`${BASE}/daily-plan${date ? `?date=${date}` : ''}`),
  generateDailyPlan:   (date)       => api.post(`${BASE}/daily-plan/generate`, date ? { date } : {}),
  completeTask:        (planId, taskId, data) => api.patch(`${BASE}/daily-plan/${planId}/task/${taskId}/complete`, data || {}),
  logSession:          (data)       => api.post(`${BASE}/session`, data),

  // ── Progress & Analytics ─────────────────────────────────────────────────
  getProgress:         ()           => api.get(`${BASE}/progress`),
  getAnalytics:        (period)     => api.get(`${BASE}/analytics${period ? `?period=${period}` : ''}`),
  getRecommendations:  ()           => api.get(`${BASE}/recommendations`),
  getLeaderboard:      ()           => api.get(`${BASE}/leaderboard`),
};
