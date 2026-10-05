import axios from 'axios';

/**
 * Shared Axios instance for all API calls.
 * Base URL points to the Spring Boot backend.
 * The request interceptor automatically injects the JWT Bearer token
 * from storage on every outgoing request.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ── Request interceptor ────────────────────────────────────────────────────
// Attach the JWT from localStorage (or sessionStorage) on every request.
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('auth_token') ??
      sessionStorage.getItem('auth_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ───────────────────────────────────────────────────
// Surface clean error messages, handle 401/403 globally, and dispatch expiration events.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const hasToken =
      localStorage.getItem('auth_token') ||
      sessionStorage.getItem('auth_token');

    // Handle token expiry only on 401 Unauthorized
    if (status === 401 && hasToken) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_user');

      // Dispatch event so UI components and AuthContext can respond seamlessly
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:expired', { detail: { status } }));
      }
    }

    return Promise.reject(error);
  }
);

export default api;
