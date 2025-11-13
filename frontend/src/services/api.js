import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-storage');
    if (token) {
      try {
        const parsed = JSON.parse(token);
        if (parsed.state?.token) {
          config.headers.Authorization = `Bearer ${parsed.state.token}`;
        }
      } catch (e) {
        console.error('Error parsing auth token:', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Service methods
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
};

export const farmService = {
  getAll: () => api.get('/farms'),
  getById: (id) => api.get(`/farms/${id}`),
  create: (data) => api.post('/farms', data),
  update: (id, data) => api.put(`/farms/${id}`, data),
  delete: (id) => api.delete(`/farms/${id}`),
  getStats: (id) => api.get(`/farms/${id}/stats`),
};

export const zoneService = {
  getAll: () => api.get('/zones'),
  getById: (id) => api.get(`/zones/${id}`),
  create: (data) => api.post('/zones', data),
  update: (id, data) => api.put(`/zones/${id}`, data),
  delete: (id) => api.delete(`/zones/${id}`),
  assignRecipe: (id, recipeId) => api.post(`/zones/${id}/assign-recipe`, { recipeId }),
  startBatch: (id, data) => api.post(`/zones/${id}/start-batch`, data),
  stopBatch: (id) => api.post(`/zones/${id}/stop-batch`),
  getStatus: (id) => api.get(`/zones/${id}/status`),
};

export const recipeService = {
  getAll: () => api.get('/crop-recipes'),
  getPublic: () => api.get('/crop-recipes/public'),
  getById: (id) => api.get(`/crop-recipes/${id}`),
  create: (data) => api.post('/crop-recipes', data),
  update: (id, data) => api.put(`/crop-recipes/${id}`, data),
  delete: (id) => api.delete(`/crop-recipes/${id}`),
  clone: (id) => api.post(`/crop-recipes/${id}/clone`),
};

export const telemetryService = {
  getZoneData: (zoneId, params) => api.get(`/telemetry/zone/${zoneId}`, { params }),
  getLatest: (zoneId) => api.get(`/telemetry/zone/${zoneId}/latest`),
  getHistory: (zoneId, params) => api.get(`/telemetry/zone/${zoneId}/history`, { params }),
};

export const deviceService = {
  getAll: () => api.get('/devices'),
  getById: (id) => api.get(`/devices/${id}`),
  register: (data) => api.post('/devices/register', data),
  update: (id, data) => api.put(`/devices/${id}`, data),
  delete: (id) => api.delete(`/devices/${id}`),
};

export const inventoryService = {
  getAll: (params) => api.get('/inventory/items', { params }),
  getById: (id) => api.get(`/inventory/items/${id}`),
  create: (data) => api.post('/inventory/items', data),
  update: (id, data) => api.put(`/inventory/items/${id}`, data),
  delete: (id) => api.delete(`/inventory/items/${id}`),
  adjustStock: (id, data) => api.post(`/inventory/items/${id}/adjust`, data),
  getTransactions: (params) => api.get('/inventory/transactions', { params }),
  getLowStock: () => api.get('/inventory/items/low-stock'),
  getStats: () => api.get('/inventory/stats'),
  recordUsage: (data) => api.post('/inventory/usage', data),
};

export const notificationService = {
  getAll: (params) => api.get('/notifications/alerts', { params }),
  getById: (id) => api.get(`/notifications/alerts/${id}`),
  getUnreadCount: () => api.get('/notifications/alerts/unread-count'),
  markAsRead: (id) => api.post(`/notifications/alerts/${id}/read`),
  markAsUnread: (id) => api.post(`/notifications/alerts/${id}/unread`),
  dismiss: (id) => api.post(`/notifications/alerts/${id}/dismiss`),
  acknowledge: (id) => api.post(`/notifications/alerts/${id}/acknowledge`),
  markAllAsRead: () => api.post('/notifications/alerts/read-all'),
  dismissAll: () => api.post('/notifications/alerts/dismiss-all'),
  getPreferences: () => api.get('/notifications/preferences'),
  updatePreferences: (data) => api.put('/notifications/preferences', data),
};

export const taskService = {
  getAll: (params) => api.get('/tasks/tasks', { params }),
  getById: (id) => api.get(`/tasks/tasks/${id}`),
  create: (data) => api.post('/tasks/tasks', data),
  update: (id, data) => api.put(`/tasks/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/tasks/${id}`),
  complete: (id, data) => api.post(`/tasks/tasks/${id}/complete`, data),
  updateStatus: (id, status) => api.post(`/tasks/tasks/${id}/status`, { status }),
  updateChecklist: (id, checklist) => api.put(`/tasks/tasks/${id}/checklist`, { checklist }),
  getUpcoming: (days) => api.get('/tasks/tasks/upcoming', { params: { days } }),
  getOverdue: () => api.get('/tasks/tasks/overdue'),
  getStats: () => api.get('/tasks/tasks/stats'),
  // Templates
  getTemplates: (params) => api.get('/tasks/templates', { params }),
  getTemplate: (id) => api.get(`/tasks/templates/${id}`),
  createTemplate: (data) => api.post('/tasks/templates', data),
  updateTemplate: (id, data) => api.put(`/tasks/templates/${id}`, data),
  deleteTemplate: (id) => api.delete(`/tasks/templates/${id}`),
  createFromTemplate: (id, data) => api.post(`/tasks/templates/${id}/create-task`, data),
};

