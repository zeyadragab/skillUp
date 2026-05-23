import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api/admin';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('admin');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updatePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/password', { currentPassword, newPassword }),
  createAdmin: (data: any) => api.post('/auth/admins', data),
  getAdmins: () => api.get('/auth/admins'),
  updateAdminStatus: (id: string, isActive: boolean) =>
    api.put(`/auth/admins/${id}/status`, { isActive }),
  deleteAdmin: (id: string) => api.delete(`/auth/admins/${id}`),
};

// Dashboard API
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentActivity: () => api.get('/dashboard/recent-activity'),
  getUserGrowthChart: () => api.get('/dashboard/charts/user-growth'),
  getSessionsChart: () => api.get('/dashboard/charts/sessions'),
  getTokensChart: () => api.get('/dashboard/charts/tokens'),
  getTopTeachers: () => api.get('/dashboard/top-teachers'),
  getRecentUsers: () => api.get('/dashboard/recent-users'),
  getRecentSessions: () => api.get('/dashboard/recent-sessions'),
  getPendingSkills: () => api.get('/dashboard/pending-skills'),
  getSystemHealth: () => api.get('/dashboard/health'),
};

// Users API
export const usersApi = {
  getUsers: (params?: any) => api.get('/users', { params }),
  getUser: (id: string) => api.get(`/users/${id}`),
  updateUser: (id: string, data: any) => api.put(`/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
  banUser: (id: string, reason: string) => api.post(`/users/${id}/ban`, { reason }),
  unbanUser: (id: string) => api.post(`/users/${id}/unban`),
  adjustTokens: (id: string, amount: number, type: 'credit' | 'debit', reason: string) =>
    api.post(`/users/${id}/tokens`, { amount: Math.abs(amount), type, reason }),
  getStats: () => api.get('/users/stats'),
  verifyAll: () => api.post('/users/verify-all'),
};

// Teachers API
export const teachersApi = {
  getTeachers: (params?: any) => api.get('/teachers', { params }),
  getTeacher: (id: string) => api.get(`/teachers/${id}`),
  getPendingVerifications: () => api.get('/teachers/pending'),
  verifyTeacher: (id: string) => api.post(`/teachers/${id}/verify`),
  rejectVerification: (id: string, reason: string) =>
    api.post(`/teachers/${id}/reject`, { reason }),
  getStats: () => api.get('/teachers/stats'),
};

// Skills API
export const skillsApi = {
  getSkills: (params?: any) => api.get('/skills', { params }),
  getSkill: (id: string) => api.get(`/skills/${id}`),
  createSkill: (data: any) => api.post('/skills', data),
  updateSkill: (id: string, data: any) => api.put(`/skills/${id}`, data),
  deleteSkill: (id: string) => api.delete(`/skills/${id}`),
  getCategories: () => api.get('/skills/categories/all'),
  createCategory: (data: any) => api.post('/skills/categories', data),
  updateCategory: (id: string, data: any) => api.put(`/skills/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/skills/categories/${id}`),
  getStats: () => api.get('/skills/stats'),
};

// Sessions API
export const sessionsApi = {
  getSessions: (params?: any) => api.get('/sessions', { params }),
  getSession: (id: string) => api.get(`/sessions/${id}`),
  cancelSession: (id: string, reason: string) => api.post(`/sessions/${id}/cancel`, { reason }),
  getStats: () => api.get('/sessions/stats'),
};

// Transactions API
export const transactionsApi = {
  getTransactions: (params?: any) => api.get('/transactions', { params }),
  getTransaction: (id: string) => api.get(`/transactions/${id}`),
  getUserTransactions: (userId: string) => api.get(`/transactions/user/${userId}`),
  getStats: () => api.get('/transactions/stats'),
  getCirculation: () => api.get('/transactions/circulation'),
};

// Reports API
export const reportsApi = {
  getReports: (params?: any) => api.get('/reports', { params }),
  getReport: (id: string) => api.get(`/reports/${id}`),
  updateStatus: (id: string, data: any) => api.put(`/reports/${id}/status`, data),
  resolveReport: (id: string, data: any) => api.post(`/reports/${id}/resolve`, data),
  dismissReport: (id: string, notes: string) => api.post(`/reports/${id}/dismiss`, { notes }),
  addNote: (id: string, note: string) => api.post(`/reports/${id}/notes`, { note }),
};

// Reviews API
export const reviewsApi = {
  getReviews: (params?: any) => api.get('/reviews', { params }),
  getReview: (id: string) => api.get(`/reviews/${id}`),
  updateStatus: (id: string, status: string, moderationNote?: string) =>
    api.put(`/reviews/${id}/status`, { status, moderationNote }),
  deleteReview: (id: string) => api.delete(`/reviews/${id}`),
  getUserReviews: (userId: string, type?: string) =>
    api.get(`/reviews/user/${userId}`, { params: { type } }),
  getStats: () => api.get('/reviews/stats'),
};

// Notifications API
export const notificationsApi = {
  getNotifications: (params?: any) => api.get('/notifications', { params }),
  getNotification: (id: string) => api.get(`/notifications/${id}`),
  createNotification: (data: any) => api.post('/notifications', data),
  updateNotification: (id: string, data: any) => api.put(`/notifications/${id}`, data),
  deleteNotification: (id: string) => api.delete(`/notifications/${id}`),
  sendNotification: (id: string) => api.post(`/notifications/${id}/send`),
  cancelNotification: (id: string) => api.post(`/notifications/${id}/cancel`),
  getStats: () => api.get('/notifications/stats'),
};

// Settings API
export const settingsApi = {
  getSettings: () => api.get('/settings'),
  updateGeneralSettings: (data: any) => api.put('/settings/general', data),
  updateTokenSettings: (data: any) => api.put('/settings/tokens', data),
  updateSessionSettings: (data: any) => api.put('/settings/sessions', data),
  updateSecuritySettings: (data: any) => api.put('/settings/security', data),
  updateEmailSettings: (data: any) => api.put('/settings/email', data),
  updateGamificationSettings: (data: any) => api.put('/settings/gamification', data),
  resetSettings: (category?: string) => api.post('/settings/reset', { category }),
  getHistory: () => api.get('/settings/history'),
  toggleMaintenance: (enabled: boolean, message?: string) =>
    api.post('/settings/maintenance', { enabled, message }),
};

// Analytics API
export const analyticsApi = {
  getAnalytics: (period?: string) => api.get('/analytics', { params: { period } }),
  getBreakdown: (period?: string) => api.get('/analytics/breakdown', { params: { period } }),
  getUserGrowth: (period?: string) => api.get('/analytics/users/growth', { params: { period } }),
  getSessionTrends: (period?: string) => api.get('/analytics/sessions/trends', { params: { period } }),
  getTokenFlow: (period?: string) => api.get('/analytics/tokens/flow', { params: { period } }),
  getRevenueData: (period?: string) => api.get('/analytics/revenue', { params: { period } }),
};

export default api;
