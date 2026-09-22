import axios from 'axios';

let rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Strip trailing slashes
rawBaseUrl = rawBaseUrl.trim().replace(/\/+$/, '');
// Ensure it ends with /api
if (!rawBaseUrl.endsWith('/api')) {
  rawBaseUrl += '/api';
}

export const API_BASE_URL = rawBaseUrl;

const api = axios.create({
  baseURL: rawBaseUrl,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Request interceptor to attach JWT bearer token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('biztrack_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Logging interceptor for debugging production issues
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isNetworkError = !error.response || error.code === 'ERR_NETWORK';
    if (isNetworkError) {
      console.error(
        `[BizTrack Connection Error] Could not connect to backend at "${rawBaseUrl}".\n` +
        `Possible causes:\n` +
        `1. Backend domain is sleeping, stopped, or not generated in Railway.\n` +
        `2. VITE_API_URL in Netlify is pointing to localhost or an invalid URL.\n` +
        `3. Browser blocked mixed HTTP/HTTPS content or CORS.`
      );
    }
    return Promise.reject(error);
  }
);

export default api;
