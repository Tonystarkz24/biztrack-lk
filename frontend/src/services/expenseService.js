import api from './api';

const ENDPOINT = '/expenses';

const expenseService = {
  getAll: async (params = {}) => {
    // params can contain: search, category, startDate, endDate
    const response = await api.get(ENDPOINT, { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`${ENDPOINT}/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post(ENDPOINT, data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`${ENDPOINT}/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`${ENDPOINT}/${id}`);
    return response.data;
  }
};

export default expenseService;
