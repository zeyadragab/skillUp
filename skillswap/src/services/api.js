import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 seconds
});

// Request interceptor - Add JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        const requestUrl = error.config?.url || '';

        // Don't auto-logout on initial /auth/me call (page load)
        // This allows UserContext to use cached data on refresh
        const isAuthMeRequest = requestUrl.includes('/auth/me') || requestUrl.endsWith('/me');

        if (!isAuthMeRequest) {
          // For other 401 errors (not /auth/me), clear auth and redirect
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/signin';
        }
      }

      // Return error message from backend
      const message = error.response.data?.message || 'An error occurred';
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // Request made but no response
      return Promise.reject(new Error('No response from server. Please check your connection.'));
    } else {
      // Something else happened
      return Promise.reject(new Error('Request failed'));
    }
  }
);

// ==================== AUTH API ====================
export const authAPI = {
  // Register new user
  register: async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    return data;
  },

  // Login user
  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },

  // Get current user
  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const { data } = await api.put('/auth/profile', profileData);
    return data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },

  // Reset password
  resetPassword: async (token, password) => {
    const { data } = await api.post(`/auth/reset-password/${token}`, { password });
    return data;
  },

  // Logout
  logout: async () => {
    const { data } = await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return data;
  }
};

// ==================== SESSION API ====================
export const sessionAPI = {
  // Create new session
  create: async (sessionData) => {
    const { data } = await api.post('/sessions', sessionData);
    return data;
  },

  // Get all sessions
  getAll: async (params = {}) => {
    const { data } = await api.get('/sessions', { params });
    return data;
  },

  // Get upcoming sessions
  getUpcoming: async () => {
    const { data } = await api.get('/sessions', {
      params: { upcoming: 'true' }
    });
    return data;
  },

  // Get past sessions
  getPast: async () => {
    const { data } = await api.get('/sessions', {
      params: { past: 'true' }
    });
    return data;
  },

  // Get session by ID
  getById: async (id) => {
    const { data } = await api.get(`/sessions/${id}`);
    return data;
  },

  // Update session
  update: async (id, updateData) => {
    const { data } = await api.put(`/sessions/${id}`, updateData);
    return data;
  },

  // Cancel session
  cancel: async (id, reason) => {
    const { data } = await api.delete(`/sessions/${id}/cancel`, {
      data: { reason }
    });
    return data;
  },

  // Rate session
  rate: async (id, rating, review) => {
    const { data } = await api.post(`/sessions/${id}/rate`, { rating, review });
    return data;
  },

  // Join video session
  join: async (id) => {
    const { data } = await api.post(`/sessions/${id}/join`);
    return data;
  }
};

// ==================== PAYMENT API ====================
export const paymentAPI = {
  // Get token packages
  getPackages: async () => {
    const { data } = await api.get('/payments/packages');
    return data;
  },

  // Create payment intent
  createIntent: async (packageType) => {
    const { data } = await api.post('/payments/intent', { packageType });
    return data;
  },

  // Confirm payment
  confirm: async (paymentIntentId) => {
    const { data } = await api.post('/payments/confirm', { paymentIntentId });
    return data;
  },

  // Get payment history
  getHistory: async () => {
    const { data } = await api.get('/payments/history');
    return data;
  },

  // Get single payment by ID
  getById: async (paymentId) => {
    const { data } = await api.get(`/payments/${paymentId}`);
    return data;
  }
};

// ==================== USER API ====================
export const userAPI = {
  // Search teachers
  search: async (filters = {}) => {
    const { data } = await api.get('/users/search', { params: filters });
    return data;
  },

  // Get user profile
  getProfile: async (userId) => {
    const { data } = await api.get(`/users/${userId}/profile`);
    return data;
  },

  // Add skill
  addSkill: async (skillData) => {
    const { data } = await api.post('/users/skills', skillData);
    return data;
  },

  // Remove skill
  removeSkill: async (skillId) => {
    const { data } = await api.delete(`/users/skills/${skillId}`);
    return data;
  },

  // Update skill level
  updateSkillLevel: async (skillId, level) => {
    const { data } = await api.put(`/users/skills/${skillId}`, { level });
    return data;
  },

  // Get token balance
  getTokenBalance: async () => {
    const { data } = await api.get('/users/tokens');
    return data;
  },

  // Get transaction history
  getTransactions: async () => {
    const { data } = await api.get('/users/transactions');
    return data;
  }
};

// ==================== MESSAGE API ====================
export const messageAPI = {
  // Get conversations
  getConversations: async () => {
    const { data } = await api.get('/conversations');
    return data;
  },

  // Get conversation by ID
  getConversation: async (id) => {
    const { data } = await api.get(`/conversations/${id}`);
    return data;
  },

  // Send message
  send: async (conversationId, content) => {
    const { data } = await api.post('/messages', {
      conversationId,
      content
    });
    return data;
  },

  // Get messages
  getMessages: async (conversationId, limit = 50) => {
    const { data } = await api.get(`/messages/${conversationId}`, {
      params: { limit }
    });
    return data;
  },

  // Mark as read
  markAsRead: async (messageId) => {
    const { data } = await api.put(`/messages/${messageId}/read`);
    return data;
  }
};

// ==================== ADMIN API ====================
export const adminAPI = {
  // Get all users
  getAllUsers: async (params = {}) => {
    const { data } = await api.get('/admin/users', { params });
    return data;
  },

  // Get user details
  getUserDetails: async (userId) => {
    const { data } = await api.get(`/admin/users/${userId}`);
    return data;
  },

  // Update user status
  updateUserStatus: async (userId, status) => {
    const { data } = await api.put(`/admin/users/${userId}/status`, { status });
    return data;
  },

  // Approve teacher
  approveTeacher: async (userId) => {
    const { data } = await api.post('/admin/teachers/approve', { userId });
    return data;
  },

  // Adjust tokens
  adjustTokens: async (userId, amount, reason) => {
    const { data } = await api.post('/admin/tokens/adjust', {
      userId,
      amount,
      reason
    });
    return data;
  },

  // Get statistics
  getStatistics: async () => {
    const { data } = await api.get('/admin/statistics');
    return data;
  }
};

// ==================== SKILLS API ====================
export const skillsAPI = {
  // Get all skills
  getAll: async (params = {}) => {
    const { data } = await api.get('/skills', { params });
    return data;
  },

  // Get skill by ID
  getById: async (id) => {
    const { data } = await api.get(`/skills/${id}`);
    return data;
  },

  // Get skills by category
  getByCategory: async (category) => {
    const { data } = await api.get(`/skills/category/${category}`);
    return data;
  },

  // Get all categories
  getCategories: async () => {
    const { data } = await api.get('/skills/categories/list');
    return data;
  },

  // Get popular skills
  getPopular: async (limit = 10) => {
    const { data } = await api.get('/skills/popular/top', {
      params: { limit }
    });
    return data;
  },

  // Add skill to teaching list
  addToTeach: async (skillId, level = 'intermediate', tokensPerHour = 50) => {
    const { data } = await api.post(`/skills/teach/${skillId}`, { level, tokensPerHour });
    return data;
  },

  // Add skill to learning list
  addToLearn: async (skillId, level = 'beginner') => {
    const { data } = await api.post(`/skills/learn/${skillId}`, { level });
    return data;
  },

  // Remove skill from user's list
  removeUserSkill: async (skillId, type) => {
    const { data} = await api.delete(`/skills/user/${skillId}`, {
      params: { type }
    });
    return data;
  },

  // Search skills
  search: async (query, filters = {}) => {
    const { data } = await api.get('/skills', {
      params: { search: query, ...filters }
    });
    return data;
  },

  // Admin: Create skill
  create: async (skillData) => {
    const { data } = await api.post('/skills', skillData);
    return data;
  },

  // Admin: Update skill
  update: async (id, skillData) => {
    const { data } = await api.put(`/skills/${id}`, skillData);
    return data;
  },

  // Admin: Delete skill
  delete: async (id) => {
    const { data } = await api.delete(`/skills/${id}`);
    return data;
  }
};

// Transactions API
export const transactionsAPI = {
  // Get user's transaction history
  getAll: async (params = {}) => {
    const { data } = await api.get('/transactions', { params });
    return data;
  },

  // Get single transaction
  getById: async (id) => {
    const { data } = await api.get(`/transactions/${id}`);
    return data;
  },

  // Get transaction statistics
  getStats: async (period = 30) => {
    const { data } = await api.get('/transactions/stats', { params: { period } });
    return data;
  },

  // Admin: Create manual transaction
  create: async (transactionData) => {
    const { data } = await api.post('/transactions', transactionData);
    return data;
  }
};

// Sessions API
export const sessionsAPI = {
  // Get user's sessions
  getAll: async (params = {}) => {
    const { data } = await api.get('/sessions', { params });
    return data;
  },

  // Get single session
  getById: async (id) => {
    const { data } = await api.get(`/sessions/${id}`);
    return data;
  },

  // Create new session
  create: async (sessionData) => {
    const { data } = await api.post('/sessions', sessionData);
    return data;
  },

  // Update session
  update: async (id, sessionData) => {
    const { data } = await api.put(`/sessions/${id}`, sessionData);
    return data;
  },

  // Cancel session
  cancel: async (id, reason) => {
    const { data } = await api.delete(`/sessions/${id}/cancel`, { data: { reason } });
    return data;
  },

  // Rate session
  rate: async (id, rating, review) => {
    const { data } = await api.post(`/sessions/${id}/rate`, { rating, review });
    return data;
  },

  // Join session (get video call info)
  join: async (id) => {
    const { data } = await api.post(`/sessions/${id}/join`);
    return data;
  },

  // Get upcoming sessions
  getUpcoming: async () => {
    const { data } = await api.get('/sessions', { params: { upcoming: true } });
    return data;
  },

  // Get past sessions
  getPast: async () => {
    const { data } = await api.get('/sessions', { params: { past: true } });
    return data;
  }
};

// Users API
export const usersAPI = {
  // Get user profile
  getProfile: async (userId) => {
    const { data } = await api.get(`/users/${userId}`);
    return data;
  },

  // Update own profile
  updateProfile: async (profileData) => {
    const { data } = await api.put('/users/profile', profileData);
    return data;
  },

  // Follow user
  follow: async (userId) => {
    const { data } = await api.post(`/users/${userId}/follow`);
    return data;
  },

  // Unfollow user
  unfollow: async (userId) => {
    const { data } = await api.delete(`/users/${userId}/unfollow`);
    return data;
  },

  // Get followers
  getFollowers: async (userId) => {
    const { data } = await api.get(`/users/${userId}/followers`);
    return data;
  },

  // Get following
  getFollowing: async (userId) => {
    const { data } = await api.get(`/users/${userId}/following`);
    return data;
  },

  // Search users
  search: async (params = {}) => {
    const { data } = await api.get('/users/search', { params });
    return data;
  }
};

// ==================== RECORDING API ====================
export const recordingAPI = {
  startRecording: (sessionId) => api.post(`/recordings/${sessionId}/start`),
  stopRecording: (sessionId) => api.post(`/recordings/${sessionId}/stop`),
  getRecordings: (params) => api.get('/recordings', { params }),
  getRecording: (id) => api.get(`/recordings/${id}`),
  getPlaybackUrl: (id, token) => api.get(`/recordings/${id}/playback`, { params: { token } }),
  deleteRecording: (id) => api.delete(`/recordings/${id}`),
  getStats: () => api.get('/recordings/stats')
};

// ==================== NOTIFICATION API ====================
export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread/count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  clearRead: () => api.delete('/notifications/read/clear'),
  getPreferences: () => api.get('/notifications/preferences'),
  updatePreferences: (data) => api.put('/notifications/preferences', data)
};

// ==================== AVAILABILITY API ====================
export const availabilityAPI = {
  getTeacherAvailability: (teacherId, params) => api.get(`/availability/${teacherId}`, { params }),
  getAvailableSlots: (teacherId, params) => api.get(`/availability/${teacherId}/slots`, { params }),
  getMyAvailability: () => api.get('/availability/my/schedule'),
  setAvailability: (data) => api.post('/availability', data),
  createDefault: (data) => api.post('/availability/default', data),
  updateStatus: (id, data) => api.put(`/availability/${id}/status`, data),
  deleteAvailability: (id) => api.delete(`/availability/${id}`)
};

// ==================== SUMMARY API ====================
export const summaryAPI = {
  // Generate AI summary for a session
  generateSummary: async (sessionId, transcript) => {
    const { data } = await api.post(`/summaries/generate/${sessionId}`, { transcript });
    return data;
  },

  // Generate mock summary (for testing)
  generateMockSummary: async (sessionId) => {
    const { data } = await api.post(`/summaries/mock/${sessionId}`);
    return data;
  },

  // Get summary for a session
  getSummary: async (sessionId) => {
    const { data } = await api.get(`/summaries/${sessionId}`);
    return data;
  },

  // Queue summary generation (background job)
  queueSummary: async (sessionId, transcript = null, recordingUrl = null) => {
    const { data } = await api.post(`/summaries/queue/${sessionId}`, { transcript, recordingUrl });
    return data;
  },

  // Get job status
  getJobStatus: async (sessionId) => {
    const { data } = await api.get(`/summaries/job-status/${sessionId}`);
    return data;
  },

  // Export summary as PDF
  exportPDF: async (sessionId) => {
    const { data } = await api.get(`/summaries/${sessionId}/pdf`, {
      responseType: 'blob'
    });
    return data;
  },

  // Email summary to participants
  emailSummary: async (sessionId) => {
    const { data } = await api.post(`/summaries/${sessionId}/email`);
    return data;
  }
};

export default api;
