import api from './api';

const productService = {
  /**
   * Fetch all products with optional filters
   * @param {Object} params - { search, category, lowStock }
   */
  async getAll(params = {}) {
    const response = await api.get('/products', { params });
    return response.data;
  },

  /**
   * Fetch single product by id
   * @param {string|number} id
   */
  async getById(id) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  /**
   * Create a new product
   * @param {Object} productData
   */
  async create(productData) {
    const response = await api.post('/products', productData);
    return response.data;
  },

  /**
   * Update an existing product
   * @param {string|number} id
   * @param {Object} productData
   */
  async update(id, productData) {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  /**
   * Toggle or set product active status
   * @param {string|number} id
   * @param {boolean} [isActive]
   */
  async toggleStatus(id, isActive) {
    const payload = typeof isActive === 'boolean' ? { is_active: isActive } : {};
    const response = await api.patch(`/products/${id}/status`, payload);
    return response.data;
  },

  /**
   * Delete a product
   * @param {string|number} id
   */
  async delete(id) {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};

export default productService;
