import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
  const stored = localStorage.getItem('pptarts-auth');
  if (stored) {
    try {
      const { state } = JSON.parse(stored);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    } catch { /* ignore */ }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pptarts-auth');
      window.location.hash = '#/login';
    }
    return Promise.reject(error);
  },
);

export default apiClient;
