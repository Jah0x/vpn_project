import api from './api';

export const adminApi = {
  getPlans: () => api.get('/admin/plans'),
  createPlan: (dto) => api.post('/admin/plans', dto),
  updatePlan: (id, dto) => api.put(`/admin/plans/${id}`, dto),
  deletePlan: (id) => api.delete(`/admin/plans/${id}`),
};
