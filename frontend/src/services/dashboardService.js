import api from './api';

/**
 * Fetch dashboard summary metrics
 * @param {string} [date] Optional date filter (YYYY-MM-DD)
 * @returns {Promise<object>} Dashboard summary data
 */
export const getDashboardSummary = async (date = null) => {
  const config = date ? { params: { date } } : {};
  const response = await api.get('/dashboard/summary', config);
  return response.data;
};

/**
 * Helper to format monetary values into Sri Lankan Rupees (LKR)
 * @param {number|string} value
 * @returns {string} Formatted LKR currency string
 */
export const formatLKR = (value) => {
  const num = Number(value) || 0;
  return `LKR ${num.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};
