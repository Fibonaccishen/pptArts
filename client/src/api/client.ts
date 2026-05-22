import axios from 'axios';

function getBaseURL(): string {
  // Electron 需要完整服务端地址（本地 file:// 协议无法走相对路径）
  const isElectron = !!(window as any).electronAPI;
  if (isElectron) {
    const serverUrl = localStorage.getItem('pptarts-server-url');
    if (serverUrl) {
      return serverUrl.replace(/\/+$/, '') + '/api';
    }
  }
  // 网页版（Vite 代理 + 生产同源部署）用相对路径即可
  return '/api';
}

const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
});

// 每次请求前更新 baseURL（支持登录后动态切换服务器）
apiClient.interceptors.request.use((config) => {
  config.baseURL = getBaseURL();
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
