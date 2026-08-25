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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = String(error?.config?.url || '');
    // Only force re-login on true auth failures (401). Do not treat 403 business/forbidden as logout.
    if (status === 401 && url.includes('/api/client')) {
      localStorage.removeItem('clientToken');
      localStorage.removeItem('clientUser');
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
