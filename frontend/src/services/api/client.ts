import axios from "axios";
import type { ApiSuccessResponse } from "../../types/api";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api/v1";

const ACCESS_TOKEN_STORAGE_KEY = "ai-mentor-access-token";
const REFRESH_TOKEN_STORAGE_KEY = "ai-mentor-refresh-token";
const AUTH_USER_STORAGE_KEY = "ai-mentor-user";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getAccessToken = (): string | null =>
  window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

export const setAccessToken = (token: string | null): void => {
  if (!token) {
    window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
};

const getRefreshToken = (): string | null =>
  window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);

const setRefreshToken = (token: string | null): void => {
  if (!token) {
    window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token);
};

const logout = (): void => {
  setAccessToken(null);
  setRefreshToken(null);
  window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
};

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const response = await refreshClient.post<
    ApiSuccessResponse<{ accessToken: string; refreshToken: string }>
  >("/auth/refresh", { refreshToken });

  const tokens = response.data.data;
  setAccessToken(tokens.accessToken);
  setRefreshToken(tokens.refreshToken);
  return tokens.accessToken;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status as number | undefined;
    const originalConfig = error?.config as
      | (typeof error.config & {
          _retry?: boolean;
        })
      | null;

    if (!originalConfig || status !== 401) {
      return Promise.reject(error);
    }

    const url = (originalConfig.url ?? "").toString();
    const isAuthRoute =
      url.includes("/auth/login") || url.includes("/auth/register");
    const isRefreshRoute = url.includes("/auth/refresh");

    if (isAuthRoute || isRefreshRoute || originalConfig._retry) {
      return Promise.reject(error);
    }

    originalConfig._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const nextAccessToken = await refreshPromise;
      if (!nextAccessToken) {
        logout();
        return Promise.reject(error);
      }

      originalConfig.headers = originalConfig.headers ?? {};
      originalConfig.headers.Authorization = `Bearer ${nextAccessToken}`;
      return apiClient(originalConfig);
    } catch (refreshError) {
      logout();
      return Promise.reject(refreshError);
    }
  },
);

export const unwrap = <T>(response: ApiSuccessResponse<T>): T => response.data;
