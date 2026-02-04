import axios from 'axios';
import { useAuthStore } from '@loyalty/store';

/**
 * Pre-configured Axios instance with:
 * - Base URL from environment
 * - JWT Authorization header (read from auth store)
 * - Automatic token refresh on 401
 */
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT ─────────────────────────────────

apiClient.interceptors.request.use((config) => {
  const { tokens } = useAuthStore.getState();

  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }

  return config;
});

// ── Response interceptor: auto-refresh on 401 ───────────────────────

let refreshPromise: Promise<string> | null = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh once per request
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/refresh'
    ) {
      originalRequest._retry = true;

      try {
        // Deduplicate concurrent refresh calls
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken();
        }

        const newAccessToken = await refreshPromise;
        refreshPromise = null;

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        refreshPromise = null;
        // Refresh failed -- force logout
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

/**
 * Call the refresh endpoint and update the auth store with new tokens.
 */
async function refreshAccessToken(): Promise<string> {
  const { tokens } = useAuthStore.getState();

  const { data } = await axios.post(
    `${apiClient.defaults.baseURL}/auth/refresh`,
    { refreshToken: tokens?.refreshToken },
    { headers: { 'Content-Type': 'application/json' } },
  );

  const newTokens = {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  };

  useAuthStore.getState().setTokens(newTokens);

  return newTokens.accessToken;
}
