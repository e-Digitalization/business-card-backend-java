import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
});

api.interceptors.request.use((config) => {
  const url = config.url || '';
  const isClient = url.includes('/api/client');
  const token = isClient
    ? localStorage.getItem('clientToken')
    : localStorage.getItem('adminToken') || localStorage.getItem('clientToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
