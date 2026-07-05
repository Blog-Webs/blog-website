import api from '../../core/api/client';

export const contentApi = {
  getSubjects: () => api.get('/content/subjects'),
  getSubjectBySlug: (slug) => api.get(`/content/subjects/${slug}`),
  getChaptersForSubject: (subjectId) => api.get(`/content/subjects/${subjectId}/chapters`),
  getChapterContent: (chapterId) => api.get(`/content/chapters/${chapterId}`),
};
