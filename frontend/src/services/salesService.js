import api from './api';

const salesService = {
  // GET /api/sales  (supports filters: date, paymentMethod, status)
  getSales: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.date)          params.append('date', filters.date);
    if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
    if (filters.status)        params.append('status', filters.status);
    const qs = params.toString();
    const response = await api.get(`/sales${qs ? '?' + qs : ''}`);
    return response.data;
  },

  // GET /api/sales/:id
  getSaleById: async (id) => {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },

  // POST /api/sales
  createSale: async (saleData) => {
    const response = await api.post('/sales', saleData);
    return response.data;
  },

  // PATCH /api/sales/:id/cancel
  cancelSale: async (id) => {
    const response = await api.patch(`/sales/${id}/cancel`);
    return response.data;
  },

  // PUT /api/sales/:id
  updateSale: async (id, saleData) => {
    const response = await api.put(`/sales/${id}`, saleData);
    return response.data;
  },

  // DELETE /api/sales/:id
  deleteSale: async (id) => {
    const response = await api.delete(`/sales/${id}`);
    return response.data;
  },

  // GET /api/products  - Member 1's endpoint; filter active products client-side
  getActiveProducts: async () => {
    const response = await api.get('/products');
    return response.data;
  }
};

export default salesService;
