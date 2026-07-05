import api from '../../core/api/client';

export const blogApi = {
  getBlogs: (params) => api.get('/blogs', { params }),
  getBlogBySlug: (slug) => api.get(`/blogs/${slug}`),
  toggleLike: (slug) => api.post(`/blogs/${slug}/like`),
  addComment: (slug, text, parentComment) => api.post(`/blogs/${slug}/comments`, { text, parentComment }),
  deleteComment: (commentId) => api.delete(`/blogs/comments/${commentId}`),
  getTagsAndCategories: () => api.get('/blogs/meta/tags-categories'),

  // Admin
  getAllAdmin: (params) => api.get('/blogs/admin/all', { params }),
  getByIdAdmin: (id) => api.get(`/blogs/admin/${id}`),
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/blogs/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  create: (payload) => api.post('/blogs', payload),
  update: (id, payload) => api.patch(`/blogs/${id}`, payload),
  remove: (id) => api.delete(`/blogs/${id}`),
};

export const newsletterApi = {
  subscribe: (email) => api.post('/newsletter/subscribe', { email }),
  unsubscribe: (email) => api.post('/newsletter/unsubscribe', { email }),
};
