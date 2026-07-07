import api from '../../core/api/client';

export const forumApi = {
  // Categories
  getCategories: () => api.get('/forum/categories'),
  getCategoryBySlug: (slug) => api.get(`/forum/categories/${slug}`),

  // Topics
  getRecentTopics: () => api.get('/forum/topics/recent'),
  searchTopics: (q) => api.get(`/forum/topics/search?q=${q}`),
  createTopic: (topicData) => api.post('/forum/topics', topicData),
  getTopicBySlug: (slug) => api.get(`/forum/topics/${slug}`),
  toggleLikeTopic: (topicId) => api.post(`/forum/topics/${topicId}/likes`),
  getForumStats: () => api.get('/forum/stats'),

  // Replies
  createReply: (topicId, content) => api.post(`/forum/topics/${topicId}/replies`, { content }),
  toggleLikeReply: (replyId) => api.post(`/forum/replies/${replyId}/like`),
  deleteReply: (replyId) => api.delete(`/forum/replies/${replyId}`),
};
