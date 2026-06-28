import api from './client';

export const contentApi = {
  getSubjects: () => api.get('/content/subjects'),
  getSubjectBySlug: (slug) => api.get(`/content/subjects/${slug}`),
  getTracksForTopic: (topicId) => api.get(`/content/topics/${topicId}/tracks`),
  getChaptersForTrack: (trackId) => api.get(`/content/tracks/${trackId}/chapters`),
  getChapterContent: (chapterId) => api.get(`/content/chapters/${chapterId}`),
};
