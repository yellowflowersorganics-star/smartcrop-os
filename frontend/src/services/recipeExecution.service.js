import api from './api';

export const recipeExecutionService = {
  // Start recipe execution
  startRecipeExecution: async (data) => {
    const response = await api.post('/recipe-execution/start', data);
    return response.data;
  },

  // Get all recipe executions
  getAllRecipeExecutions: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/recipe-execution${params ? `?${params}` : ''}`);
    return response.data;
  },

  // Get recipe execution by ID
  getRecipeExecutionById: async (id) => {
    const response = await api.get(`/recipe-execution/${id}`);
    return response.data;
  },

  // Get recipe execution progress
  getRecipeExecutionProgress: async (id) => {
    const response = await api.get(`/recipe-execution/${id}/progress`);
    return response.data;
  },

  // Approve stage transition
  approveStage: async (id) => {
    const response = await api.post(`/recipe-execution/${id}/approve`);
    return response.data;
  },

  // Decline stage transition
  declineStage: async (id, reason) => {
    const response = await api.post(`/recipe-execution/${id}/decline`, { reason });
    return response.data;
  },

  // Pause recipe execution
  pauseRecipeExecution: async (id) => {
    const response = await api.post(`/recipe-execution/${id}/pause`);
    return response.data;
  },

  // Resume recipe execution
  resumeRecipeExecution: async (id) => {
    const response = await api.post(`/recipe-execution/${id}/resume`);
    return response.data;
  },

  // Abort recipe execution
  abortRecipeExecution: async (id) => {
    const response = await api.post(`/recipe-execution/${id}/abort`);
    return response.data;
  }
};

