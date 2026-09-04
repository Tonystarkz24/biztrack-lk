import axios from 'axios';

let rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Strip trailing slashes
rawBaseUrl = rawBaseUrl.trim().replace(/\/+$/, '');
// Ensure it ends with /api
if (!rawBaseUrl.endsWith('/api')) {
  rawBaseUrl += '/api';
}

const api = axios.create({
  baseURL: rawBaseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
