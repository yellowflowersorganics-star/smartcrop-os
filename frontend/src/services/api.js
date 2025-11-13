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

export const laborService = {
  clockIn: (data) => api.post('/labor/clock-in', data),
  clockOut: (data) => api.post('/labor/clock-out', data),
  getCurrentShift: () => api.get('/labor/current-shift'),
  getAll: (params) => api.get('/labor/work-logs', { params }),
  getMy: (params) => api.get('/labor/my-work-logs', { params }),
  getById: (id) => api.get(`/labor/work-logs/${id}`),
  create: (data) => api.post('/labor/work-logs', data),
  update: (id, data) => api.put(`/labor/work-logs/${id}`, data),
  delete: (id) => api.delete(`/labor/work-logs/${id}`),
  approve: (id, approved) => api.post(`/labor/work-logs/${id}/approve`, { approved }),
  getStats: (params) => api.get('/labor/work-logs/stats', { params }),
  getCosts: (params) => api.get('/labor/work-logs/costs', { params }),
};

export const costService = {
  getAll: (params) => api.get('/cost/costs', { params }),
  getById: (id) => api.get(`/cost/costs/${id}`),
  create: (data) => api.post('/cost/costs', data),
  update: (id, data) => api.put(`/cost/costs/${id}`, data),
  delete: (id) => api.delete(`/cost/costs/${id}`),
  getStats: (params) => api.get('/cost/costs/stats', { params }),
  getBreakdown: (params) => api.get('/cost/costs/breakdown', { params }),
  getTrends: (params) => api.get('/cost/costs/trends', { params }),
  getBatchCosts: (batchId) => api.get(`/cost/costs/batch/${batchId}`),
  getZoneCosts: (zoneId, params) => api.get(`/cost/costs/zone/${zoneId}`, { params }),
};

export const revenueService = {
  getAll: (params) => api.get('/revenue/revenue', { params }),
  getById: (id) => api.get(`/revenue/revenue/${id}`),
  create: (data) => api.post('/revenue/revenue', data),
  update: (id, data) => api.put(`/revenue/revenue/${id}`, data),
  delete: (id) => api.delete(`/revenue/revenue/${id}`),
  getStats: (params) => api.get('/revenue/revenue/stats', { params }),
  getTrends: (params) => api.get('/revenue/revenue/trends', { params }),
  getCustomers: (params) => api.get('/revenue/revenue/customers', { params }),
  getPendingPayments: () => api.get('/revenue/revenue/pending-payments'),
  getBatchRevenue: (batchId) => api.get(`/revenue/revenue/batch/${batchId}`),
};

export const profitabilityService = {
  getOverall: (params) => api.get('/profitability/overall', { params }),
  getTrends: (params) => api.get('/profitability/trends', { params }),
  getCostBreakdown: (params) => api.get('/profitability/cost-breakdown', { params }),
  getRevenueBreakdown: (params) => api.get('/profitability/revenue-breakdown', { params }),
  getBatchProfitability: (batchId) => api.get(`/profitability/batch/${batchId}`),
  compareBatches: (batchIds) => api.get('/profitability/compare', { params: { batchIds: batchIds.join(',') } }),
};

export const qualityControlService = {
  // Quality Checks
  getAllChecks: (params) => api.get('/quality/checks', { params }),
  getCheckById: (id) => api.get(`/quality/checks/${id}`),
  createCheck: (data) => api.post('/quality/checks', data),
  updateCheck: (id, data) => api.put(`/quality/checks/${id}`, data),
  deleteCheck: (id) => api.delete(`/quality/checks/${id}`),
  reviewCheck: (id, data) => api.post(`/quality/checks/${id}/review`, data),
  
  // Defects
  getDefects: (params) => api.get('/quality/defects', { params }),
  addDefect: (qualityCheckId, data) => api.post(`/quality/checks/${qualityCheckId}/defects`, data),
  updateDefect: (id, data) => api.put(`/quality/defects/${id}`, data),
  deleteDefect: (id) => api.delete(`/quality/defects/${id}`),
  
  // Analytics
  getStats: (params) => api.get('/quality/stats', { params }),
  getDefectAnalysis: (params) => api.get('/quality/defects/analysis', { params }),
  getCompliance: (params) => api.get('/quality/compliance', { params }),
};

export const qualityStandardService = {
  getAll: (params) => api.get('/quality/standards', { params }),
  getActive: (params) => api.get('/quality/standards/active', { params }),
  getById: (id) => api.get(`/quality/standards/${id}`),
  create: (data) => api.post('/quality/standards', data),
  update: (id, data) => api.put(`/quality/standards/${id}`, data),
  delete: (id) => api.delete(`/quality/standards/${id}`),
  approve: (id) => api.post(`/quality/standards/${id}/approve`),
  duplicate: (id) => api.post(`/quality/standards/${id}/duplicate`),
};

export const sopService = {
  // SOP Management
  getAll: (params) => api.get('/sop/sops', { params }),
  getById: (id) => api.get(`/sop/sops/${id}`),
  create: (data) => api.post('/sop/sops', data),
  update: (id, data) => api.put(`/sop/sops/${id}`, data),
  delete: (id) => api.delete(`/sop/sops/${id}`),
  approve: (id) => api.post(`/sop/sops/${id}/approve`),
  duplicate: (id) => api.post(`/sop/sops/${id}/duplicate`),
  getStats: () => api.get('/sop/sops/stats'),
  
  // SOP Execution
  startExecution: (data) => api.post('/sop/executions', data),
  getAllExecutions: (params) => api.get('/sop/executions', { params }),
  getMyExecutions: (params) => api.get('/sop/executions/my', { params }),
  getExecutionById: (id) => api.get(`/sop/executions/${id}`),
  updateExecution: (id, data) => api.put(`/sop/executions/${id}`, data),
  completeStep: (id, data) => api.post(`/sop/executions/${id}/step`, data),
  completeExecution: (id, data) => api.post(`/sop/executions/${id}/complete`, data),
};

