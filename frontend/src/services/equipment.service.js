import api from './api';

export const equipmentService = {
  // Get all equipment
  getAllEquipment: async () => {
    const response = await api.get('/equipment');
    return response.data;
  },

  // Get equipment by ID
  getEquipmentById: async (id) => {
    const response = await api.get(`/equipment/${id}`);
    return response.data;
  },

  // Create equipment
  createEquipment: async (data) => {
    const response = await api.post('/equipment', data);
    return response.data;
  },

  // Update equipment
  updateEquipment: async (id, data) => {
    const response = await api.put(`/equipment/${id}`, data);
    return response.data;
  },

  // Delete equipment
  deleteEquipment: async (id) => {
    const response = await api.delete(`/equipment/${id}`);
    return response.data;
  },

  // Turn equipment ON
  turnOn: async (id) => {
    const response = await api.post(`/equipment/${id}/on`);
    return response.data;
  },

  // Turn equipment OFF
  turnOff: async (id) => {
    const response = await api.post(`/equipment/${id}/off`);
    return response.data;
  },

  // Set equipment value (for PWM/analog control)
  setValue: async (id, value) => {
    const response = await api.post(`/equipment/${id}/value`, { value });
    return response.data;
  },

  // Set equipment mode (auto/manual/off)
  setMode: async (id, mode) => {
    const response = await api.post(`/equipment/${id}/mode`, { mode });
    return response.data;
  },

  // Get equipment commands history
  getCommands: async (id) => {
    const response = await api.get(`/equipment/${id}/commands`);
    return response.data;
  },

  // Get status of all equipment
  getAllEquipmentStatus: async () => {
    const response = await api.get('/equipment/status/all');
    return response.data;
  }
};

