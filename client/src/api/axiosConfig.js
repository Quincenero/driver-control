// api/axiosConfig.js
import axios from 'axios';
import { tokenStore } from './tokenStore';

const baseURL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? 'http://localhost:4000/api' : undefined);

if (!baseURL) {
  throw new Error('VITE_API_URL no configurada');
}

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { Accept: 'application/json' },
  
});

// --- Request: inyecta token ---
api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Response: maneja 401 sin duplicar ---
let isHandling401 = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 && !isHandling401) {
      isHandling401 = true;
      tokenStore.clear();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:expired'));
      }
      setTimeout(() => {
        isHandling401 = false;
      }, 0);
    }

    return Promise.reject(error);
  }
);

export default api;